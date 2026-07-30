'use client';
import { MapPin, Home, Ruler, Clipboard } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Props { x: number; y: number; lng: number; lat: number; onClose: () => void; onAction: (action: string, coords: {lng: number; lat: number}) => void; }

export function ContextMenu({ x, y, lng, lat, onClose, onAction }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const menuItems = [
    { id: 'add-odp', label: 'Add ODP', icon: MapPin },
    { id: 'add-homepass', label: 'Add Homepass', icon: Home },
    { id: 'measure', label: 'Measure Distance', icon: Ruler },
    { id: 'copy-coords', label: 'Copy Coordinates', icon: Clipboard },
  ];

  const sx = Math.min(x, window.innerWidth - 200);
  const sy = Math.min(y, window.innerHeight - 220);

  return (
    <div ref={ref} className="absolute z-[2000] bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl p-1.5 w-48"
      style={{ left: sx, top: sy }}>
      {menuItems.map(item => (
        <button key={item.id}
          onClick={() => onAction(item.id, { lng, lat })}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-800 rounded text-sm text-neutral-200 text-left">
          <item.icon className="w-4 h-4 text-neutral-400" /> {item.label}
        </button>
      ))}
    </div>
  );
}
