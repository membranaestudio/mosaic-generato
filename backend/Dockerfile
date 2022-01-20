FROM node:12.19.0-alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

ENV PORT 8080
ENV HOST http://localhost

EXPOSE 8080

COPY package*.json ./

RUN npm i

COPY . .

CMD ["npm", "run", "dev"]