'use client'
import React from 'react'
import { Save, X } from 'lucide-react'

interface EditorPopoverShellProps {
  title: string
  onClose: () => void
  onSave: () => void
  children: React.ReactNode
  className?: string
}

export const EditorPopoverShell: React.FC<EditorPopoverShellProps> = ({
  title,
  onClose,
  onSave,
  children,
  className = '',
}) => {
  return (
    <div className={`w-[min(92vw,900px)] max-h-[80vh] overflow-auto rounded-lg border bg-white shadow-lg ${className}`}>
      <div className="sticky top-0 left-0 z-10 flex items-center justify-between border-b bg-white/90 px-4 py-3 backdrop-blur">
        <h4 className="text-sm font-semibold">{title}</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
