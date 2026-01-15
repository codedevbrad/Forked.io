'use client'
import React from 'react'
import dynamic from 'next/dynamic'

// Import services variants
const ServicesStyleA = dynamic(() => import('./services_style_a'))
const ServicesStyleB = dynamic(() => import('./services_style_b'))
const ServicesStyleC = dynamic(() => import('./services_style_c'))

interface Service {
  id: string
  title: string
  subtitle?: string
  description?: string
  image?: string
  link?: string
}

interface ServicesListBlockProps {
  variant: string
  content: {
    title?: string
    description?: string
    services?: Service[]
  }
}

export default function ServicesListBlock({ variant, content }: ServicesListBlockProps) {
  switch (variant) {
    case 'style_a':
      return <ServicesStyleA content={content} />
    case 'style_b':
      return <ServicesStyleB content={content} />
    case 'style_c':
      return <ServicesStyleC content={content} />
    default:
      return <ServicesStyleA content={content} />
  }
}
