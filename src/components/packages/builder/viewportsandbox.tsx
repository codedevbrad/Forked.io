'use client'
import React, { useState, useRef, useCallback } from 'react'
import { Maximize2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type ViewportKey = 'desktop' | 'tablet' | 'mobile' | string

export type ViewportConfig = {
  name: string
  width: number
  height: number
  icon: LucideIcon
}

type ViewportSandboxProps = {
  configs: Record<ViewportKey, ViewportConfig>
  viewport: ViewportKey
  width: number
  height: number
  onViewportChange: (key: ViewportKey, cfg: ViewportConfig) => void
  onSizeChange: (next: { width: number; height: number }) => void
  title?: string
  toolbarRight?: React.ReactNode
  className?: string
  children: React.ReactNode
}

function DimInput({
  value,
  onChange,
  min,
  max,
  ariaLabel,
}: {
  value: number
  onChange: (n: number) => void
  min: number
  max: number
  ariaLabel: string
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => {
        const n = parseInt(e.target.value, 10)
        if (Number.isFinite(n)) onChange(Math.max(min, Math.min(max, n)))
      }}
      className="w-16 px-2 py-1 border rounded text-center"
      min={min}
      max={max}
      aria-label={ariaLabel}
    />
  )
}

export default function ViewportSandbox({
  configs,
  viewport,
  width,
  height,
  onViewportChange,
  onSizeChange,
  title = 'Preview',
  toolbarRight,
  className,
  children,
}: ViewportSandboxProps) {
  const currentCfg = configs[viewport]
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null)
  const viewportFrameRef = useRef<HTMLDivElement>(null)

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    if (viewportFrameRef.current) {
      const rect = viewportFrameRef.current.getBoundingClientRect()
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: width,
        startHeight: height,
      }
    }
  }, [width, height])

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeRef.current) return

    const deltaX = e.clientX - resizeRef.current.startX
    const deltaY = e.clientY - resizeRef.current.startY

    const newWidth = Math.max(320, Math.min(1920, resizeRef.current.startWidth + deltaX))
    const newHeight = Math.max(200, Math.min(2000, resizeRef.current.startHeight + deltaY))

    onSizeChange({ width: newWidth, height: newHeight })
  }, [isResizing, onSizeChange])

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false)
    resizeRef.current = null
  }, [])

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
      document.body.style.cursor = 'nwse-resize'
      document.body.style.userSelect = 'none'
      return () => {
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleResizeEnd)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isResizing, handleResizeMove, handleResizeEnd])

  return (
    <div className={`flex flex-col h-full min-h-0 ${className ?? ''}`}>
      {/* Toolbar */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {Object.entries(configs).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => onViewportChange(key, cfg)}
                className={`flex items-center space-x-1 px-3 py-2 rounded transition-colors ${
                  viewport === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <cfg.icon className="w-4 h-4" />
                <span className="text-sm">{cfg.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <DimInput
              value={width}
              onChange={(n) => onSizeChange({ width: n, height })}
              min={320}
              max={1920}
              ariaLabel="Preview width"
            />
            <span>×</span>
            <DimInput
              value={height}
              onChange={(n) => onSizeChange({ width, height: n })}
              min={200}
              max={2000}
              ariaLabel="Preview height"
            />
            <span>px</span>
          </div>

          {toolbarRight && (
            <div className="flex items-center space-x-2">
              {toolbarRight}
            </div>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0 overflow-auto bg-gray-100 p-4 md:p-8">
        <div className="flex justify-center w-full min-h-full">
          {/* 🔑 Rounded frame controls overflow */}
          <div
            ref={viewportFrameRef}
            className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col ring-1 ring-black/10 relative"
            style={{
              width: '100%',
              maxWidth: `${width}px`,
              minHeight: `${height}px`,
            }}
          >
            {/* Resize handle - top right */}
            <button
              onMouseDown={handleResizeStart}
              className={`absolute top-0 right-0 z-20 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-bl-lg transition-colors cursor-nwse-resize ${
                isResizing ? 'bg-blue-700' : ''
              }`}
              aria-label="Resize viewport"
              title="Drag to resize viewport"
            >
              <Maximize2 className="w-4 h-4 rotate-45" />
            </button>

            {/* Faux browser bar */}
            <div className="shrink-0 bg-gray-800 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <span className="text-sm ml-2">
                  {title} — {width}×{height}
                </span>
              </div>
              <div className="text-xs text-gray-300">
                {currentCfg?.name ?? 'Custom'}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 relative overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
