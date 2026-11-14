import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PhotoZoom from '@/components/detail/PhotoZoom';

// Any picture on the site that isn't already a link or button opens in the
// zoom viewer when tapped. Mark an area with data-no-zoom to opt out.
const zoomTarget = (target) => {
  if (!(target instanceof HTMLImageElement)) return null;
  if (target.closest('a, button, label, [data-no-zoom], [role="dialog"] [data-no-zoom]')) return null;
  const box = target.getBoundingClientRect();
  if (box.width < 60 || box.height < 60) return null;
  const src =
    target.closest('[data-base44-image-src]')?.getAttribute('data-base44-image-src') ||
    target.currentSrc ||
    target.src;
  if (!src) return null;
  const alt = target.alt || target.closest('figure')?.querySelector('figcaption')?.textContent || '';
  return { src, alt: alt.trim().slice(0, 120) };
};

export default function SiteLayout() {
  const [zoom, setZoom] = useState(null);

  // Capture phase, so pages that stop click propagation still get zoom.
  const onClick = useCallback((event) => {
    const hit = zoomTarget(event.target);
    if (hit) setZoom(hit);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-frost">
      <SiteHeader />
      <main className="zoomable min-w-0 flex-1" onClickCapture={onClick}>
        <Outlet />
      </main>
      <SiteFooter />
      {zoom && <PhotoZoom src={zoom.src} alt={zoom.alt} onClose={() => setZoom(null)} />}
    </div>
  );
}
