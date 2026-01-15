'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { Eye, Save, Code } from 'lucide-react'
import { updateWebsiteSiteData } from '@/src/domains/website/db'
import { useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'

import {
  BLOCK_TYPES,
  VIEWPORT_CONFIGS,
  getDefaultBlockContent,
} from './blocks/blocks'

import ViewportSandbox, { type ViewportConfig as ViewportSandboxConfig } from './viewportsandbox'
import { Sidebar } from './render/sidebar/Sidebar'
import { PageRenderer } from './render/PageRenderer'
import { BlockChooser } from './render/BlockVariant'

// Types for our page builder
interface ContentBlock {
  id: string
  type: 'hero' | 'about' | 'image' | 'faq' | 'contact' | 'team' | 'quote' | 'gallery' | 'services'
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

interface Page {
  id: string
  name: string
  slug: string
  blocks: ContentBlock[]
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
  [key: string]: string // Allow custom color keys
}

interface SiteData {
  pages: Page[]
  globalBlocks: GlobalBlock[]
  themeColors?: ThemeColors
}

// Viewport types...
type ViewportType = 'desktop' | 'tablet' | 'mobile'

interface WebsiteBuilderProps {
  websiteId: string
  websiteCreationId: string
  initialSiteData?: SiteData
}

export const WebsiteBuilder: React.FC<WebsiteBuilderProps> = ({ websiteId, websiteCreationId, initialSiteData }) => {
  // Initialize state from initialSiteData or defaults
  const [pages, setPages] = useState<Page[]>(
    initialSiteData?.pages || [
      {
        id: '1',
        name: 'Home',
        slug: 'home',
        blocks: [],
        isActive: true,
      },
    ]
  )

  const [globalBlocks, setGlobalBlocks] = useState<GlobalBlock[]>(
    initialSiteData?.globalBlocks || []
  )

  const [themeColors, setThemeColors] = useState<ThemeColors>(
    initialSiteData?.themeColors || {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f1f5f9',
      mutedForeground: '#64748b',
      border: '#e2e8f0',
    }
  )

  const [activePageId, setActivePageId] = useState<string>(pages[0]?.id || '1')

  // ⬇️ Popover editor state (replaces editingBlockId / editingGlobalBlockId)
  const [openBlockEditorId, setOpenBlockEditorId] = useState<string | null>(null)
  const [openGlobalEditorId, setOpenGlobalEditorId] = useState<string | null>(null)

  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false)
  const [newPageName, setNewPageName] = useState<string>('')

  const [draggedBlockType, setDraggedBlockType] = useState<string | null>(null)
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Block chooser state for selecting variants
  const [blockChooserOpen, setBlockChooserOpen] = useState<{ type: string; targetIndex?: number } | null>(null)

  // Viewport state
  const [currentViewport, setCurrentViewport] = useState<ViewportType>('desktop')
  const [customWidth, setCustomWidth] = useState<number>(1200)
  const [customHeight, setCustomHeight] = useState<number>(800)

  // Save state
  const [isSaving, startSaving] = useTransition()
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  // Data viewer state
  const [isDataViewerOpen, setIsDataViewerOpen] = useState<boolean>(false)

  const activePage = pages.find((p) => p.id === activePageId)
  const activeHeader = globalBlocks.find((b) => b.type === 'header' && b.isActive)
  const activeNav = globalBlocks.find((b) => b.type === 'nav' && b.isActive)

  // Save function
  const handleSave = useCallback(async () => {
    const siteData: SiteData = {
      pages,
      globalBlocks,
      themeColors,
    }

    startSaving(async () => {
      setSaveStatus('saving')
      const result = await updateWebsiteSiteData(websiteCreationId, siteData)
      if (result.success) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
        alert(result.error)
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    })
  }, [websiteCreationId, pages, globalBlocks, themeColors])

  const handleDragStart = (e: React.DragEvent, type: string, blockId?: string) => {
    e.dataTransfer.effectAllowed = 'move'
    if (blockId) {
      setDraggedBlockId(blockId)
      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'block', id: blockId }))
    } else {
      setDraggedBlockType(type)
      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'blockType', blockType: type }))
    }
  }

  const handleDragOver = (e: React.DragEvent, index?: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (typeof index === 'number') {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedBlockType(null)
    setDraggedBlockId(null)
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)

    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'))

      if (dragData.type === 'blockType' && activePage) {
        // Check if block has variants
        const blockTypeConfig = BLOCK_TYPES.find(bt => bt.type === dragData.blockType)
        if (blockTypeConfig?.hasVariants) {
          // Open chooser for variant selection
          setBlockChooserOpen({ type: dragData.blockType, targetIndex })
          return
        }

        // Adding new block from sidebar
        const newBlock: ContentBlock = {
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: dragData.blockType as any,
          content: getDefaultBlockContent(dragData.blockType),
          order: targetIndex,
        }

        setPages((prev) =>
          prev.map((page) =>
            page.id === activePageId
              ? {
                  ...page,
                  blocks: [...page.blocks.slice(0, targetIndex), newBlock, ...page.blocks.slice(targetIndex)],
                }
              : page
          )
        )
      } else if (dragData.type === 'block' && activePage && draggedBlockId) {
        // Reordering existing blocks
        const sourceIndex = activePage.blocks.findIndex((b) => b.id === draggedBlockId)
        if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
          const newBlocks = [...activePage.blocks]
          const [movedBlock] = newBlocks.splice(sourceIndex, 1)

          const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
          newBlocks.splice(adjustedTargetIndex, 0, movedBlock)

          setPages((prev) =>
            prev.map((page) => (page.id === activePageId ? { ...page, blocks: newBlocks } : page))
          )
        }
      }
    } catch (error) {
      console.error('Error parsing drag data:', error)
    }

    setDraggedBlockType(null)
    setDraggedBlockId(null)
  }

  const deleteBlock = (blockId: string) => {
    setPages((prev) =>
      prev.map((page) => (page.id === activePageId ? { ...page, blocks: page.blocks.filter((b) => b.id !== blockId) } : page))
    )
    setOpenBlockEditorId(null)
  }

  const updateBlock = (blockId: string, content: any) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === activePageId ? { ...page, blocks: page.blocks.map((b) => (b.id === blockId ? { ...b, content } : b)) } : page
      )
    )
  }

  const createNewPage = () => {
    if (!newPageName.trim()) return

    const newPage: Page = {
      id: `page-${Date.now()}`,
      name: newPageName,
      slug: newPageName.toLowerCase().replace(/\s+/g, '-'),
      blocks: [],
      isActive: false,
    }

    setPages((prev) => [...prev, newPage])
    setActivePageId(newPage.id)
    setNewPageName('')
  }

  const deletePage = (pageId: string) => {
    if (pages.length <= 1) return // Don't delete the last page
    setPages((prev) => prev.filter((p) => p.id !== pageId))
    if (pageId === activePageId) {
      setActivePageId(pages.find((p) => p.id !== pageId)?.id || '')
    }
  }

  const updatePageName = (pageId: string, newName: string) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === pageId ? { ...page, name: newName, slug: newName.toLowerCase().replace(/\s+/g, '-') } : page
      )
    )
  }

  const addGlobalBlock = (blockType: string) => {
    const existingBlock = globalBlocks.find((b) => b.type === blockType)
    if (existingBlock) {
      setGlobalBlocks((prev) => prev.map((b) => (b.type === blockType ? { ...b, isActive: true } : b)))
    } else {
      const newBlock: GlobalBlock = {
        id: `global-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: blockType as any,
        content: getDefaultBlockContent(blockType, undefined, pages),
        isActive: true,
      }
      setGlobalBlocks((prev) => [...prev, newBlock])
    }
  }

  const updateGlobalBlock = (blockId: string, content: any) => {
    setGlobalBlocks((prev) => prev.map((block) => (block.id === blockId ? { ...block, content } : block)))
  }

  const deleteGlobalBlock = (blockId: string) => {
    setGlobalBlocks((prev) => prev.filter((b) => b.id !== blockId))
    setOpenGlobalEditorId(null)
  }

  const syncNavigationWithPages = useCallback(() => {
    const navBlock = globalBlocks.find((b) => b.type === 'nav' && b.isActive)
    if (navBlock && navBlock.content?.autoSync) {
      const newNavItems = pages.map((page) => ({
        label: page.name,
        link: `/${page.slug}`,
        pageId: page.id,
      }))

      const currentNavItems = navBlock.content.items || []
      const hasChanged =
        newNavItems.length !== currentNavItems.length ||
        newNavItems.some(
          (item, index) =>
            !currentNavItems[index] ||
            currentNavItems[index].label !== item.label ||
            currentNavItems[index].link !== item.link ||
            currentNavItems[index].pageId !== item.pageId
        )

      if (hasChanged) {
        updateGlobalBlock(navBlock.id, {
          ...navBlock.content,
          items: newNavItems,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages])

  React.useEffect(() => {
    syncNavigationWithPages()
  }, [pages, syncNavigationWithPages])

  // Sync viewport dimensions when preset changes
  useEffect(() => {
    const config = VIEWPORT_CONFIGS[currentViewport]
    if (config) {
      setCustomWidth(config.width)
      setCustomHeight(config.height)
    }
  }, [currentViewport])

  // Viewport change handler
  const handleViewportChange = (key: string, cfg: { width: number; height: number; name: string; icon: any }) => {
    setCurrentViewport(key as ViewportType)
    setCustomWidth(cfg.width)
    setCustomHeight(cfg.height)
  }

  // Size change handler
  const handleSizeChange = ({ width, height }: { width: number; height: number }) => {
    setCustomWidth(width)
    setCustomHeight(height)
  }

  const addBlockFromSidebar = (blockType: string, variant?: string, targetIndex?: number) => {
    if (!activePage) return

    // Check if this block type has variants
    const blockTypeConfig = BLOCK_TYPES.find(bt => bt.type === blockType)
    if (blockTypeConfig?.hasVariants && !variant) {
      // Open block chooser
      setBlockChooserOpen({ type: blockType, targetIndex })
      return
    }

    const insertIndex = targetIndex !== undefined ? targetIndex : activePage.blocks.length

    const newBlock: ContentBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockType as any,
      content: getDefaultBlockContent(blockType, variant),
      order: insertIndex,
      variant: variant || undefined,
    }

    setPages((prev) =>
      prev.map((page) => 
        page.id === activePageId 
          ? { 
              ...page, 
              blocks: [
                ...page.blocks.slice(0, insertIndex),
                newBlock,
                ...page.blocks.slice(insertIndex).map(b => ({ ...b, order: b.order + 1 }))
              ]
            } 
          : page
      )
    )

    setBlockChooserOpen(null)
  }

  // Get current siteData for viewing
  const getCurrentSiteData = useCallback((): SiteData => {
    return {
      pages,
      globalBlocks,
      themeColors,
    }
  }, [pages, globalBlocks, themeColors])

  return (
<div className="flex h-full w-full">
    {/* Sidebar – fixed width, full height */}
    <aside className="shrink-0 h-full flex">
      <Sidebar
        globalBlocks={globalBlocks}
        pages={pages}
        activePageId={activePageId}
        newPageName={newPageName}
        draggedBlockType={draggedBlockType}
        openGlobalEditorId={openGlobalEditorId}
        themeColors={themeColors}
        onAddGlobalBlock={addGlobalBlock}
        onUpdateGlobalBlock={updateGlobalBlock}
        onDeleteGlobalBlock={deleteGlobalBlock}
        onSetActivePageId={setActivePageId}
        onDeletePage={deletePage}
        onSetNewPageName={setNewPageName}
        onCreateNewPage={createNewPage}
        onSetOpenGlobalEditorId={setOpenGlobalEditorId}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onAddBlockFromSidebar={addBlockFromSidebar}
        onUpdateThemeColors={setThemeColors}
      />
    </aside>

    <BlockChooser
      blockChooserOpen={blockChooserOpen}
      onClose={() => setBlockChooserOpen(null)}
      onSelectVariant={(blockType, variantId, targetIndex) =>
        addBlockFromSidebar(blockType, variantId, targetIndex)
      }
    />

    {/* Main editor column */}
    <div className="flex flex-col flex-1 h-full min-w-0">
      <ViewportSandbox
        configs={VIEWPORT_CONFIGS as Record<string, ViewportSandboxConfig>}
        viewport={currentViewport}
        width={customWidth}
        height={customHeight}
        onViewportChange={handleViewportChange}
        onSizeChange={handleSizeChange}
        title={activePage?.name || 'Page Preview'}
        toolbarRight={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded transition-colors ${
                isPreviewMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Toggle preview mode"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm">{isPreviewMode ? 'Preview' : 'Edit'}</span>
            </button>
            <button
              onClick={() => setIsDataViewerOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              aria-label="View site data"
            >
              <Code className="w-4 h-4" />
              <span className="text-sm">View Data</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || saveStatus === 'saving'}
              className={`flex items-center space-x-2 px-4 py-2 rounded transition-colors ${
                saveStatus === 'success'
                  ? 'bg-green-500 text-white'
                  : saveStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              aria-label="Save website"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm">
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save'}
              </span>
            </button>
          </div>
        }
      >
        <PageRenderer
          activePage={activePage}
          activeHeader={activeHeader}
          activeNav={activeNav}
          isPreviewMode={isPreviewMode}
          draggedBlockId={draggedBlockId}
          dragOverIndex={dragOverIndex}
          openBlockEditorId={openBlockEditorId}
          openGlobalEditorId={openGlobalEditorId}
          onUpdateBlock={updateBlock}
          onDeleteBlock={deleteBlock}
          onUpdateGlobalBlock={updateGlobalBlock}
          onDeleteGlobalBlock={deleteGlobalBlock}
          onSetOpenBlockEditorId={setOpenBlockEditorId}
          onSetOpenGlobalEditorId={setOpenGlobalEditorId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      </ViewportSandbox>
    </div>

    {/* Data Viewer Dialog */}
    <Dialog open={isDataViewerOpen} onOpenChange={setIsDataViewerOpen}>
      <DialogContent className="!max-w-7xl sm:!max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Site Data Viewer</DialogTitle>
          <DialogDescription>
            Current siteData for websiteCreation ID: {websiteCreationId}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto mt-4">
          <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-auto border">
            <code>{JSON.stringify(getCurrentSiteData(), null, 2)}</code>
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  </div>
  )
}
