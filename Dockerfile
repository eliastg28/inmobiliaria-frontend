# Dockerfile para inmobiliaria-frontend (React + Vite)
FROM node:18 AS build

WORKDIR /app

# 👇 Declarar argumento de build
ARG VITE_BACKEND_URL

# 👇 Exponerlo como variable de entorno para Vite
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

COPY package*.json ./
RUN npm ci

COPY . .

# 👇 Ahora sí Vite verá la variable
RUN npm run build


# Usar Nginx para servir archivos estáticos
FROM nginx:1.25-alpine AS production

WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
