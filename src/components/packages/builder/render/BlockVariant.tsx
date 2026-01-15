'use client'
import React from 'react'
import { X } from 'lucide-react'
import { BLOCK_TYPES, BLOCK_VARIANTS } from '../blocks/blocks'

interface BlockChooserProps {
  blockChooserOpen: { type: string; targetIndex?: number } | null
  onClose: () => void
  onSelectVariant: (blockType: string, variantId: string, targetIndex?: number) => void
}

export const BlockChooser: React.FC<BlockChooserProps> = ({
  blockChooserOpen,
  onClose,
  onSelectVariant,
}) => {
  if (!blockChooserOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Choose a Style for {BLOCK_TYPES.find(bt => bt.type === blockChooserOpen.type)?.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BLOCK_VARIANTS[blockChooserOpen.type]?.map((variant) => (
              <button
                key={variant.id}
                onClick={() => onSelectVariant(blockChooserOpen.type, variant.id, blockChooserOpen.targetIndex)}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="font-semibold text-gray-900 mb-1">{variant.name}</div>
                {variant.description && (
                  <div className="text-sm text-gray-600">{variant.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
