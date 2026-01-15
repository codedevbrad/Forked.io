'use client'
import React from 'react'
import { Edit2, Save, X } from 'lucide-react'
import { BlockRenderer } from '../blocks/blocks'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
  DrawerClose,
} from '@/src/components/ui/drawer'

interface GlobalBlock {
  id: string
  type: 'header' | 'nav'
  content: any
  isActive: boolean
}

interface GlobalEditorDrawerProps {
  block: GlobalBlock
  title: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (content: any) => void
  onClose: () => void
  triggerClassName?: string
}

export const GlobalEditorDrawer: React.FC<GlobalEditorDrawerProps> = ({
  block,
  title,
  isOpen,
  onOpenChange,
  onUpdate,
  onClose,
  triggerClassName,
}) => {
  const defaultClassName = `p-2 hover:text-blue-600 ${
    isOpen ? 'text-blue-600' : 'text-gray-400'
  }`
  
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerTrigger asChild>
        <button
          className={triggerClassName || defaultClassName}
          aria-label={`Edit ${block.type}`}
        >
          <Edit2 className={triggerClassName ? 'w-3 h-3' : 'w-4 h-4'} />
        </button>
      </DrawerTrigger>
      <DrawerContent className="w-full h-full sm:max-w-2xl">
        <DrawerHeader className="border-b">
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto">
          <BlockRenderer
            block={block}
            isEditing={true}
            onUpdate={onUpdate}
          />
        </div>
        <DrawerFooter className="border-t">
          <div className="flex items-center gap-2 justify-end">
            <DrawerClose asChild>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </DrawerClose>
            <DrawerClose asChild>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
