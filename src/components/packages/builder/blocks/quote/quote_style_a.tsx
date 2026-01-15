'use client'
import React from 'react'
import { Mail, Phone, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/src/components/ui/button'

interface QuoteStyleAProps {
  content: {
    title?: string
    subtitle?: string
    description?: string
    backgroundImage?: string
    formFields?: any
  }
}

export default function QuoteStyleA({ content }: QuoteStyleAProps) {
  const {
    title = 'Get Your Quote',
    subtitle = 'Fast, friendly quotes for your project',
    description = 'Fast, friendly quotes for steel fabrication, architectural steelwork, and on-site welding.',
    backgroundImage = 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1500',
    formFields = {}
  } = content

  return (
    <div className="w-full bg-background text-foreground">
      {/* HERO */}
      <section className="relative w-full min-h-[50vh] flex items-center px-8 py-24 overflow-hidden">
        {backgroundImage && (
          <div className="absolute inset-0">
            <img
              src={backgroundImage}
              alt="Steelwork background"
              className="w-full h-full object-cover object-center opacity-80"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/95" />

        <div className="relative w-full space-y-6 flex items-center flex-col text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-none">
            {title}
            {subtitle && (
              <span className="block text-muted-foreground mt-3">
                {subtitle}
              </span>
            )}
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="px-8 py-24 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* FORM */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Tell Us About Your Project</h2>

            <form className="space-y-6">
              <div>
                <label className="font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full border border-border rounded-md px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-medium block mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      className="w-full border border-border rounded-md pl-11 py-3 bg-background focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium block mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      className="w-full border border-border rounded-md pl-11 py-3 bg-background focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-medium block mb-1">Project Details</label>
                <textarea
                  rows={5}
                  className="w-full border border-border rounded-md px-4 py-3 bg-background focus:ring-2 focus:ring-primary"
                  placeholder="Describe your project, measurements, finishes…"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Submit Quote Request
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </div>

          {/* SIDEBAR INFO */}
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-bold mb-4">Why Choose Us</h3>
              <ul className="space-y-3 text-muted-foreground">
                {['Fast turnaround', 'Competitive pricing', 'Fully insured & certified', '10+ years industry experience'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
