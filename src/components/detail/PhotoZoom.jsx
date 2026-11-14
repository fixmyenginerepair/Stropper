import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from 'lucide-react';

// Full-screen image viewer that works with touch and mouse:
// two-finger pinch, double-tap / double-click, drag to pan, mouse wheel,
// swipe left/right between photos (at normal size), Esc / arrow keys.

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const DOUBLE_TAP_MS = 300;
const TAP_SLOP = 10;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Strip Wix/Base44 resize transforms so the viewer loads the full-resolution original.
export const originalImageUrl = (url) =>
  typeof url === 'string' ? url.replace(/\/v1\/(?:fill|fit)\/[^/]+\/[^/]+$/i, '') : url;

const toolButton =
  'flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 text-white transition-colors hover:border-white/70 hover:bg-white/10 disabled:opacity-40';

export default function PhotoZoom({ src, images, startIndex = 0, alt = '', onClose }) {
  const list = (images && images.length ? images : [src]).map(originalImageUrl);
  const [index, setIndex] = useState(() => clamp(startIndex, 0, list.length - 1));
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [animate, setAnimate] = useState(true);
  const [isTouch, setIsTouch] = useState(false);

  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const viewRef = useRef(view);
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const lastTap = useRef({ t: 0, x: 0, y: 0 });

  viewRef.current = view;
  const current = list[index];
  const many = list.length > 1;

  // Keep the picture from being dragged off the screen.
  const bound = useCallback((next) => {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img) return next;
    const scale = clamp(next.scale, MIN_SCALE, MAX_SCALE);
    const maxX = Math.max(0, (img.offsetWidth * scale - stage.clientWidth) / 2);
    const maxY = Math.max(0, (img.offsetHeight * scale - stage.clientHeight) / 2);
    return { scale, x: clamp(next.x, -maxX, maxX), y: clamp(next.y, -maxY, maxY) };
  }, []);

  // Zoom so that the point under (cx, cy) — relative to stage centre — stays put.
  const zoomAt = useCallback(
    (nextScale, cx = 0, cy = 0, base = viewRef.current) => {
      const scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      const k = scale / base.scale;
      setView(bound({ scale, x: cx - (cx - base.x) * k, y: cy - (cy - base.y) * k }));
    },
    [bound]
  );

  const reset = useCallback(() => {
    setAnimate(true);
    setView({ scale: 1, x: 0, y: 0 });
  }, []);

  const go = useCallback(
    (step) => {
      if (!many) return;
      setIndex((i) => (i + step + list.length) % list.length);
      reset();
    },
    [many, list.length, reset]
  );

  const stagePoint = (clientX, clientY) => {
    const r = stageRef.current.getBoundingClientRect();
    return { x: clientX - r.left - r.width / 2, y: clientY - r.top - r.height / 2 };
  };

  // Lock page scroll and wire keyboard shortcuts while open.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    setIsTouch(window.matchMedia?.('(pointer: coarse)').matches);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === '+' || e.key === '=') { setAnimate(true); zoomAt(viewRef.current.scale + 0.5); }
      else if (e.key === '-') { setAnimate(true); zoomAt(viewRef.current.scale - 0.5); }
      else if (e.key === '0') reset();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, zoomAt, reset, go]);

  // Mouse wheel / trackpad pinch (needs a non-passive listener).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      setAnimate(false);
      const p = stagePoint(e.clientX, e.clientY);
      zoomAt(viewRef.current.scale * Math.exp(-e.deltaY * 0.0025), p.x, p.y);
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  // Re-fit after rotating the phone or resizing the window.
  useEffect(() => {
    const onResize = () => setView((v) => bound(v));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [bound]);

  const startGesture = () => {
    const pts = [...pointers.current.values()];
    const v = viewRef.current;
    if (pts.length >= 2) {
      const [a, b] = pts;
      gesture.current = {
        type: 'pinch',
        dist: Math.hypot(b.x - a.x, b.y - a.y) || 1,
        mid: stagePoint((a.x + b.x) / 2, (a.y + b.y) / 2),
        base: v,
      };
    } else if (pts.length === 1) {
      gesture.current = { type: 'pan', start: pts[0], base: v, moved: false };
    }
  };

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setAnimate(false);
    startGesture();
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    const pts = [...pointers.current.values()];

    if (g.type === 'pinch' && pts.length >= 2) {
      const [a, b] = pts;
      const dist = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const mid = stagePoint((a.x + b.x) / 2, (a.y + b.y) / 2);
      const scale = clamp(g.base.scale * (dist / g.dist), MIN_SCALE, MAX_SCALE);
      const k = scale / g.base.scale;
      // Zoom about the pinch centre and follow the fingers as they move together.
      setView(
        bound({
          scale,
          x: mid.x - (g.mid.x - g.base.x) * k,
          y: mid.y - (g.mid.y - g.base.y) * k,
        })
      );
    } else if (g.type === 'pan' && pts.length === 1) {
      const dx = e.clientX - g.start.x;
      const dy = e.clientY - g.start.y;
      if (Math.hypot(dx, dy) > TAP_SLOP) g.moved = true;
      if (g.base.scale > 1) setView(bound({ scale: g.base.scale, x: g.base.x + dx, y: g.base.y + dy }));
    }
  };

  const onPointerUp = (e) => {
    const g = gesture.current;
    const wasSingle = pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    setAnimate(true);

    if (g?.type === 'pan' && wasSingle) {
      const dx = e.clientX - g.start.x;
      const dy = e.clientY - g.start.y;
      // Swipe between photos when not zoomed in.
      if (g.moved && g.base.scale === 1 && many && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        go(dx < 0 ? 1 : -1);
      } else if (!g.moved && e.pointerType !== 'mouse') {
        // Double-tap to zoom in on that spot, or back out.
        const now = Date.now();
        const lt = lastTap.current;
        if (now - lt.t < DOUBLE_TAP_MS && Math.hypot(e.clientX - lt.x, e.clientY - lt.y) < 30) {
          const p = stagePoint(e.clientX, e.clientY);
          if (viewRef.current.scale > 1) reset();
          else zoomAt(2.5, p.x, p.y);
          lastTap.current = { t: 0, x: 0, y: 0 };
        } else {
          lastTap.current = { t: now, x: e.clientX, y: e.clientY };
        }
      }
    }
    // Lifting one finger of a pinch continues as a pan with the other.
    startGesture();
    if (pointers.current.size === 0) gesture.current = null;
  };

  const onDoubleClick = (e) => {
    // Mouse only — touch double-taps are handled above.
    if (isTouch) return;
    setAnimate(true);
    const p = stagePoint(e.clientX, e.clientY);
    if (viewRef.current.scale > 1) reset();
    else zoomAt(2.5, p.x, p.y);
  };

  const zoomed = view.scale > 1.01;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-ink/95"
      style={{ height: '100dvh', overscrollBehavior: 'contain' }}
      role="dialog"
      aria-modal="true"
      aria-label={`${alt || 'Image'} — enlarged view`}
    >
      <div
        className="flex shrink-0 items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-3"
        style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
      >
        <p className="min-w-0 truncate text-[13px] text-white/70">
          {alt}
          {many && <span className="ml-2 text-white/45">{index + 1} / {list.length}</span>}
        </p>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => { setAnimate(true); zoomAt(view.scale - 0.75); }}
            disabled={!zoomed}
            className={`${toolButton} hidden sm:flex`}
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="hidden w-12 text-center font-mono text-[12px] text-white/70 sm:block">
            {Math.round(view.scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => { setAnimate(true); zoomAt(view.scale + 0.75); }}
            disabled={view.scale >= MAX_SCALE}
            className={`${toolButton} hidden sm:flex`}
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button type="button" onClick={reset} disabled={!zoomed} className={toolButton} aria-label="Reset zoom">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button type="button" onClick={onClose} className={toolButton} aria-label="Close viewer">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
        className="relative min-h-0 flex-1 select-none overflow-hidden"
        style={{ touchAction: 'none', cursor: zoomed ? 'grab' : 'zoom-in' }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
          <img
            ref={imgRef}
            key={current}
            src={current}
            alt={alt}
            draggable={false}
            onLoad={() => setView((v) => bound(v))}
            className="pointer-events-none max-h-full max-w-full object-contain will-change-transform"
            style={{
              transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
              transition: animate ? 'transform 180ms ease-out' : 'none',
            }}
          />
        </div>

        {many && !zoomed && (
          <>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/70"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/70"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      <p
        className="shrink-0 px-4 pt-2 text-center text-[12px] text-white/50"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        {isTouch
          ? `Pinch to zoom · double-tap to magnify · drag to look around${many ? ' · swipe for more' : ''}`
          : 'Scroll to zoom · double-click to magnify · drag to look around · Esc to close'}
      </p>
    </div>
  );
}
