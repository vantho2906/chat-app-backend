FROM node:12-alpine
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY .env-local .env
COPY . .
ENV PORT =3307
RUN npm run build
CMD ["npm", "run", "start:prod"]