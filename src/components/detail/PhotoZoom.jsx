import { useCallback, useEffect, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw, X } from 'lucide-react';
import { Image } from '@/components/ui/image';

const MIN_SCALE = 1;
const MAX_SCALE = 5;

const clamp = (value) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

const toolButton =
  'flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 text-white transition-colors hover:border-white/70 hover:bg-white/10 disabled:opacity-40';

export default function PhotoZoom({ src, alt, onClose }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef(null);
  const dragRef = useRef(null);

  const changeScale = useCallback((next) => {
    setScale((current) => clamp(typeof next === 'function' ? next(current) : next));
  }, []);

  useEffect(() => {
    if (scale === 1) setOffset({ x: 0, y: 0 });
  }, [scale]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === '+' || event.key === '=') changeScale((current) => current + 0.5);
      if (event.key === '-') changeScale((current) => current - 0.5);
      if (event.key === '0') changeScale(1);
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [changeScale, onClose]);

  // Wheel and trackpad pinch zoom over the photo.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const onWheel = (event) => {
      event.preventDefault();
      changeScale((current) => current - event.deltaY * 0.003);
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [changeScale]);

  const onPointerDown = (event) => {
    if (scale === 1) return;
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      startX: offset.x,
      startY: offset.y,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    setOffset({
      x: drag.startX + (event.clientX - drag.x),
      y: drag.startY + (event.clientY - drag.y),
    });
  };

  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const toggleDoubleZoom = () => changeScale((current) => (current === 1 ? 2.5 : 1));

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-ink/95"
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — enlarged view`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="min-w-0 truncate text-[13px] text-white/70">{alt}</p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => changeScale((current) => current - 0.5)}
            disabled={scale <= MIN_SCALE}
            className={toolButton}
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-mono text-[12px] text-white/70">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => changeScale((current) => current + 0.5)}
            disabled={scale >= MAX_SCALE}
            className={toolButton}
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => changeScale(1)}
            className={toolButton}
            aria-label="Reset zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button type="button" onClick={onClose} className={toolButton} aria-label="Close viewer">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={toggleDoubleZoom}
        className="relative flex-1 touch-none select-none overflow-hidden"
        style={{ cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in' }}
      >
        <Image
          src={src}
          alt={alt}
          fittingType="fit"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full transition-transform duration-150 ease-out"
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
          }}
        />
      </div>

      <p className="px-4 pb-4 text-center text-[12px] text-white/50">
        Scroll or pinch to zoom, double-click to magnify, drag to look around, Esc to close.
      </p>
    </div>
  );
}