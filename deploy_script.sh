#!/bin/bash

# Variables
RESOURCE_GROUP="ProyectoFinal2"
ARM_TEMPLATE="arm_template_no_storage.json"
STATIC_WEB_APP_NAME="snakeGameStaticWebApp"
FUNCTION_APP_NAME="functionfunk"
SQL_SERVER_NAME="snakeGameSqlServer"
SQL_DATABASE_NAME="snakeGameDatabase"
SQL_ADMIN_USERNAME="sqladmin"
SQL_ADMIN_PASSWORD="Password22"

# Desplegar recursos con ARM Template
echo "Desplegando recursos con ARM Template..."
az deployment group create --resource-group $RESOURCE_GROUP --template-file $ARM_TEMPLATE

if [ $? -ne 0 ]; then
    echo "Error: El despliegue con ARM Template falló."
    exit 1
fi

# Obtener la IP pública actual
CURRENT_IP=$(curl -s https://api.ipify.org)

# Configurar CORS para permitir la IP actual
echo "Configurando reglas de firewall para la IP actual: $CURRENT_IP..."
az sql server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --server $SQL_SERVER_NAME \
    --name AllowClientIP \
    --start-ip-address $CURRENT_IP \
    --end-ip-address $CURRENT_IP

if [ $? -ne 0 ]; then
    echo "Error: No se pudieron configurar las reglas de firewall para la IP actual."
    exit 1
fi


# Crear la tabla 'Scores' en la base de datos
echo "Creando tabla 'Scores' en la base de datos..."
sqlcmd -S "$SQL_SERVER_NAME.database.windows.net" \
       -d $SQL_DATABASE_NAME \
       -U $SQL_ADMIN_USERNAME \
       -P $SQL_ADMIN_PASSWORD \
       -i create_table_scores.sql

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

# Configurar variables de entorno para Function App
echo "Configurando variables de entorno para la Function App..."
az functionapp config appsettings set \
    --name $FUNCTION_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings "SQL_CONNECTION=Your_Connection_String" "ANOTHER_VARIABLE=Another_Value"

if [ $? -ne 0 ]; then
    echo "Error: No se pudieron configurar las variables de entorno."
    exit 1
fi

# Configurar el Deployment Token en GitHub
echo "Obteniendo Deployment Token..."
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list --name $STATIC_WEB_APP_NAME --resource-group $RESOURCE_GROUP --query "properties.apiKey" -o tsv)

echo "Guardando Deployment Token en GitHub..."
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN -b "$DEPLOYMENT_TOKEN" -R Manyyy20/FinalProyecto

if [ $? -ne 0 ]; then
    echo "Error: No se pudo agregar el secreto en GitHub."
    exit 1
fi

echo "Despliegue completado exitosamente."
