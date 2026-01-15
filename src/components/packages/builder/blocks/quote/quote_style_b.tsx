'use client'
import React from 'react'
import { Mail, Phone, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/src/components/ui/button'

interface QuoteStyleBProps {
  content: {
    title?: string
    subtitle?: string
    description?: string
    backgroundImage?: string
    formFields?: any
  }
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  )
}

export default function QuoteStyleB({ content }: QuoteStyleBProps) {
  const {
    title = 'Get Your Quote',
    subtitle = 'Fast, friendly quotes',
    description = 'Fast, friendly quotes for steel fabrication, architectural steelwork, and on-site welding.',
    backgroundImage = 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1500',
    formFields = {}
  } = content

  return (
    <div className="w-full bg-background text-foreground">
      {/* HERO — SPLIT */}
      <section className="relative min-h-[60vh] grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Image */}
        <div className="relative">
          {backgroundImage && (
            <img
              src={backgroundImage}
              alt="Steelwork background"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-background/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-10 py-24 space-y-8 bg-linear-to-b from-background/80 to-background">
          <h1 className="text-5xl xl:text-6xl font-extrabold leading-tight">
            {title}
            {subtitle && (
              <span className="block text-primary mt-3">
                {subtitle}
              </span>
            )}
          </h1>

          {description && (
            <p className="text-lg text-text-secondary max-w-xl">
              {description}
            </p>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-6 pt-10 border-t border-border">
            <Stat label="Quote Turnaround" value="24hrs" />
            <Stat label="Years Experience" value="10+" />
            <Stat label="Projects Completed" value="200+" />
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="px-8 py-28 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* FORM */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Tell Us About Your Project</h2>

            <form className="space-y-6">
              <div>
                <label className="font-medium block mb-1 text-text-primary">Full Name</label>
                <input
                  type="text"
                  className="w-full border border-border rounded-md px-4 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-medium block mb-1 text-text-primary">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-text-secondary" />
                    <input
                      type="email"
                      className="w-full border border-border rounded-md pl-11 py-3 bg-background text-foreground focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium block mb-1 text-text-primary">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-text-secondary" />
                    <input
                      type="tel"
                      className="w-full border border-border rounded-md pl-11 py-3 bg-background text-foreground focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-medium block mb-1 text-text-primary">Project Details</label>
                <textarea
                  rows={5}
                  className="w-full border border-border rounded-md px-4 py-3 bg-background text-foreground focus:ring-2 focus:ring-primary"
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
              <div className="space-y-4">
                {['Fast turnaround', 'Competitive pricing', 'Fully insured & certified', '10+ years industry experience'].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-background border border-border">
                    <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <p className="text-text-secondary">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
