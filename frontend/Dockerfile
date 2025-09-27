# Imagen base con Node.js compatible con Vite
FROM node:20-alpine

# Carpeta de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto de Vite
EXPOSE 3000

# Comando para desarrollo con hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
