export const SITE = {
  name: 'Stropper.com',
  tagline: 'The world of razor sharpeners',
  logo: 'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/21c8ba399_stropper-logo.png',
  sister: 'https://shaveworld.org',
  webmaster: 'webmaster@stropper.com',
};

// Main menu, grouped. Items with `children` open as dropdowns; the rest are plain links.
export const NAV_GROUPS = [
  {
    label: 'The Collection',
    children: [
      { label: 'Browse the archive', to: '/browse', note: 'Search and filter every piece' },
      { label: 'Full list', to: '/list', note: 'Every sharpener, A–Z' },
      { label: 'Swap list', to: '/swap-list', note: 'Doubles available to trade' },
      { label: 'The Book', to: '/book', note: 'Print the archive as a book' },
    ],
  },
  {
    label: 'History',
    children: [
      { label: 'Makers & stories', to: '/history', note: 'The companies behind the pieces' },
      { label: 'Patents', to: '/patents', note: 'Original drawings and inventors' },
      { label: 'Period advertising', to: '/advertising', note: 'Ads from the era' },
      { label: 'Classic Stropper.com', to: '/classic', note: 'The original site, preserved' },
    ],
  },
  { label: 'Collectors', to: '/collectors' },
  { label: 'About', to: '/about' },
];

// Flat list (kept for any page that still wants every link).
export const NAV_LINKS = [
  { label: 'Browse', to: '/browse' },
  { label: 'List', to: '/list' },
  { label: 'Collectors', to: '/collectors' },
  { label: 'Swap List', to: '/swap-list' },
  { label: 'The Book', to: '/book' },
  { label: 'History', to: '/history' },
  { label: 'Patents', to: '/patents' },
  { label: 'Ads', to: '/advertising' },
  { label: 'About', to: '/about' },
  { label: 'Classic', to: '/classic' },
];