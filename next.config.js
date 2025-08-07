/* eslint-disable @typescript-eslint/no-require-imports */

const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
  env: {
    MY_VAR: process.env.MY_VAR || '',
  },
};

module.exports = nextConfig;
