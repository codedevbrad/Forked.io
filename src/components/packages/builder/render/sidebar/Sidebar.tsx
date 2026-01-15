'use client'
import React, { useState } from 'react'
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Palette } from 'lucide-react'
import {
  BLOCK_TYPES,
  GLOBAL_BLOCK_TYPES,
} from '../../blocks/blocks'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
  DrawerClose,
} from '@/src/components/ui/drawer'
import { ThemeEditor } from './ThemeEditor'
import { GlobalEditorDrawer } from '../../_components/GlobalEditorDrawer'
import { Save, X } from 'lucide-react'

interface ContentBlock {
  id: string
  type: 'hero' | 'about' | 'image' | 'faq' | 'contact' | 'team' | 'quote' | 'gallery'
  content: any
  order: number
  variant?: string
}

interface GlobalBlock {
  id: string
  type: 'header' | 'nav'
  content: any
  isActive: boolean
}

interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
  [key: string]: string
}

interface Page {
  id: string
  name: string
  slug: string
  blocks: ContentBlock[]
  isActive: boolean
}

interface SidebarProps {
  globalBlocks: GlobalBlock[]
  pages: Page[]
  activePageId: string
  newPageName: string
  draggedBlockType: string | null
  openGlobalEditorId: string | null
  themeColors: ThemeColors
  onAddGlobalBlock: (blockType: string) => void
  onUpdateGlobalBlock: (blockId: string, content: any) => void
  onDeleteGlobalBlock: (blockId: string) => void
  onSetActivePageId: (pageId: string) => void
  onDeletePage: (pageId: string) => void
  onSetNewPageName: (name: string) => void
  onCreateNewPage: () => void
  onSetOpenGlobalEditorId: (id: string | null) => void
  onDragStart: (e: React.DragEvent, type: string, blockId?: string) => void
  onDragEnd: () => void
  onAddBlockFromSidebar: (blockType: string) => void
  onUpdateThemeColors: (colors: ThemeColors) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  globalBlocks,
  pages,
  activePageId,
  newPageName,
  draggedBlockType,
  openGlobalEditorId,
  themeColors,
  onAddGlobalBlock,
  onUpdateGlobalBlock,
  onDeleteGlobalBlock,
  onSetActivePageId,
  onDeletePage,
  onSetNewPageName,
  onCreateNewPage,
  onSetOpenGlobalEditorId,
  onDragStart,
  onDragEnd,
  onAddBlockFromSidebar,
  onUpdateThemeColors,
}) => {
  const [isPagesExpanded, setIsPagesExpanded] = useState(true)
  const [isContentBlocksExpanded, setIsContentBlocksExpanded] = useState(true)
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false)

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col min-h-0 overflow-y-auto">
      {/* Theme Colors Section */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Theme Colors</h3>
          <Drawer open={isThemeEditorOpen} onOpenChange={setIsThemeEditorOpen} direction="bottom">
            <DrawerTrigger asChild>
              <button
                className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                  isThemeEditorOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label="Edit theme colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </DrawerTrigger>
            <DrawerContent className="w-full h-[500px]">
              <DrawerHeader className="border-b">
                <DrawerTitle>Edit Theme Colors</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 overflow-y-auto">
                <ThemeEditor themeColors={themeColors} onUpdate={onUpdateThemeColors} />
              </div>
              <DrawerFooter className="border-t">
                <div className="flex items-center gap-2 justify-end">
                  <DrawerClose asChild>
                    <button
                      onClick={() => setIsThemeEditorOpen(false)}
                      className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
                    >
                      <X className="h-4 w-4" />
                      Close
                    </button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <button
                      onClick={() => setIsThemeEditorOpen(false)}
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
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 p-2 rounded-lg border bg-white">
            <div className="p-1.5 rounded bg-gradient-to-br from-blue-500 to-purple-500">
              <Palette className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Color Palette</span>
              <div className="flex items-center space-x-1 mt-1">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: themeColors.primary }}
                  title="Primary"
                />
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: themeColors.secondary }}
                  title="Secondary"
                />
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: themeColors.accent }}
                  title="Accent"
                />
                <span className="text-xs text-gray-500 ml-1">+{Object.keys(themeColors).length - 3} more</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Blocks Section */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Global Elements</h3>
        <div className="space-y-2">
          {GLOBAL_BLOCK_TYPES.map((blockType) => {
            const existingBlock = globalBlocks.find((b) => b.type === blockType.type && b.isActive)
            return (
              <div key={blockType.type} className="flex items-center justify-between">
                <div
                  onClick={() => onAddGlobalBlock(blockType.type)}
                  className={`flex items-center space-x-3 p-2 rounded-lg border cursor-pointer hover:shadow-md transition-all flex-1 ${
                    existingBlock ? 'bg-blue-50 border-blue-200' : 'bg-white'
                  }`}
                >
                  <div className={`p-1 rounded ${blockType.color}`}>
                    <blockType.icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{blockType.name}</span>
                </div>

                {existingBlock && (
                  <div className="flex ml-2 space-x-1">
                    {/* EDIT (Drawer) */}
                    <GlobalEditorDrawer
                      block={existingBlock}
                      title={`Edit ${blockType.name}`}
                      isOpen={openGlobalEditorId === existingBlock.id}
                      onOpenChange={(open) => onSetOpenGlobalEditorId(open ? existingBlock.id : null)}
                      onUpdate={(content) => onUpdateGlobalBlock(existingBlock.id, content)}
                      onClose={() => onSetOpenGlobalEditorId(null)}
                      triggerClassName={`p-1 text-xs hover:text-blue-600 ${
                        openGlobalEditorId === existingBlock.id ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />

                    {/* DELETE */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteGlobalBlock(existingBlock.id)
                      }}
                      className="p-1 text-xs text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Pages Section */}
      <div className="border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => setIsPagesExpanded(!isPagesExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-sm font-semibold text-gray-700">Pages</h3>
          {isPagesExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        {isPagesExpanded && (
          <div className="px-4 pb-4">
            <div className="space-y-2">
              {pages.map((page) => {
                const navBlock = globalBlocks.find((b) => b.type === 'nav' && b.isActive)
                const isInNav = navBlock?.content?.autoSync || navBlock?.content?.items?.some((item: any) => item.pageId === page.id)

                return (
                  <div key={page.id} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <button
                        onClick={() => onSetActivePageId(page.id)}
                        className={`flex-1 text-left px-3 py-2 rounded text-sm ${
                          page.id === activePageId ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page.name}
                      </button>
                      {isInNav && <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">in nav</span>}
                    </div>
                    {pages.length > 1 && (
                      <button onClick={() => onDeletePage(page.id)} className="p-1 text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex space-x-2">
              <input
                type="text"
                value={newPageName}
                onChange={(e) => onSetNewPageName(e.target.value)}
                placeholder="Page name"
                className="flex-1 px-2 py-1 text-sm border rounded"
                onKeyDown={(e) => e.key === 'Enter' && onCreateNewPage()}
              />
              <button onClick={onCreateNewPage} className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {globalBlocks.find((b) => b.type === 'nav' && b.isActive)?.content?.autoSync && (
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Navigation auto-synced with pages</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Block Types */}
      <div className="flex-shrink-0">
        <button
          onClick={() => setIsContentBlocksExpanded(!isContentBlocksExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-200"
        >
          <h3 className="text-sm font-semibold text-gray-700">Content Blocks</h3>
          {isContentBlocksExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        {isContentBlocksExpanded && (
          <div className="px-4 pb-4">
            <div className="space-y-2">
              {BLOCK_TYPES.map((blockType) => (
                <div
                  key={blockType.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, blockType.type)}
                  onDragEnd={onDragEnd}
                  onClick={() => onAddBlockFromSidebar(blockType.type)}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-grab active:cursor-grabbing hover:shadow-md transition-all bg-white ${
                    draggedBlockType === blockType.type ? 'opacity-50' : ''
                  }`}
                >
                  <div className={`p-2 rounded ${blockType.color}`}>
                    <blockType.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{blockType.name}</span>
                  {blockType.hasVariants && (
                    <span className="ml-auto text-xs text-gray-400">Multiple styles</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
