/** @type {import('next').NextConfig} */

const nextConfig = {
  // Allow your local network IP to access the dev server
  allowedDevOrigins: [
    '192.168.0.168', 
    '192.168.0.168:3000', // Add port if needed
    'localhost:3000'
  ],
};

export default nextConfig;
