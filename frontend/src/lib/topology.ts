/**
 * Topology parenting — tree structure for fiber trace
 * Pattern from Peycell NMS: every node has a `parent` field.
 * Build index once, then traverse upstream/downstream in O(1).
 */

export interface TopoNode {
  id: string;
  name?: string;
  type?: string;
  coordinates?: [number, number];
  parent?: string | null;
  [key: string]: any;
}

export interface TopologyIndex {
  /** Map of parent ID → list of children */
  children: Record<string, TopoNode[]>;
  /** Map of node ID → node (fast lookup) */
  nodeMap: Record<string, TopoNode>;
  /** Map of child ID → parent node */
  parentMap: Record<string, TopoNode>;
}

/**
 * Build topology index from flat arrays.
 * Standard pattern from Peycell NMS renderSmart().
 */
export function buildTopologyIndex(
  assets: TopoNode[],
  customers: TopoNode[],
  routers?: TopoNode[]
): TopologyIndex {
  const all = [...assets, ...customers, ...(routers || [])];
  const index: TopologyIndex = {
    children: {},
    nodeMap: {},
    parentMap: {},
  };

  // Build nodeMap
  all.forEach((n) => {
    if (!n.id) return;
    index.nodeMap[String(n.id).toLowerCase()] = n;
  });

  // Build children + parentMap
  all.forEach((n) => {
    if (!n.id) return;
    const parents = parseParentField(n.parent);
    parents.forEach((pId) => {
      const pKey = pId.toLowerCase();
      if (!index.children[pKey]) index.children[pKey] = [];
      index.children[pKey].push(n);

      const parent = index.nodeMap[pKey];
      if (parent) {
        index.parentMap[String(n.id).toLowerCase()] = parent;
      }
    });
  });

  return index;
}

/**
 * Parse parent field (comma-separated string or array)
 */
function parseParentField(parent: any): string[] {
  if (!parent) return [];
  if (Array.isArray(parent)) return parent.map(String);
  if (typeof parent === 'string') {
    return parent.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Trace upstream — find all ancestors of a node
 */
export function traceUpstream(index: TopologyIndex, nodeId: string): TopoNode[] {
  const result: TopoNode[] = [];
  const visited = new Set<string>();
  let current = index.nodeMap[nodeId.toLowerCase()];
  if (!current?.parent) return [];

  // Get immediate parent
  const parents = parseParentField(current.parent);
  for (const pId of parents) {
    const parent = index.nodeMap[pId.toLowerCase()];
    if (parent && !visited.has(parent.id)) {
      visited.add(parent.id);
      result.push(parent);
      // Recurse
      result.push(...traceUpstream(index, parent.id));
    }
  }
  return result;
}

/**
 * Trace downstream — find all descendants of a node
 */
export function traceDownstream(index: TopologyIndex, nodeId: string): TopoNode[] {
  const result: TopoNode[] = [];
  const visited = new Set<string>();
  const queue = [nodeId.toLowerCase()];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const children = index.children[current];
    if (children) {
      children.forEach((child) => {
        if (!visited.has(child.id)) {
          result.push(child);
          queue.push(child.id.toLowerCase());
        }
      });
    }
  }

  return result;
}

/**
 * Get all cable paths from a parent to its children.
 * Returns LineString GeoJSON for rendering.
 */
export function getDownstreamCables(
  index: TopologyIndex,
  nodeId: string
): number[][][] {
  const paths: number[][][] = [];
  const parent = index.nodeMap[nodeId.toLowerCase()];
  if (!parent?.coordinates) return paths;

  const children = index.children[nodeId.toLowerCase()] || [];
  for (const child of children) {
    if (child.coordinates) {
      paths.push([parent.coordinates, child.coordinates]);
      // Recurse
      paths.push(...getDownstreamCables(index, child.id));
    }
  }

  return paths;
}
