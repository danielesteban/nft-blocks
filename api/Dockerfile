FROM node:erbium

ENV NODE_ENV production

# Create working directory
RUN mkdir -p /usr/src/nft-blocks-api
WORKDIR /usr/src/nft-blocks-api

# Install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm ci

# Copy source
COPY artifacts/ artifacts/
COPY endpoints/ endpoints/
COPY services/ services/
COPY main.js .

# De-escalate privileges
USER node

# Start server
CMD [ "node", "main.js" ]
