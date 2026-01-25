# Dockerfile para inmobiliaria-frontend (React + Vite)
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
COPY . .

RUN npm ci && npm run build

# Usar Nginx para servir archivos estáticos
FROM nginx:1.25-alpine AS production
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .

# Copiar configuración personalizada de Nginx si tienes (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
