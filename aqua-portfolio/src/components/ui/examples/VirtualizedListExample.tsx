'use client';

import React, { useState, useRef } from 'react';
import { 
  VirtualizedList, 
  VirtualizedGrid, 
  InfiniteVirtualizedList,
  VirtualizedListRef 
} from '@/components/ui/VirtualizedList';
import { Skeleton } from '@/components/ui/Skeleton';

// Example data types
interface ListItem {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
}

interface GridItem {
  id: number;
  title: string;
  image: string;
  tags: string[];
}

// Generate mock data
const generateListItems = (count: number, offset = 0): ListItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: offset + i,
    title: `Item ${offset + i + 1}`,
    description: `This is the description for item ${offset + i + 1}. It contains some example text to demonstrate the virtualized list functionality.`,
    category: ['Work', 'Personal', 'Archive'][Math.floor(Math.random() * 3)],
    date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
  }));
};

const generateGridItems = (count: number): GridItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    title: `Project ${i + 1}`,
    image: `https://picsum.photos/300/200?random=${i}`,
    tags: ['React', 'TypeScript', 'Next.js'].slice(0, Math.floor(Math.random() * 3) + 1),
  }));
};

// List item component
const ListItemComponent = ({ item, index }: { item: ListItem; index: number }) => (
  <div className="p-4 border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors">
    <div className="flex justify-between items-start mb-2">
      <h3 className="font-semibold text-gray-900">{item.title}</h3>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 text-xs rounded-full ${
          item.category === 'Work' ? 'bg-blue-100 text-blue-800' :
          item.category === 'Personal' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {item.category}
        </span>
        <span className="text-xs text-gray-500">{item.date}</span>
      </div>
    </div>
    <p className="text-gray-600 text-sm">{item.description}</p>
    <div className="mt-2 text-xs text-gray-400">Item #{index}</div>
  </div>
);

// Grid item component
const GridItemComponent = ({ item }: { item: GridItem }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <div className="h-32 bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
      <span className="text-white font-semibold">{item.title}</span>
    </div>
    <div className="p-3">
      <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
      <div className="flex flex-wrap gap-1">
        {item.tags.map((tag, i) => (
          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="p-4 border-b border-gray-200">
    <div className="flex justify-between items-start mb-2">
      <Skeleton height={20} width="60%" />
      <div className="flex gap-2">
        <Skeleton height={18} width={60} className="rounded-full" />
        <Skeleton height={18} width={80} />
      </div>
    </div>
    <Skeleton height={16} width="100%" className="mb-1" />
    <Skeleton height={16} width="80%" className="mb-2" />
    <Skeleton height={12} width={60} />
  </div>
);

// Main example component
export const VirtualizedListExample = () => {
  const [listItems, setListItems] = useState(() => generateListItems(1000));
  const [gridItems] = useState(() => generateGridItems(500));
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef<VirtualizedListRef>(null);

  // Simulate infinite loading
  const loadMoreItems = async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newItems = generateListItems(50, listItems.length);
    setListItems(prev => [...prev, ...newItems]);
    
    // Stop loading after 2000 items
    if (listItems.length >= 2000) {
      setHasMore(false);
    }
    
    setIsLoading(false);
  };

  const scrollToTop = () => {
    listRef.current?.scrollToTop();
  };

  const scrollToItem = () => {
    const randomIndex = Math.floor(Math.random() * listItems.length);
    listRef.current?.scrollToItem(randomIndex, 'center');
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Virtualized List Examples</h2>
        <p className="text-gray-600 mb-6">
          Demonstrating high-performance rendering of large datasets using virtualization.
        </p>
      </div>

      {/* Basic Virtualized List */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Basic Virtualized List</h3>
          <div className="flex gap-2">
            <button 
              onClick={scrollToTop}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Scroll to Top
            </button>
            <button 
              onClick={scrollToItem}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            >
              Random Item
            </button>
          </div>
        </div>
        
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <VirtualizedList
            ref={listRef}
            items={listItems}
            itemHeight={120}
            height={400}
            renderItem={(item, index) => (
              <ListItemComponent item={item} index={index} />
            )}
            getItemKey={(item) => item.id}
            className="bg-gray-50"
            emptyComponent={<div>No items found</div>}
            loadingComponent={<LoadingSkeleton />}
          />
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Showing {listItems.length.toLocaleString()} items with smooth scrolling
        </div>
      </section>

      {/* Infinite Scroll List */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Infinite Scroll List</h3>
        
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <InfiniteVirtualizedList
            items={listItems}
            itemHeight={120}
            height={400}
            hasNextPage={hasMore}
            isLoading={isLoading}
            onLoadMore={loadMoreItems}
            renderItem={(item, index) => (
              <ListItemComponent item={item} index={index} />
            )}
            getItemKey={(item) => item.id}
            className="bg-gray-50"
            loadingComponent={<LoadingSkeleton />}
          />
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
          <span>
            {listItems.length.toLocaleString()} items loaded
            {isLoading && ' (Loading more...)'}
          </span>
          {!hasMore && <span className="text-green-600">All items loaded</span>}
        </div>
      </section>

      {/* Virtualized Grid */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Virtualized Grid</h3>
        
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <VirtualizedGrid
            items={gridItems}
            itemWidth={200}
            itemHeight={160}
            width={800}
            height={400}
            gap={16}
            renderItem={(item) => <GridItemComponent item={item} />}
            getItemKey={(item) => item.id}
            className="bg-gray-50 p-4"
            emptyComponent={<div>No projects found</div>}
          />
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Grid with {gridItems.length.toLocaleString()} items, 200px × 160px each
        </div>
      </section>

      {/* Variable Height List */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Variable Height List</h3>
        
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <VirtualizedList
            items={listItems}
            itemHeight={(index) => {
              // Simulate variable heights based on content
              const baseHeight = 80;
              const variation = Math.sin(index * 0.1) * 40;
              return Math.max(60, baseHeight + variation);
            }}
            height={400}
            renderItem={(item, index) => (
              <div 
                className="p-4 border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                style={{ 
                  minHeight: Math.max(60, 80 + Math.sin(index * 0.1) * 40)
                }}
              >
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm">
                  {item.description}
                  {index % 3 === 0 && ' This item has extra content to demonstrate variable heights in the virtualized list.'}
                </p>
                <div className="mt-2 text-xs text-gray-400">Variable height item #{index}</div>
              </div>
            )}
            getItemKey={(item) => item.id}
            className="bg-gray-50"
          />
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Each item has different height based on content and index
        </div>
      </section>

      {/* Performance Info */}
      <section className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Performance Benefits</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Only renders visible items, regardless of total dataset size</li>
          <li>• Smooth scrolling performance with thousands of items</li>
          <li>• Memory efficient - constant DOM node count</li>
          <li>• Supports variable item heights and infinite scroll</li>
          <li>• Configurable overscan for smoother scrolling</li>
        </ul>
      </section>
    </div>
  );
};

export default VirtualizedListExample;