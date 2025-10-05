# ETAPA 1: "deps" - Para instalar las dependencias de forma aislada
# Se usa una imagen base de Node.js ligera y segura.
FROM node:20-alpine AS deps

# Establece el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copia SOLO los archivos que definen las dependencias.
# Docker pondrá en caché esta capa. Solo se volverá a ejecutar 'npm install'
# si 'package.json' o 'package-lock.json' cambian.
COPY package*.json ./

# Instala las dependencias del proyecto.
RUN npm install

# -----------------------------------------------------------------------------

# ETAPA 2: "runner" - La imagen final que ejecutará la aplicación
FROM node:20-alpine

WORKDIR /app

# Copia la carpeta 'node_modules' ya instalada de la etapa anterior.
# Esto es mucho más rápido que copiarla desde tu máquina local.
COPY --from=deps /app/node_modules ./node_modules

# Copia el resto del código fuente de tu aplicación.
COPY . .

# Expone el puerto que Vite necesita para que podamos acceder desde el navegador.
EXPOSE 3000

# El comando para iniciar el servidor de desarrollo.
# '--host 0.0.0.0' es crucial para que el servidor sea accesible desde fuera del contenedor.
CMD ["npm", "run", "dev"]