/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@streaming/api-client', '@streaming/shared-types'],
};

module.exports = nextConfig;
