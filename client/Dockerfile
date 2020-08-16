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
COPY server.js .
COPY src/ src/

# Build the client
RUN npm run build

# De-escalate privileges
USER node

# Start server
CMD [ "node", "server.js" ]
