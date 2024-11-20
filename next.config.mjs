import { hostname } from 'os';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['avatars.fastly.steamstatic.com'], // Add the domain here
      },
};



export default nextConfig;
