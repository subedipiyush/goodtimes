# Use a Node.js image as the base for building and running your Next.js app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json yarn.lock* package-lock.json* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install --frozen-lockfile; fi

# Copy the rest of your application code
COPY . .

# Build the Next.js application
# This command generates the optimized build artifacts in the .next directory
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy necessary files from the builder stage
# This includes the built Next.js app (.next), public assets, and node_modules for production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
# If you have a 'src' folder (like in your setup), copy it if needed for server-side code
COPY --from=builder /app/src/app ./src/app
COPY --from=builder /app/src/components ./src/components
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js
COPY --from=builder /app/postcss.config.js ./postcss.config.js

# Expose the port that Next.js will run on
EXPOSE 3000

# Set environment variable for the port that Cloud Run will provide
# Next.js will automatically use process.env.PORT if available
ENV PORT 3000

# Command to run the Next.js production server
CMD ["npm", "start"]
