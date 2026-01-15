'use client'
import React from 'react'
import { Mail, Phone, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/src/components/ui/button'

interface QuoteStyleCProps {
  content: {
    title?: string
    subtitle?: string
    description?: string
    formFields?: any
  }
}

export default function QuoteStyleC({ content }: QuoteStyleCProps) {
  const {
    title = 'Get Your Quote',
    subtitle = 'Fast, friendly quotes',
    description = 'Fast, friendly quotes for steel fabrication, architectural steelwork, and on-site welding.',
    formFields = {}
  } = content

  return (
    <div className="w-full bg-background text-foreground">
      {/* HERO — BRUTALIST */}
      <section className="px-10 py-32 border-b border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-8">
            <h1 className="text-5xl xl:text-6xl font-extrabold leading-tight">
              {title}
              {subtitle && (
                <span className="block text-text-secondary mt-4">
                  {subtitle}
                </span>
              )}
            </h1>

            {description && (
              <p className="text-lg text-text-secondary max-w-xl">
                {description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="px-10 py-28">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* FORM */}
          <div>
            <h2 className="text-4xl font-bold leading-tight mb-8">
              Tell Us About
              <br />
              <span className="text-text-secondary">Your Project</span>
            </h2>

            <form className="space-y-6">
              <div>
                <label className="font-medium block mb-1 text-text-primary">Full Name</label>
                <input
                  type="text"
                  className="w-full border border-border rounded-none px-4 py-3 bg-background text-foreground focus:outline-none focus:border-primary"
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
                      className="w-full border border-border rounded-none pl-11 py-3 bg-background text-foreground focus:border-primary"
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
                      className="w-full border border-border rounded-none pl-11 py-3 bg-background text-foreground focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-medium block mb-1 text-text-primary">Project Details</label>
                <textarea
                  rows={5}
                  className="w-full border border-border rounded-none px-4 py-3 bg-background text-foreground focus:border-primary"
                  placeholder="Describe your project, measurements, finishes…"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-none px-10 py-6"
              >
                Submit Quote Request
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </div>

          {/* SIDEBAR INFO */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Why Choose Us</h3>
              <div className="space-y-4 text-text-secondary">
                {['Fast turnaround', 'Competitive pricing', 'Fully insured & certified', '10+ years industry experience'].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <Check className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <p className="font-semibold text-text-primary">{item}</p>
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
