import type { NextConfig } from "next";
import fs from 'fs';
import path from 'path';

// Manually load .env from root for frontend access
const envPath = path.resolve(__dirname, '../.env');
const env: Record<string, string> = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.join('=').trim();
    }
  });
}

const nextConfig: NextConfig = {
  env: {
    ...env,
    NEXT_PUBLIC_GEMINI_API_KEY: env.NEXT_PUBLIC_GEMINI_API_KEY || env.GEMINI_API_KEY,
    NEXT_PUBLIC_GEMINI_MODEL: env.NEXT_PUBLIC_GEMINI_MODEL || env.GEMINI_MODEL,
    NEXT_PUBLIC_API_BASE_URL: env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  }
};

export default nextConfig;
