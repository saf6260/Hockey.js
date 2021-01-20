FROM node:buster-slim

WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install

CMD ["npm", "start"]
