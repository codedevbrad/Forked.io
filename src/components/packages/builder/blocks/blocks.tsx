'use client'
import React from 'react';
import { Layout, Image, FileText, HelpCircle, MapPin, Phone, Users, Monitor, Tablet, Smartphone, Quote, Grid3x3, Briefcase } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import block components
const HeroBlock = dynamic(() => import('./hero/HeroBlock'), { ssr: false });
const QuoteBlock = dynamic(() => import('./quote/QuoteBlock'), { ssr: false });
const AboutBlock = dynamic(() => import('./about/AboutBlock'), { ssr: false });
const ImageBlock = dynamic(() => import('./image/ImageBlock'), { ssr: false });
const FAQBlock = dynamic(() => import('./faq/FAQBlock'), { ssr: false });
const GalleryBlock = dynamic(() => import('./gallery/GalleryBlock'), { ssr: false });
const ServicesListBlock = dynamic(() => import('./services/ServicesListBlock'), { ssr: false });

interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  icon: React.ComponentType<any>;
}

type ViewportType = 'desktop' | 'tablet' | 'mobile';

// Types for our page builder
interface ContentBlock {
  id: string;
  type: 'hero' | 'about' | 'image' | 'faq' | 'contact' | 'team' | 'quote' | 'gallery' | 'services';
  content: any;
  order: number;
  variant?: string; // For multiple versions/styles of the same block type
}

interface GlobalBlock {
  id: string;
  type: 'header' | 'nav';
  content: any;
  isActive: boolean;
}

interface Page {
  id: string;
  name: string;
  slug: string;
  blocks: ContentBlock[];
  isActive: boolean;
}

// Block type definitions
export const BLOCK_TYPES = [
  { type: 'hero', name: 'Hero Section', icon: Layout, color: 'bg-blue-500', hasVariants: true },
  { type: 'quote', name: 'Quote Section', icon: Quote, color: 'bg-indigo-500', hasVariants: true },
  { type: 'gallery', name: 'Gallery', icon: Grid3x3, color: 'bg-pink-500', hasVariants: true },
  { type: 'services', name: 'Services List', icon: Briefcase, color: 'bg-teal-500', hasVariants: true },
  { type: 'about', name: 'About Section', icon: FileText, color: 'bg-green-500' },
  { type: 'image', name: 'Image Block', icon: Image, color: 'bg-purple-500' },
  { type: 'faq', name: 'FAQ Section', icon: HelpCircle, color: 'bg-orange-500' },
  { type: 'contact', name: 'Contact Section', icon: Phone, color: 'bg-red-500' },
];

// Block variants for blocks that have multiple versions
export const BLOCK_VARIANTS: Record<string, Array<{ id: string; name: string; description?: string }>> = {
  hero: [
    { id: 'style_a', name: 'Style A - Full Width with Background', description: 'Centered hero with background image' },
    { id: 'style_b', name: 'Style B - Split Layout', description: 'Split screen with image and content' },
    { id: 'style_c', name: 'Style C - Minimalist', description: 'Clean layout with side-by-side content' },
  ],
  quote: [
    { id: 'style_a', name: 'Style A - Standard Form', description: 'Traditional form layout with sidebar' },
    { id: 'style_b', name: 'Style B - Split Form', description: 'Split layout with enhanced sidebar' },
    { id: 'style_c', name: 'Style C - Minimalist', description: 'Clean, minimal form design' },
    { id: 'style_d', name: 'Style D - Compact', description: 'Compact form layout' },
  ],
  gallery: [
    { id: 'style_a', name: 'Style A - Grid Layout', description: 'Clean grid with equal-sized images' },
    { id: 'style_b', name: 'Style B - Masonry', description: 'Pinterest-style masonry layout' },
    { id: 'style_c', name: 'Style C - Carousel', description: 'Horizontal scrolling carousel' },
  ],
  services: [
    { id: 'style_a', name: 'Style A - Grid Cards', description: 'Three-column grid with image cards' },
    { id: 'style_b', name: 'Style B - Alternating List', description: 'Full-width alternating layout with images' },
    { id: 'style_c', name: 'Style C - Compact Grid', description: 'Four-column compact grid layout' },
  ],
};

