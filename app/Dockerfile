FROM node:15.7 as build
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install
COPY . .

RUN npm run build


FROM node:15.7
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install --production
COPY --from=build /usr/src/app/build build
COPY --from=build /usr/src/app/.env .

CMD ["npm", "start"]
