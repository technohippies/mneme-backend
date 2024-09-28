FROM node:18

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn install
RUN yarn build

CMD ["yarn", "start"]