// Global block types (header/nav)
export const GLOBAL_BLOCK_TYPES = [
  { type: 'header', name: 'Header', icon: Layout, color: 'bg-indigo-500' },
  { type: 'nav', name: 'Navigation', icon: Layout, color: 'bg-cyan-500' },
];

// Viewport configurations
export const VIEWPORT_CONFIGS: Record<ViewportType, ViewportConfig> = {
  desktop: { name: 'Desktop', width: 1200, height: 800, icon: Monitor },
  tablet: { name: 'Tablet', width: 768, height: 1024, icon: Tablet },
  mobile: { name: 'Mobile', width: 375, height: 667, icon: Smartphone },
};

// Default content for different block types
export const getDefaultBlockContent = (type: string, variant?: string, pages?: Page[]) => {
  switch (type) {
    case 'header':
      return {
        title: 'Your Site Title',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        height: 'h-16'
      };
    case 'nav':
      // Auto-generate nav items from pages
      const defaultNavItems = pages ? pages.map(page => ({
        label: page.name,
        link: `/${page.slug}`,
        pageId: page.id
      })) : [
        { label: 'Home', link: '/', pageId: null }
      ];
      
      return {
        items: defaultNavItems,
        backgroundColor: '#f8f9fa',
        textColor: '#374151',
        hoverColor: '#3b82f6',
        alignment: 'left',
        autoSync: true // Flag to indicate if nav should sync with pages
      };
    case 'hero':
      return {
        title: 'Welcome to Our Website',
        subtitle: 'Building amazing experiences together',
        description: 'We create exceptional digital experiences',
        buttonText: 'Get Started',
        backgroundImage: '',
        variant: variant || 'style_a'
      };
    case 'quote':
      return {
        title: 'Get Your Quote',
        subtitle: 'Fast, friendly quotes for your project',
        description: 'Fast, friendly quotes for steel fabrication, architectural steelwork, and on-site welding.',
        variant: variant || 'style_a',
        formFields: {
          name: '',
          email: '',
          phone: '',
          serviceType: '',
          projectDetails: ''
        }
      };
    case 'gallery':
      return {
        title: 'Our Gallery',
        description: 'A collection of our best work',
        variant: variant || 'style_a',
        images: [
          { id: '1', src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', alt: 'Gallery image 1', caption: '' },
          { id: '2', src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', alt: 'Gallery image 2', caption: '' },
          { id: '3', src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', alt: 'Gallery image 3', caption: '' },
          { id: '4', src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800', alt: 'Gallery image 4', caption: '' },
          { id: '5', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', alt: 'Gallery image 5', caption: '' },
          { id: '6', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', alt: 'Gallery image 6', caption: '' },
        ]
      };
    case 'services':
      return {
        title: 'Our Services',
        description: 'We offer a wide range of services to meet your needs',
        variant: variant || 'style_a',
        services: [
          { 
            id: '1', 
            title: 'Service One', 
            subtitle: 'Category', 
            description: 'Detailed description of the service and what it includes.', 
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', 
            link: '#' 
          },
          { 
            id: '2', 
            title: 'Service Two', 
            subtitle: 'Category', 
            description: 'Detailed description of the service and what it includes.', 
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', 
            link: '#' 
          },
          { 
            id: '3', 
            title: 'Service Three', 
            subtitle: 'Category', 
            description: 'Detailed description of the service and what it includes.', 
            image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800', 
            link: '#' 
          },
        ]
      };
    case 'about':
      return {
        title: 'About Us',
        content: 'We are passionate about creating exceptional digital experiences that help businesses grow and succeed.',
        image: ''
      };
    case 'image':
      return {
        src: '',
        alt: 'Image description',
        caption: 'Image caption'
      };
    case 'faq':
      return {
        title: 'Frequently Asked Questions',
        items: [
          { question: 'What services do you offer?', answer: 'We offer comprehensive digital solutions.' },
          { question: 'How can I get started?', answer: 'Simply contact us to discuss your needs.' }
        ]
      };
    case 'contact':
      return {
        title: 'Get In Touch',
        email: 'hello@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, City, State 12345'
      };
    case 'team':
      return {
        title: 'Our Team',
        members: [
          { name: 'John Doe', role: 'CEO', image: '', bio: 'Passionate leader with 10+ years experience.' },
          { name: 'Jane Smith', role: 'CTO', image: '', bio: 'Tech expert driving innovation forward.' }
        ]
      };
    default:
      return {};
  }
};

// Block renderer components
export const BlockRenderer: React.FC<{ block: ContentBlock | GlobalBlock; isEditing: boolean; onUpdate: (content: any) => void }> = ({ 
  block, 
  isEditing, 
  onUpdate 
}) => {
  const { type, content } = block;

  if (isEditing) {
    return (
      <div className="border-2 border-dashed border-blue-300 p-4 rounded-lg bg-blue-50">
        <BlockEditor type={type} content={content} onUpdate={onUpdate} />
      </div>
    );
  }

  switch (type) {
    case 'header':
      return (
        <div 
          className={`px-8 py-4 flex items-center justify-between border-b ${content.height || 'h-16'}`}
          style={{ backgroundColor: content.backgroundColor, color: content.textColor }}
        >
          <div className="flex items-center space-x-3">
            <div className="text-xl font-bold">{content.title || 'Your Site Title'}</div>
          </div>
        </div>
      );
    
    case 'nav':
      return (
        <nav 
          className="px-8 py-3 border-b"
          style={{ backgroundColor: content.backgroundColor, color: content.textColor }}
        >
          <ul className={`flex space-x-6 ${content.alignment === 'center' ? 'justify-center' : content.alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
            {(content.items || []).map((item: any, index: number) => (
              <li key={index}>
                <button
                  onClick={() => {
                    // If this nav item is connected to a page, switch to that page
                    if (item.pageId) {
                      // In a real app, you'd handle routing here
                      if (typeof window !== 'undefined') {
                        console.log(`Navigate to page: ${item.pageId}`);
                      }
                    }
                  }}
                  className={`hover:opacity-75 transition-opacity cursor-pointer ${
                    item.pageId ? 'font-medium' : ''
                  }`}
                  style={{ color: content.textColor }}
                  onMouseEnter={(e) => e.currentTarget.style.color = content.hoverColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = content.textColor}
                >
                  {item.label || ''}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      );
    
    case 'hero':
      const heroVariant = content.variant || 'style_a';
      return <HeroBlock variant={heroVariant} content={content} />;
    
    case 'quote':
      const quoteVariant = content.variant || 'style_a';
      return <QuoteBlock variant={quoteVariant} content={content} />;
    
    case 'gallery':
      const galleryVariant = content.variant || 'style_a';
      return <GalleryBlock variant={galleryVariant} content={content} />;
    
    case 'services':
      const servicesVariant = content.variant || 'style_a';
      return <ServicesListBlock variant={servicesVariant} content={content} />;
    
    case 'about':
      return <AboutBlock content={content} />;
    
    case 'image':
      return <ImageBlock content={content} />;
    
    case 'faq':
      return <FAQBlock content={content} />;
    
    case 'contact':
      return (
        <div className="py-16 px-8 bg-gray-900 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">{content.title}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>{content.phone}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>@</span>
                <span>{content.email}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>{content.address}</span>
              </div>
            </div>
          </div>
        </div>
      );
    
    case 'team':
      return (
        <div className="py-16 px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">{content.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.members.map((member: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <Users className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-blue-600 mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    
    default:
      return <div className="p-4 bg-gray-100 text-center">Unknown block type: {type}</div>;
  }
};

// Block editor component for inline editing
const BlockEditor: React.FC<{ type: string; content: any; onUpdate: (content: any) => void }> = ({ 
  type, 
  content, 
  onUpdate 
}) => {
  const handleInputChange = (field: string, value: any) => {
    onUpdate({ ...content, [field]: value });
  };

  const handleArrayChange = (field: string, index: number, subField: string, value: any) => {
    const newArray = [...content[field]];
    newArray[index] = { ...newArray[index], [subField]: value };
    onUpdate({ ...content, [field]: newArray });
  };

  const addArrayItem = (field: string, defaultItem: any) => {
    onUpdate({ ...content, [field]: [...content[field], defaultItem] });
  };

  const removeArrayItem = (field: string, index: number) => {
    const newArray = content[field].filter((_: any, i: number) => i !== index);
    onUpdate({ ...content, [field]: newArray });
  };

  switch (type) {
    case 'header':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Your Site Title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Background Color</label>
            <input
              type="color"
              value={content.backgroundColor}
              onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
              className="w-full p-2 border rounded-md h-10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Text Color</label>
            <input
              type="color"
              value={content.textColor}
              onChange={(e) => handleInputChange('textColor', e.target.value)}
              className="w-full p-2 border rounded-md h-10"
            />
          </div>
        </div>
      );

    case 'nav':
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="autoSync"
              checked={content.autoSync || false}
              onChange={(e) => handleInputChange('autoSync', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoSync" className="text-sm font-medium">
              Auto-sync with pages
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Background Color</label>
            <input
              type="color"
              value={content.backgroundColor}
              onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
              className="w-full p-2 border rounded-md h-10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Text Color</label>
            <input
              type="color"
              value={content.textColor}
              onChange={(e) => handleInputChange('textColor', e.target.value)}
              className="w-full p-2 border rounded-md h-10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hover Color</label>
            <input
              type="color"
              value={content.hoverColor}
              onChange={(e) => handleInputChange('hoverColor', e.target.value)}
              className="w-full p-2 border rounded-md h-10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alignment</label>
            <select
              value={content.alignment}
              onChange={(e) => handleInputChange('alignment', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          
          {!content.autoSync && (
            <div>
              <label className="block text-sm font-medium mb-2">Navigation Items</label>
              {content.items.map((item: any, index: number) => (
                <div key={index} className="border p-3 rounded-md space-y-2 mb-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleArrayChange('items', index, 'label', e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                    placeholder="Label"
                  />
                  <input
                    type="text"
                    value={item.link}
                    onChange={(e) => handleArrayChange('items', index, 'link', e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                    placeholder="Link (e.g., /about)"
                  />
                  <button
                    onClick={() => removeArrayItem('items', index)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('items', { label: '', link: '', pageId: null })}
                className="text-blue-500 text-sm hover:text-blue-700"
              >
                + Add Nav Item
              </button>
            </div>
          )}
          
          {content.autoSync && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                Navigation items are automatically synchronized with your pages. 
                Create, rename, or delete pages to update the navigation.
              </p>
            </div>
          )}
        </div>
      );

    case 'hero':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              type="text"
              value={content.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Button Text</label>
            <input
              type="text"
              value={content.buttonText}
              onChange={(e) => handleInputChange('buttonText', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      );
    
    case 'about':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              value={content.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className="w-full p-2 border rounded-md h-24"
            />
          </div>
        </div>
      );
    
    case 'image':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="text"
              value={content.src}
              onChange={(e) => handleInputChange('src', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alt Text</label>
            <input
              type="text"
              value={content.alt}
              onChange={(e) => handleInputChange('alt', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Caption</label>
            <input
              type="text"
              value={content.caption}
              onChange={(e) => handleInputChange('caption', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      );
    
    case 'faq':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">FAQ Items</label>
            {content.items.map((item: any, index: number) => (
              <div key={index} className="border p-3 rounded-md space-y-2 mb-2">
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => handleArrayChange('items', index, 'question', e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                  placeholder="Question"
                />
                <textarea
                  value={item.answer}
                  onChange={(e) => handleArrayChange('items', index, 'answer', e.target.value)}
                  className="w-full p-2 border rounded-md text-sm h-16"
                  placeholder="Answer"
                />
                <button
                  onClick={() => removeArrayItem('items', index)}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('items', { question: '', answer: '' })}
              className="text-blue-500 text-sm hover:text-blue-700"
            >
              + Add FAQ Item
            </button>
          </div>
        </div>
      );

    case 'contact':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={content.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              value={content.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              value={content.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full p-2 border rounded-md h-16"
            />
          </div>
        </div>
      );

    case 'team':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Team Members</label>
            {content.members.map((member: any, index: number) => (
              <div key={index} className="border p-3 rounded-md space-y-2 mb-2">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => handleArrayChange('members', index, 'name', e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={member.role}
                  onChange={(e) => handleArrayChange('members', index, 'role', e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                  placeholder="Role"
                />
                <textarea
                  value={member.bio}
                  onChange={(e) => handleArrayChange('members', index, 'bio', e.target.value)}
                  className="w-full p-2 border rounded-md text-sm h-16"
                  placeholder="Bio"
                />
                <button
                  onClick={() => removeArrayItem('members', index)}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('members', { name: '', role: '', image: '', bio: '' })}
              className="text-blue-500 text-sm hover:text-blue-700"
            >
              + Add Team Member
            </button>
          </div>
        </div>
      );

    case 'gallery':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Gallery Title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={content.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-2 border rounded-md h-20"
              placeholder="Gallery description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Images</label>
            {(content.images || []).map((image: any, index: number) => (
              <div key={image.id || index} className="border p-3 rounded-md space-y-2 mb-2">
                <div className="flex gap-2">
                  {image.src && (
                    <img src={image.src} alt={image.alt || ''} className="w-20 h-20 object-cover rounded" />
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={image.src || ''}
                      onChange={(e) => handleArrayChange('images', index, 'src', e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                      placeholder="Image URL"
                    />
                    <input
                      type="text"
                      value={image.alt || ''}
                      onChange={(e) => handleArrayChange('images', index, 'alt', e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                      placeholder="Alt text"
                    />
                    <input
                      type="text"
                      value={image.caption || ''}
                      onChange={(e) => handleArrayChange('images', index, 'caption', e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                      placeholder="Caption (optional)"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeArrayItem('images', index)}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Remove Image
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('images', { 
                id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
                src: '', 
                alt: '', 
                caption: '' 
              })}
              className="text-blue-500 text-sm hover:text-blue-700"
            >
              + Add Image
            </button>
          </div>
        </div>
      );

    case 'services':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Services Title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={content.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-2 border rounded-md h-20"
              placeholder="Services description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Services</label>
            {(content.services || []).map((service: any, index: number) => (
              <div key={service.id || index} className="border p-3 rounded-md space-y-2 mb-2">
                <div className="flex gap-2">
                  {service.image && (
                    <img src={service.image} alt={service.title || ''} className="w-20 h-20 object-cover rounded" />
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={service.title || ''}
                      onChange={(e) => handleArrayChange('services', index, 'title', e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                      placeholder="Service Title"
                    />
                    <input
                      type="text"
                      value={service.subtitle || ''}
                      onChange={(e) => handleArrayChange('services', index, 'subtitle', e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                      placeholder="Subtitle (optional)"
                    />
                    <input
                      type="text"
                      value={service.image || ''}
                      onChange={(e) => handleArrayChange('services', index, 'image', e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                      placeholder="Image URL"
                    />
                    <textarea
                      value={service.description || ''}
                      onChange={(e) => handleArrayChange('services', index, 'description', e.target.value)}
                      className="w-full p-2 border rounded-md text-sm h-16"
                      placeholder="Description"
                    />
                    <input
                      type="text"
                      value={service.link || ''}
                      onChange={(e) => handleArrayChange('services', index, 'link', e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                      placeholder="Link URL (optional)"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeArrayItem('services', index)}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Remove Service
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('services', { 
                id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
                title: '', 
                subtitle: '', 
                description: '', 
                image: '', 
                link: '' 
              })}
              className="text-blue-500 text-sm hover:text-blue-700"
            >
              + Add Service
            </button>
          </div>
        </div>
      );

    default:
      return <div className="p-4 text-center">Editor for {type} not implemented</div>;
  }
};