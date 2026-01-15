'use client'
import React from 'react'
import { Mail, Phone } from 'lucide-react'

interface QuoteStyleDProps {
  content: {
    title?: string
    subtitle?: string
    description?: string
    backgroundImage?: string
    formFields?: any
  }
}

export default function QuoteStyleD({ content }: QuoteStyleDProps) {
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
      <section className="relative w-full h-[40vh] flex items-center justify-center overflow-hidden">
        {backgroundImage && (
          <>
            <img
              src={backgroundImage}
              alt="Steelwork background"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background"></div>
          </>
        )}

        <div className="relative text-center px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="bg-card border-y border-border py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 px-6">
          {/* FORM */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Tell Us About Your Project</h2>

            <form className="space-y-6">
              <div>
                <label className="font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full border border-border rounded-md px-4 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-medium block mb-1">Email</label>
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
                  <label className="font-medium block mb-1">Phone</label>
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
                <label className="font-medium block mb-1">Project Details</label>
                <textarea
                  rows={5}
                  className="w-full border border-border rounded-md px-4 py-3 bg-background text-foreground focus:ring-2 focus:ring-primary"
                  placeholder="Describe your project, measurements, finishes…"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-md text-lg font-semibold transition"
              >
                Submit Quote Request
              </button>
            </form>
          </div>

          {/* SIDEBAR INFO */}
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-bold mb-4">Why Choose Us</h3>
              <ul className="space-y-3 text-text-secondary">
                {['Fast turnaround', 'Competitive pricing', 'Fully insured & certified', '10+ years industry experience'].map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
