'use client'
import React from 'react'

interface Service {
  id: string
  title: string
  subtitle?: string
  description?: string
  image?: string
  link?: string
}

interface ServicesStyleCProps {
  content: {
    title?: string
    description?: string
    services?: Service[]
  }
}

export default function ServicesStyleC({ content }: ServicesStyleCProps) {
  const {
    title = 'Our Services',
    description = 'We offer a wide range of services to meet your needs',
    services = []
  } = content

  return (
    <div className="py-16 px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-4xl font-bold mb-4">{title}</h2>
            )}
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
        )}

        {services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                {service.image && (
                  <div className="relative h-40 overflow-hidden bg-gray-100">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                )}
                <div className="p-5 text-center">
                  {service.subtitle && (
                    <p className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wide">
                      {service.subtitle}
                    </p>
                  )}
                  <h3 className="text-lg font-bold mb-2 text-gray-900">
                    {service.title}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  {service.link && (
                    <a
                      href={service.link}
                      className="text-blue-600 text-sm font-semibold hover:text-blue-800 inline-flex items-center gap-1 mx-auto"
                    >
                      Learn More
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No services added. Add services to see them here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
