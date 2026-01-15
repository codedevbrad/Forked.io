'use client'
import React from 'react'
import dynamic from 'next/dynamic'

// Import hero variants
const HeroStyleA = dynamic(() => import('./hero_style_a'))
const HeroStyleB = dynamic(() => import('./hero_style_b'))
const HeroStyleC = dynamic(() => import('./hero_style_c'))

interface HeroBlockProps {
  variant: string
  content: any
}

export default function HeroBlock({ variant, content }: HeroBlockProps) {
  switch (variant) {
    case 'style_a':
      return <HeroStyleA content={content} />
    case 'style_b':
      return <HeroStyleB content={content} />
    case 'style_c':
      return <HeroStyleC content={content} />
    default:
      return <HeroStyleA content={content} />
  }
}
