'use client'
import React, { useState } from 'react'

interface GalleryStyleBProps {
  content: {
    title?: string
    description?: string
    images?: Array<{ id: string; src: string; alt: string; caption?: string }>
  }
}

export default function GalleryStyleB({ content }: GalleryStyleBProps) {
  const {
    title = 'Our Gallery',
    description = 'A collection of our best work',
    images = []
  } = content

  // Masonry layout - images with varying heights
  const getMasonryClass = (index: number) => {
    const patterns = [
      'row-span-2', // Tall
      '', // Normal
      'row-span-2', // Tall
      '', // Normal
      '', // Normal
      'row-span-2', // Tall
    ]
    return patterns[index % patterns.length]
  }

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

        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[200px]">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`group relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer ${getMasonryClass(index)}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {image.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <p className="text-white p-4 font-medium w-full">
                      {image.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No images in gallery. Add images to see them here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
