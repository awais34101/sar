# Production Dockerfile for CRM Business System
FROM node:18-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine as prod
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production
EXPOSE 5000
CMD ["npm", "start"]
