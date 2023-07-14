FROM node:16-alpine
WORKDIR /app
COPY ["package.json","./"]
RUN npm install
COPY .env-deploy .env
COPY . .
RUN npm run build
CMD ["sh", "-c", "npm run start:prod"]
# CMD ["sh", "-c", "npm run typeorm:gen && npm run typeorm:run && npm run start:prod"]
