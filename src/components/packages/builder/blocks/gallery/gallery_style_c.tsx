'use client'
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryStyleCProps {
  content: {
    title?: string
    description?: string
    images?: Array<{ id: string; src: string; alt: string; caption?: string }>
  }
}

export default function GalleryStyleC({ content }: GalleryStyleCProps) {
  const {
    title = 'Our Gallery',
    description = 'A collection of our best work',
    images = []
  } = content

  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  if (images.length === 0) {
    return (
      <div className="py-16 px-8 bg-background">
        <div className="max-w-7xl mx-auto text-center py-12 text-muted-foreground">
          <p>No images in gallery. Add images to see them here.</p>
        </div>
      </div>
    )
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

        {/* Main Carousel */}
        <div className="relative mb-8">
          <div className="relative h-[500px] md:h-[600px] rounded-lg overflow-hidden bg-gray-100">
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              className="w-full h-full object-cover"
            />
            {images[currentIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="text-white font-medium text-lg">
                  {images[currentIndex].caption}
                </p>
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-primary scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
