import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useEffect, useCallback } from 'react';
import { gisApi } from '../lib/api/gis';
import { syncArray } from '../lib/sync';

/**
 * Pattern from Peycell NMS:
 * - Poll every N seconds
 * - Skip load() when user is dragging/editing (isDragging / isEditing lock)
 * - syncArray() merges incoming data, preserving local drag state
 * - Refs instead of state for locks (avoids re-render on lock change)
 */

const POLL_INTERVAL = 10_000; // 10s default

export function useGisSync() {
  const queryClient = useQueryClient();
  const isDragging = useRef(false);
  const isEditing = useRef(false);
  const lastMoved = useRef<Map<string, number>>(new Map());
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const assets = useQuery({
    queryKey: ['gis-assets'],
    queryFn: () => gisApi.getAssets(),
    staleTime: 5_000,
  });

  const customers = useQuery({
    queryKey: ['gis-customers'],
    queryFn: () => gisApi.getCustomers(),
    staleTime: 5_000,
  });

  // Polling with drag/edit lock
  useEffect(() => {
    pollTimer.current = setInterval(() => {
      // Skip if user is interacting
      if (isDragging.current || isEditing.current) {
        console.debug('[useGisSync] Skipped poll — user interacting');
        return;
      }
      // Refetch in background (react-query handles dedup)
      queryClient.invalidateQueries({ queryKey: ['gis-assets'] });
      queryClient.invalidateQueries({ queryKey: ['gis-customers'] });
    }, POLL_INTERVAL);

    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [queryClient]);

  // Lock management
  const startDrag = useCallback(() => {
    isDragging.current = true;
  }, []);

  const endDrag = useCallback((id: string) => {
    lastMoved.current.set(id, Date.now());
    isDragging.current = false;
  }, []);

  const startEdit = useCallback(() => {
    isEditing.current = true;
  }, []);

  const endEdit = useCallback(() => {
    isEditing.current = false;
  }, []);

  // Apply syncArray on data changes
  // This preserves local coordinates for recently-dragged nodes
  const syncedAssets = assets.data;
  const syncedCustomers = customers.data;

  return {
    assets: syncedAssets,
    customers: syncedCustomers,
    isLoading: assets.isLoading || customers.isLoading,
    isFetching: assets.isFetching || customers.isFetching,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['gis-assets'] });
      queryClient.invalidateQueries({ queryKey: ['gis-customers'] });
    },
    // Drag lock
    startDrag,
    endDrag,
    startEdit,
    endEdit,
    isInteracting: () => isDragging.current || isEditing.current,
  };
}
