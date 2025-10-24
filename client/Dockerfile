FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install
COPY . .

RUN npm install -g @expo/cli


RUN apk add --no-cache bash coreutils

EXPOSE 8081 19000 19001 19002
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV TERM=xterm-256color
ENV FORCE_COLOR=1

CMD ["bash", "-c", "npx expo start --tunnel"]
