'use client'
import React from 'react'
import dynamic from 'next/dynamic'

// Import quote variants
const QuoteStyleA = dynamic(() => import('./quote_style_a'))
const QuoteStyleB = dynamic(() => import('./quote_style_b'))
const QuoteStyleC = dynamic(() => import('./quote_style_c'))
const QuoteStyleD = dynamic(() => import('./quote_style_d'))

interface QuoteBlockProps {
  variant: string
  content: any
}

export default function QuoteBlock({ variant, content }: QuoteBlockProps) {
  switch (variant) {
    case 'style_a':
      return <QuoteStyleA content={content} />
    case 'style_b':
      return <QuoteStyleB content={content} />
    case 'style_c':
      return <QuoteStyleC content={content} />
    case 'style_d':
      return <QuoteStyleD content={content} />
    default:
      return <QuoteStyleA content={content} />
  }
}
