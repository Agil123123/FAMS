/**
 * syncArray - merge new data into existing array, preserving state
 * 
 * Pattern from Peycell NMS: when polling, don't overwrite dragged nodes.
 * Nodes with recent drag (lastMoved < 15s) keep their existing coordinates.
 */
export function syncArray<T extends { id: string; coordinates?: [number, number] }>(
  oldArr: T[] | undefined,
  newArr: T[] | undefined,
  opts?: { dragWindow?: number }
): T[] {
  if (!oldArr) return newArr || [];
  if (!newArr) return oldArr;

  const dragWindow = opts?.dragWindow ?? 15000; // 15s default
  const oldMap = new Map(oldArr.map((i) => [i.id, i]));
  const result: T[] = [];

  newArr.forEach((n) => {
    const existing = oldMap.get(n.id);
    if (existing && (existing as any).lastMoved) {
      const elapsed = Date.now() - (existing as any).lastMoved;
      if (elapsed < dragWindow) {
        // Preserve local coordinates during active drag
        (n as any).coordinates = existing.coordinates;
      }
    }
    if (existing) {
      Object.assign(existing, n);
      result.push(existing);
    } else {
      result.push(n);
    }
  });

  return result;
}

/**
 * Fingerprint - determine if a node's display-relevant data changed.
 * Returns false if the node hasn't changed enough to warrant re-render.
 */
export function hasNodeChanged(
  oldNode: Record<string, any> | undefined,
  newNode: Record<string, any> | undefined
): boolean {
  if (!oldNode || !newNode) return true;
  const keys = ['name', 'status', 'ping_ms', 'coordinates', 'type', 'asset_type'];
  return keys.some((k) => JSON.stringify(oldNode[k]) !== JSON.stringify(newNode[k]));
}
