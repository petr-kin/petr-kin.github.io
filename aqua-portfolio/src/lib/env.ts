// Environment configuration with proper TypeScript typing and validation

export const env = {
  // Site Configuration
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://petrkindlmann.dev',
  SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Petr Kindlmann Portfolio',
  
  // Development
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  // Performance
  ENABLE_ANIMATIONS: process.env.NEXT_PUBLIC_ENABLE_ANIMATIONS !== 'false',
  REDUCED_MOTION_DEFAULT: process.env.NEXT_PUBLIC_REDUCED_MOTION_DEFAULT === 'true',
  
  // Social Media
  TWITTER_HANDLE: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@petrkindlmann',
  GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/petrkindlmann',
  LINKEDIN_URL: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://linkedin.com/in/petrkindlmann',
  
  // Content
  BLOG_POSTS_PER_PAGE: parseInt(process.env.BLOG_POSTS_PER_PAGE || '10'),
  CASE_STUDIES_PER_PAGE: parseInt(process.env.CASE_STUDIES_PER_PAGE || '6'),
  
  // Analytics (optional)
  GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  
  // API Configuration
  API_SECRET_KEY: process.env.API_SECRET_KEY,
  
  // Email Configuration
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || 'thepetr@gmail.com',
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  
  // Image Optimization
  CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  IMAGE_QUALITY: parseInt(process.env.NEXT_PUBLIC_IMAGE_QUALITY || '85'),
} as const;

// Type-safe environment variable access
export type EnvConfig = typeof env;

// Validation function to ensure required environment variables are set
export function validateEnv() {
  const requiredEnvVars: Array<keyof typeof env> = [
    'SITE_URL',
    'SITE_NAME',
    'CONTACT_EMAIL'
  ];

  const missingVars = requiredEnvVars.filter(
    (key) => !env[key] || env[key] === ''
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

// Call validation in development mode
if (env.IS_DEVELOPMENT) {
  try {
    validateEnv();
  } catch (error) {
    console.warn('Environment validation warning:', error);
  }
}