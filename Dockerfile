FROM node:24.13.1-slim
WORKDIR /truck-manager-api
COPY ./entrypoint.sh /truck-manager-api/entrypoint.sh
COPY ./.env /truck-manager-api/dist/
COPY ./.env /truck-manager-api/
COPY ./dist /truck-manager-api/dist
COPY ./package.json /truck-manager-api/
COPY ./prisma /truck-manager-api/dist/prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates
RUN npm install --omit=dev
RUN chmod +x ./entrypoint.sh
EXPOSE 3000
CMD ["./entrypoint.sh"]