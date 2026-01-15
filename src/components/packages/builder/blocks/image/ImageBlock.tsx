'use client'
import React from 'react'
import Image from 'next/image'
import { Image as ImageIcon } from 'lucide-react'

interface ImageBlockProps {
  content: {
    src?: string
    alt?: string
    caption?: string
  }
}

export default function ImageBlock({ content }: ImageBlockProps) {
  const {
    src = '',
    alt = 'Image description',
    caption = ''
  } = content

  return (
    <div className="py-8 px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
          {src ? (
            <img src={src} alt={alt} className="max-h-full max-w-full object-cover rounded-lg" />
          ) : (
            <ImageIcon className="w-16 h-16 text-gray-400" />
          )}
        </div>
        {caption && <p className="text-gray-600 italic">{caption}</p>}
      </div>
    </div>
  )
}
