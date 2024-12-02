#!/bin/bash

RESOURCE_GROUP="ProyectoFinal2"
ARM_TEMPLATE="arm_template_no_storage.json"
STATIC_WEB_APP_NAME="snakeGameStaticWebApp"
FUNCTION_APP_NAME="functionfunk"

# Desplegar recursos con ARM Template
echo "Desplegando recursos con ARM Template..."
az deployment group create --resource-group $RESOURCE_GROUP --template-file $ARM_TEMPLATE

if [ $? -ne 0 ]; then
    echo "Error: El despliegue con ARM Template falló."
    exit 1
fi

# Configurar CORS en SQL Server
echo "Configurando CORS en el SQL Server..."
az sql server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --server-name snakeGameSqlServer \
    --name AllowAllAzureServices \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0

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
echo "Configurando variables de entorno..."
az functionapp config appsettings set --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP --settings "SQL_CONNECTION=Your_Connection_String" "ANOTHER_VARIABLE=Another_Value"

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
