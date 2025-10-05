# Frontend Angular - build and serve with nginx

FROM node:20-alpine AS build
WORKDIR /app

COPY my-frontend-clean/package*.json ./
RUN npm ci

COPY my-frontend-clean/ ./
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY my-frontend-clean/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/my-frontend-clean/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
