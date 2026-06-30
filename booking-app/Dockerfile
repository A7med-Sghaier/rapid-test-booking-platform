FROM node:16-bullseye

WORKDIR /usr/src/app

RUN corepack disable \
    && npm install -g yarn@1.22.22

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]
