FROM node:erbium

# Set production env
ENV NODE_ENV production

# Create working directory
RUN mkdir -p /usr/src/nft-blocks-client
WORKDIR /usr/src/nft-blocks-client

# Install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm ci

# Copy source
COPY index.css .
COPY index.html .
COPY rollup.config.js .
COPY screenshot.png .
COPY server.js .
COPY src/ src/

# Build the client
ARG api
ARG ipfs
ARG network
ARG tokens
RUN API=$api IPFS_GATEWAY=$ipfs NETWORK_ID=$network TOKENS_ADDRESS=$tokens npm run build

# De-escalate privileges
USER node

# Start server
CMD [ "node", "server.js" ]
