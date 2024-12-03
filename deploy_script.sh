#!/bin/bash

# Variables del entorno
RESOURCE_GROUP="ProyectoFinal2"
ARM_TEMPLATE="arm_template_no_storage.json"
STATIC_WEB_APP_NAME="snakeGameStaticWebApp"
FUNCTION_APP_NAME="functionfunk"
SQL_SERVER_NAME="snakegamesqlserver"
SQL_DATABASE_NAME="snakeGameDatabase"
SQL_ADMIN_USERNAME="sqladmin"
SQL_ADMIN_PASSWORD="Password22"
CURRENT_IP="4.152.25.8"
REAL_IP="77.247.126.140"
# Desplegar recursos con ARM Template
echo "Desplegando recursos con ARM Template..."
az deployment group create --resource-group $RESOURCE_GROUP --template-file $ARM_TEMPLATE

if [ $? -ne 0 ]; then
    echo "Error: El despliegue con ARM Template falló."
    exit 1
fi

# Obtener la IP pública actual correcta

# Configurar reglas de firewall en SQL Server
echo "Configurando reglas de firewall en SQL Server..."

az sql server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --server $SQL_SERVER_NAME \
    --name AllowCurrentIP \
    --start-ip-address $CURRENT_IP \
    --end-ip-address $CURRENT_IP

az sql server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --server $SQL_SERVER_NAME \
    --name AllowCurrentIP \
    --start-ip-address $REAL_IP \
    --end-ip-address $REAL_IP

if [ $? -ne 0 ]; then
    echo "Error: No se pudieron configurar las reglas de firewall."
    exit 1
fi

# Crear la tabla en la base de datos
echo "Creando tabla 'Scores' en la base de datos..."
sqlcmd -S "$SQL_SERVER_NAME.database.windows.net" -d $SQL_DATABASE_NAME -U $SQL_ADMIN_USERNAME -P $SQL_ADMIN_PASSWORD -i create_table_scores.sql

if [ $? -ne 0 ]; then
    echo "Error: No se pudo crear la tabla 'Scores'."
    exit 1
fi

# Publicar la Function App
echo "Publicando Function App..."
cd api
func azure functionapp publish $FUNCTION_APP_NAME --node
if [ $? -ne 0 ]; then
    echo "Error: No se pudo publicar la Function App."
    exit 1
fi
cd ..
#test
# Configurar variables de entorno adicionales para la Function App
echo "Configurando variables de entorno adicionales para Function App..."
az functionapp config appsettings set --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP --settings \
    DB_USER=$SQL_ADMIN_USERNAME \
    DB_PASSWORD=$SQL_ADMIN_PASSWORD \
    DB_SERVER=$SQL_SERVER_NAME.database.windows.net \
    DB_DATABASE=$SQL_DATABASE_NAME \
    SQL_CONNECTION="Server=tcp:$SQL_SERVER_NAME.database.windows.net,1433;Initial Catalog=$SQL_DATABASE_NAME;Persist Security Info=False;User ID=$SQL_ADMIN_USERNAME;Password=$SQL_ADMIN_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

if [ $? -ne 0 ]; then
    echo "Error: No se pudieron configurar las variables de entorno adicionales."
    exit 1
fi

# Obtener la URL de Static Web App y configurar CORS en la Function App
echo "Configurando CORS en Function App..."
STATIC_WEB_APP_URL=$(az staticwebapp show --name $STATIC_WEB_APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostname" -o tsv)

az functionapp cors add --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP --allowed-origins "https://$STATIC_WEB_APP_URL"

if [ $? -ne 0 ]; then
    echo "Error: No se pudo configurar CORS en la Function App."
    exit 1
fi

# Configurar Deployment Token en GitHub
echo "Obteniendo Deployment Token..."
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list --name $STATIC_WEB_APP_NAME --resource-group $RESOURCE_GROUP --query "properties.apiKey" -o tsv)

echo "Guardando Deployment Token en GitHub..."
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN -b "$DEPLOYMENT_TOKEN" -R Manyyy20/FinalProyecto

if [ $? -ne 0 ]; then
    echo "Error: No se pudo agregar el secreto en GitHub."
    exit 1
fi

echo "Despliegue completado exitosamente."
