'use client'
import React from 'react'
import dynamic from 'next/dynamic'

// Import gallery variants
const GalleryStyleA = dynamic(() => import('./gallery_style_a'))
const GalleryStyleB = dynamic(() => import('./gallery_style_b'))
const GalleryStyleC = dynamic(() => import('./gallery_style_c'))

interface GalleryBlockProps {
  variant: string
  content: {
    title?: string
    description?: string
    images?: Array<{ id: string; src: string; alt: string; caption?: string }>
  }
}

export default function GalleryBlock({ variant, content }: GalleryBlockProps) {
  switch (variant) {
    case 'style_a':
      return <GalleryStyleA content={content} />
    case 'style_b':
      return <GalleryStyleB content={content} />
    case 'style_c':
      return <GalleryStyleC content={content} />
    default:
      return <GalleryStyleA content={content} />
  }
}
