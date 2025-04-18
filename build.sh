#!/bin/bash

echo "Iniciando proceso de construcción..."

# Instalar dependencias
echo "Instalando dependencias..."
npm install

# Construir el frontend y el backend
echo "Construyendo la aplicación..."
npm run build

# Verificar si la construcción fue exitosa
if [ -d "dist" ]; then
  echo "Construcción completada con éxito"
  echo "Contenido de dist:"
  ls -la dist
else
  echo "Error: La carpeta dist no se ha creado."
  exit 1
fi

echo "Proceso de construcción finalizado."