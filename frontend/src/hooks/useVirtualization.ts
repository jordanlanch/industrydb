import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Virtual scrolling hook for large lists
 * Renders only visible items + buffer for better performance
 *
 * @param items - Full list of items
 * @param itemHeight - Height of each item in pixels
 * @param bufferSize - Number of items to render above/below viewport (default: 5)
 * @returns Virtual scrolling state and handlers
 */
export function useVirtualization<T>({
  items,
  itemHeight,
  bufferSize = 5,
}: {
  items: T[];
  itemHeight: number;
  bufferSize?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate visible range
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
  );

  // Get visible items
  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Calculate offset for visible items
  const offsetY = startIndex * itemHeight;

  // Handle scroll event
  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  // Update container height on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
  };
}

/**
 * Infinite scroll hook for pagination
 * Triggers callback when user scrolls near bottom
 *
 * @param callback - Function to call when loading more
 * @param hasMore - Whether there are more items to load
 * @param threshold - Distance from bottom to trigger (default: 200px)
 * @returns Container ref
 */
export function useInfiniteScroll({
  callback,
  hasMore,
  threshold = 200,
  isLoading = false,
}: {
  callback: () => void;
  hasMore: boolean;
  threshold?: number;
  isLoading?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasMore || isLoading) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < threshold) {
        callback();
      }
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [callback, hasMore, threshold, isLoading]);

  return containerRef;
}

/**
 * Debounced search hook
 * Delays execution of search until user stops typing
 *
 * @param value - Search value
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 */
export function useDebouncedValue<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Memoized filter hook
 * Caches filtered results to avoid re-computation
 *
 * @param items - List of items to filter
 * @param filterFn - Filter function
 * @param dependencies - Additional dependencies for memoization
 * @returns Filtered items
 */
export function useMemoizedFilter<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  dependencies: any[] = []
): T[] {
  const [filteredItems, setFilteredItems] = useState<T[]>([]);

  useEffect(() => {
    setFilteredItems(items.filter(filterFn));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, ...dependencies]);

  return filteredItems;
}
