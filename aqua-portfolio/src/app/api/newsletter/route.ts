import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Email subscriber store (in production, use database)
const subscribersStore = new Set<string>();

// Validation schema
const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2).max(100).optional(),
});

// Rate limiting function
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 10; // Max 10 requests per hour

  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = newsletterSchema.parse(body);

    // Check if already subscribed
    if (subscribersStore.has(validatedData.email)) {
      return NextResponse.json(
        { 
          message: 'You\'re already subscribed to our newsletter!',
          success: true 
        },
        { status: 200 }
      );
    }

    // In production, you would:
    // 1. Add to email service (Mailchimp, ConvertKit, etc.)
    // 2. Store in database with subscription preferences
    // 3. Send welcome email
    // 4. Add double opt-in confirmation
    
    // Add to mock store
    subscribersStore.add(validatedData.email);

    // In production, log to proper logging service instead of console
    if (process.env.NODE_ENV === 'development') {
      console.log('Newsletter subscription:', {
        ...validatedData,
        timestamp: new Date().toISOString(),
        ip
      });
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json(
      { 
        message: 'Successfully subscribed! Welcome to the newsletter.',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid email format', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Subscription failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return subscriber count for public stats (if desired)
  return NextResponse.json({
    subscriberCount: subscribersStore.size,
    message: 'Newsletter API is working'
  });
}