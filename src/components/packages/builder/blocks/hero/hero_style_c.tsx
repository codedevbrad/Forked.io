'use client'
import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/src/components/ui/button'

interface HeroStyleCProps {
  content: {
    title?: string
    subtitle?: string
    description?: string
    buttonText?: string
    backgroundImage?: string
  }
}

export default function HeroStyleC({ content }: HeroStyleCProps) {
  const {
    title = 'Welcome to Our Website',
    subtitle = 'Building amazing experiences together',
    description = 'We create exceptional digital experiences',
    buttonText = 'Get Started',
    backgroundImage = ''
  } = content

  return (
    <section className="px-10 py-32 border-b border-zinc-800 bg-black text-zinc-100">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <div className="space-y-8">
          <h1 className="text-5xl xl:text-6xl font-extrabold leading-tight">
            {title}
            {subtitle && (
              <span className="block text-zinc-400 mt-4">
                {subtitle}
              </span>
            )}
          </h1>

          {description && (
            <p className="text-lg text-zinc-400 max-w-xl">
              {description}
            </p>
          )}

          {buttonText && (
            <div className="flex gap-6 pt-4">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 rounded-none px-10 py-6"
              >
                {buttonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Image */}
        {backgroundImage && (
          <div className="relative aspect-[4/3] border border-zinc-800">
            <img
              src={backgroundImage}
              alt="Hero image"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </section>
  )
}
