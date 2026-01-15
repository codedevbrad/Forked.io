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

interface ServicesStyleAProps {
  content: {
    title?: string
    description?: string
    services?: Service[]
  }
}

export default function ServicesStyleA({ content }: ServicesStyleAProps) {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {service.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                )}
                <div className="p-6">
                  {service.subtitle && (
                    <p className="text-sm text-blue-600 font-semibold mb-2 uppercase tracking-wide">
                      {service.subtitle}
                    </p>
                  )}
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    {service.title}
                  </h3>
                  {service.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {service.description}
                    </p>
                  )}
                  {service.link && (
                    <a
                      href={service.link}
                      className="text-blue-600 font-semibold hover:text-blue-800 inline-flex items-center gap-2"
                    >
                      Learn More
                      <svg
                        className="w-4 h-4"
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
