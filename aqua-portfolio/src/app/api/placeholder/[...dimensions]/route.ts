import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dimensions: string[] }> }
) {
  try {
    const { dimensions } = await params
    const [width, height] = dimensions
    const w = parseInt(width) || 400
    const h = parseInt(height) || 225

    // Create a simple SVG placeholder
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f1f5f9"/>
        <rect x="20" y="20" width="${w-40}" height="${h-40}" fill="#e2e8f0" rx="8"/>
        <circle cx="${w/2}" cy="${h/2-20}" r="30" fill="#cbd5e1"/>
        <rect x="${w/2-40}" y="${h/2+20}" width="80" height="8" fill="#cbd5e1" rx="4"/>
        <rect x="${w/2-30}" y="${h/2+35}" width="60" height="6" fill="#e2e8f0" rx="3"/>
        <text x="${w/2}" y="${h-15}" text-anchor="middle" fill="#64748b" font-family="system-ui" font-size="12">
          ${w}×${h} Placeholder
        </text>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Placeholder API error:', error)
    return NextResponse.json({ error: 'Invalid dimensions' }, { status: 400 })
  }
}