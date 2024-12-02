#!/bin/bash

# Variables declaradas
RESOURCE_GROUP="ProyectoFinal2"
ARM_TEMPLATE="arm_template_no_storage.json"
GITHUB_REPO="Manyyy20/FinalProyecto"
STATIC_WEB_APP_NAME="snakeGameStaticWebApp"
FUNCTION_APP_NAME="snakeGameFunctionApp"

# Desplegar el template ARM
echo "Desplegando recursos con el ARM Template..."
az deployment group create --resource-group $RESOURCE_GROUP --template-file $ARM_TEMPLATE

# Verificar si el despliegue fue exitoso
if [ $? -ne 0 ]; then
    echo "Error: El despliegue con el ARM Template falló."
    exit 1
fi

# Configurar CORS para SQL Server
echo "Configurando CORS en el SQL Server..."
az sql server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --server-name snakeGameSqlServer \
    --name AllowAllAzureServices \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0

# Configurar CORS en Function App
echo "Configurando CORS en Function App..."
az functionapp cors add \
    --resource-group $RESOURCE_GROUP \
    --name $FUNCTION_APP_NAME \
    --allowed-origins "https://$STATIC_WEB_APP_NAME.z23.web.core.windows.net"

# Ejecutar el script SQL para crear la tabla Scores
echo "Creando tabla Scores en la base de datos..."
az sql db query -g $RESOURCE_GROUP -s snakeGameSqlServer -n snakeGameDatabase --query-file create_table_scores.sql

if [ $? -ne 0 ]; then
    echo "Error: No se pudo crear la tabla Scores."
    exit 1
fi

# Obtener el Deployment Token de Static Web App
echo "Obteniendo Deployment Token..."
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list --name $STATIC_WEB_APP_NAME --resource-group $RESOURCE_GROUP --query "properties.apiKey" -o tsv)

# Guardar el token como secreto en GitHub
echo "Guardando el Deployment Token como secreto en GitHub..."
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN -b "$DEPLOYMENT_TOKEN" -R $GITHUB_REPO

if [ $? -ne 0 ]; then
    echo "Error: No se pudo agregar el secreto en GitHub."
    exit 1
fi

# Desplegar código de Function App
echo "Desplegando Function App..."
func azure functionapp publish $FUNCTION_APP_NAME

# Confirmación final
echo "Despliegue completado correctamente. Revisa el workflow de GitHub Actions para el build."
