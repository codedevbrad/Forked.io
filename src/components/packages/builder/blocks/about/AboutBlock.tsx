'use client'
import React from 'react'

interface AboutBlockProps {
  content: {
    title?: string
    content?: string
    image?: string
  }
}

export default function AboutBlock({ content }: AboutBlockProps) {
  const {
    title = 'About Us',
    content: aboutContent = 'We are passionate about creating exceptional digital experiences that help businesses grow and succeed.',
    image = ''
  } = content

  return (
    <div className="py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>
        <p className="text-lg text-gray-600 text-center leading-relaxed">{aboutContent}</p>
        {image && (
          <div className="mt-8 flex justify-center">
            <img src={image} alt={title} className="max-w-full h-auto rounded-lg" />
          </div>
        )}
      </div>
    </div>
  )
}
