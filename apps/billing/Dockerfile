FROM node:22-alpine AS development

WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml first for caching
COPY package.json ./
COPY pnpm-lock.yaml ./
# Install pnpm globally
RUN npm install -g pnpm
# Install project dependencies
RUN pnpm install
# Copy the rest of the application code
COPY . .
# Build the application (assuming this creates a 'dist' folder)
RUN pnpm run build

FROM node:22-alpine AS production

# Set the Node environment variable
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml for production dependencies
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install only production dependencies
RUN pnpm install --production

COPY . .
COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/billing/main"]