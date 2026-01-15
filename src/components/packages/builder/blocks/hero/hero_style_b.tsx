'use client'
import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/src/components/ui/button'

interface HeroStyleBProps {
  content: {
    title?: string
    subtitle?: string
    description?: string
    buttonText?: string
    backgroundImage?: string
  }
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  )
}

export default function HeroStyleB({ content }: HeroStyleBProps) {
  const {
    title = 'Welcome to Our Website',
    subtitle = 'Building amazing experiences together',
    description = 'We create exceptional digital experiences',
    buttonText = 'Get Started',
    backgroundImage = ''
  } = content

  return (
    <section className="relative min-h-[90vh] grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Image */}
      <div className="relative">
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt="Hero background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center px-10 py-24 space-y-8 bg-linear-to-b from-black/80 to-black">
        <h1 className="text-5xl xl:text-6xl font-extrabold leading-tight text-white">
          {title}
          {subtitle && (
            <span className="block text-red-500 mt-3">
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
          <div className="flex gap-6">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 px-8 py-6 cursor-pointer text-white rounded-md"
            >
              {buttonText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-6 pt-10 border-t border-zinc-800">
          <Stat label="Years Experience" value="10+" />
          <Stat label="Projects Built" value="200+" />
          <Stat label="Coverage" value="Nationwide" />
        </div>
      </div>
    </section>
  )
}
