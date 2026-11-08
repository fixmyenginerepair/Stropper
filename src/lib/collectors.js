import { SITE } from '@/lib/site';

export const COLLECTION_TYPES = [
  'Straight Razors',
  'Safety Razors',
  'Sharpeners-Stroppers',
  'Hones',
  'Strops',
  'Barbershop Collectibles',
];

// Collector e-mail addresses stay private: enquiries go to the webmaster,
// who forwards them on.
export function contactHref(name) {
  const subject = `Stropper.com — contact request for ${name}`;
  return `mailto:${SITE.webmaster}?subject=${encodeURIComponent(subject)}`;
}