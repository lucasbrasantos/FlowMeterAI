FROM node:20

WORKDIR /usr/src/flowmeterai-app

COPY package*.json ./
RUN npm install
EXPOSE 80
COPY . .
CMD ["npm", "run", "dev"]