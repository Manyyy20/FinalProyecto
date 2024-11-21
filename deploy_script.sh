#!/bin/bash

# Variables declaradas en el template ARM
RESOURCE_GROUP="ProyectoFinal2"
ARM_TEMPLATE="arm_template_no_storage.json"
GITHUB_REPO="Manyyy20/FinalProyecto"
STATIC_WEB_APP_NAME="snakeGameStaticWebApp" # Declarado en el template ARM

# Desplegar el template ARM
echo "Desplegando recursos con el ARM Template..."
az deployment group create --resource-group $RESOURCE_GROUP --template-file $ARM_TEMPLATE

# Verificar si el despliegue fue exitoso
if [ $? -ne 0 ]; then
    echo "Error: El despliegue con el ARM Template falló."
    exit 1
fi

# Obtener el Deployment Token
echo "Obteniendo Deployment Token de la Static Web App..."
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list --name $STATIC_WEB_APP_NAME --resource-group $RESOURCE_GROUP --query "properties.apiKey" -o tsv)

# Verificar si el token fue obtenido correctamente
if [ -z "$DEPLOYMENT_TOKEN" ]; then
    echo "Error: No se pudo obtener el Deployment Token."
    exit 1
fi

# Agregar el token como secreto en GitHub
echo "Guardando el token como secreto en GitHub..."
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN -b "$DEPLOYMENT_TOKEN" -R $GITHUB_REPO

# Verificar si el secreto fue agregado correctamente
if [ $? -eq 0 ]; then
    echo "Secreto agregado exitosamente en GitHub."
else
    echo "Error: No se pudo agregar el secreto en GitHub."
    exit 1
fi

# Confirmación final
echo "Despliegue completado correctamente. Revisa el workflow de GitHub Actions para verificar el build."
