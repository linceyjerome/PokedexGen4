# Use an official Node.js runtime as a parent image
FROM node:lts

COPY package*.json ./
RUN npm install

COPY ./src ./src/
COPY ./public ./public/
COPY ./index.html ./
COPY ./vite.config.ts ./
COPY ./tsconfig*.node.json ./

ADD *.cjs ./

RUN npm run build
# Start the app using npm
CMD ["npm", "run", "preview"]
