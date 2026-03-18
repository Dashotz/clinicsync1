import { NextResponse } from 'next/server';

// Browsers still request `/favicon.ico` even when metadata icons are set.
// Serving an SVG here avoids a binary .ico file and prevents 404s.
export function GET() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6466F1"/>
      <stop offset="1" stop-color="#3B82F6"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#g)"/>
  <path fill="#fff" d="M26 18c-3 0-6 3-6 7v9c0 7 4 12 12 12s12-5 12-12v-9c0-4-3-7-6-7-2 0-3 1-4 2-1-1-2-2-4-2zm-1 16v-9c0-1 1-2 2-2 2 0 3 2 5 2s3-2 5-2c1 0 2 1 2 2v9c0 4-2 7-7 7s-7-3-7-7z"/>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

