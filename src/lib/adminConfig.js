// Field set-up for every table the admin backend manages.
// Field kinds: text, textarea, markdown, number, select, checkbox, list, images, date, url

const SHARPENER_TYPES = [
  'Allegro Type', 'Auto Strop', 'Barber', 'Barber Accessories', 'Accessories', 'Blade Holder',
  'Blade Holder & Hone', 'Blades', 'Circular', 'Edge-Bak', 'Electric', 'Handle-like Ingersoll',
  'Handle-like Valet', 'Hone-Carborundum', 'Hone-Glass/Other', 'Knife', 'Machine-Pull Handles',
  'Magnetic', 'Marbles-Bearings', 'Marvel', 'Other', 'Pull String', 'Razor Other', 'Rollers-1',
  'Rollers-2', 'Rollers-3', 'Rollers-4', 'Rotary Belt', 'Safety Razor', 'Set', 'Sets',
  'Shake Sharp', 'Shaving Stand', 'Shear', 'Straight Razor', 'Strop', 'Unknown',
];

const SHARPENER_COUNTRIES = [
  'Argentina', 'Australia', 'Australia?', 'Austria', 'Austria-Hungary', 'Brazil', 'Britian',
  'Canada', 'Czechoslovakia', 'Denmark', 'England', 'France', 'French', 'French?', 'Germany',
  'Greece', 'Holland', 'Hungary', 'Italy', 'Japan', 'Netherland', 'Norway', 'Other', 'Poland',
  'Russia', 'Russian', 'South Africa', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'Unknown', 'USA',
];

const RARITY = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'T'];

export const ADMIN_ENTITIES = {
  Sharpener: {
    label: 'Sharpeners',
    singular: 'sharpener',
    titleField: 'name',
    defaultSort: 'name',
    viewPath: (r) => `/sharpener/${r.id}`,
    searchFields: ['name', 'description', 'manufacturer', 'patent', 'comment', 'collection'],
    numericSearchField: 'legacy_id',
    filters: ['type', 'country', 'rarity', 'is_double'],
    bulkFields: ['type', 'country', 'rarity', 'collection', 'is_double'],
    columns: [
      { key: 'images', label: '', kind: 'thumb' },
      { key: 'legacy_id', label: 'Old ID' },
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'country', label: 'Country' },
      { key: 'rarity', label: 'Rarity' },
      { key: 'value', label: 'Value', kind: 'money' },
      { key: 'collection', label: 'Collection' },
      { key: 'updated_date', label: 'Updated', kind: 'date' },
    ],
    sections: [
      {
        title: 'The piece',
        fields: [
          { key: 'name', label: 'Name', kind: 'text', required: true, wide: true },
          { key: 'description', label: 'Description', kind: 'textarea', wide: true },
          { key: 'type', label: 'Type', kind: 'select', options: SHARPENER_TYPES },
          { key: 'country', label: 'Country', kind: 'select', options: SHARPENER_COUNTRIES },
          { key: 'manufacturer', label: 'Manufacturer (maker and address)', kind: 'text', wide: true },
          { key: 'maker_id', label: 'Linked maker', kind: 'ref', entity: 'Maker' },
          { key: 'patent', label: 'Patent', kind: 'text' },
          { key: 'blade', label: 'Blade', kind: 'text' },
          { key: 'year_made', label: 'Year made (approx.)', kind: 'number' },
        ],
      },
      {
        title: 'Collection',
        fields: [
          { key: 'collection', label: 'Collection (collector ID)', kind: 'text' },
          { key: 'legacy_id', label: 'Old stropper.com ID', kind: 'number' },
          { key: 'rarity', label: 'Rarity', kind: 'select', options: RARITY },
          { key: 'value', label: 'Estimated value ($)', kind: 'number' },
          { key: 'acquired_year', label: 'Year acquired', kind: 'number' },
          { key: 'is_double', label: 'Double — show on the swap list', kind: 'checkbox' },
          { key: 'comment', label: 'Comment', kind: 'textarea', wide: true },
        ],
      },
      {
        title: 'Photos',
        fields: [{ key: 'images', label: 'Photos (first is the main photo)', kind: 'images', wide: true }],
      },
      {
        title: 'Story',
        fields: [
          { key: 'story', label: 'The story behind this piece', kind: 'markdown', wide: true },
          { key: 'provenance', label: 'Provenance — where, when, how; prior owners', kind: 'textarea', wide: true },
          { key: 'interview_audio_url', label: 'Interview recording URL', kind: 'url', wide: true },
        ],
      },
    ],
  },

  Maker: {
    label: 'Makers',
    singular: 'maker',
    titleField: 'name',
    defaultSort: 'name',
    searchFields: ['name', 'city', 'country', 'key_people', 'history'],
    filters: ['country'],
    columns: [
      { key: 'images', label: '', kind: 'thumb' },
      { key: 'name', label: 'Name' },
      { key: 'city', label: 'City' },
      { key: 'country', label: 'Country' },
      { key: 'founded_year', label: 'Founded' },
      { key: 'closed_year', label: 'Closed' },
      { key: 'updated_date', label: 'Updated', kind: 'date' },
    ],
    sections: [
      {
        title: 'Maker',
        fields: [
          { key: 'name', label: 'Company or inventor', kind: 'text', required: true, wide: true },
          { key: 'aliases', label: 'Other names (one per line)', kind: 'list', wide: true },
          { key: 'city', label: 'City', kind: 'text' },
          { key: 'country', label: 'Country', kind: 'text' },
          { key: 'founded_year', label: 'Founded', kind: 'number' },
          { key: 'closed_year', label: 'Closed', kind: 'number' },
          { key: 'key_people', label: 'Key people', kind: 'textarea', wide: true },
          { key: 'patents', label: 'Patent numbers (one per line)', kind: 'list', wide: true },
        ],
      },
      {
        title: 'History',
        fields: [
          { key: 'history', label: 'History', kind: 'markdown', wide: true },
          { key: 'open_questions', label: 'Open questions', kind: 'textarea', wide: true },
          { key: 'sources', label: 'Sources (one per line)', kind: 'list', wide: true },
          { key: 'images', label: 'Logos, ads, factory photos', kind: 'images', wide: true },
        ],
      },
    ],
  },

  Article: {
    label: 'Articles',
    singular: 'article',
    titleField: 'title',
    defaultSort: '-updated_date',
    searchFields: ['title', 'summary', 'body', 'author', 'slug'],
    filters: ['category', 'status', 'featured'],
    bulkFields: ['status', 'category', 'featured'],
    columns: [
      { key: 'cover_image', label: '', kind: 'thumb' },
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status' },
      { key: 'author', label: 'Author' },
      { key: 'published_date', label: 'Published' },
      { key: 'updated_date', label: 'Updated', kind: 'date' },
    ],
    sections: [
      {
        title: 'Article',
        fields: [
          { key: 'title', label: 'Title', kind: 'text', required: true, wide: true },
          { key: 'slug', label: 'URL slug', kind: 'text' },
          { key: 'author', label: 'Author', kind: 'text', default: 'Thomas V. Willard' },
          { key: 'category', label: 'Category', kind: 'select', options: ['The Collector', 'Maker History', 'Patent Spotlight', 'Themed Collection', 'Era', 'Interview', 'Collecting Tips'] },
          { key: 'status', label: 'Status', kind: 'select', options: ['Draft', 'Published'], default: 'Draft' },
          { key: 'published_date', label: 'Published date', kind: 'date' },
          { key: 'featured', label: 'Featured', kind: 'checkbox' },
          { key: 'summary', label: 'Summary', kind: 'textarea', wide: true },
          { key: 'body', label: 'Body', kind: 'markdown', wide: true },
        ],
      },
      {
        title: 'Media and links',
        fields: [
          { key: 'cover_image', label: 'Cover image', kind: 'image', wide: true },
          { key: 'images', label: 'More images', kind: 'images', wide: true },
          { key: 'audio_url', label: 'Interview recording URL', kind: 'url', wide: true },
          { key: 'era_start_year', label: 'Era start year', kind: 'number' },
          { key: 'era_end_year', label: 'Era end year', kind: 'number' },
          { key: 'sharpener_ids', label: 'Sharpener record IDs (one per line)', kind: 'list', wide: true },
          { key: 'maker_ids', label: 'Maker record IDs (one per line)', kind: 'list', wide: true },
          { key: 'sources', label: 'Sources (one per line)', kind: 'list', wide: true },
        ],
      },
    ],
  },

  PeriodAd: {
    label: 'Period ads',
    singular: 'ad',
    titleField: 'title',
    defaultSort: 'year',
    viewPath: () => '/advertising',
    searchFields: ['title', 'brand', 'advertiser', 'publication', 'summary'],
    filters: ['audience'],
    columns: [
      { key: 'image', label: '', kind: 'thumb' },
      { key: 'title', label: 'Headline' },
      { key: 'brand', label: 'Brand' },
      { key: 'publication', label: 'Publication' },
      { key: 'year', label: 'Year' },
      { key: 'audience', label: 'Audience' },
    ],
    sections: [
      {
        title: 'Ad',
        fields: [
          { key: 'title', label: 'Headline', kind: 'text', required: true, wide: true },
          { key: 'image', label: 'Ad image', kind: 'image', required: true, wide: true },
          { key: 'brand', label: 'Brand', kind: 'text' },
          { key: 'advertiser', label: 'Advertiser (as printed)', kind: 'text' },
          { key: 'maker_id', label: 'Linked maker', kind: 'ref', entity: 'Maker' },
          { key: 'country', label: 'Country', kind: 'text' },
          { key: 'publication', label: 'Publication', kind: 'text' },
          { key: 'published_date', label: 'Date as printed', kind: 'text' },
          { key: 'year', label: 'Year (for sorting)', kind: 'number' },
          { key: 'year_approximate', label: 'Year is approximate', kind: 'checkbox' },
          { key: 'audience', label: 'Audience', kind: 'select', options: ['Consumer', 'Trade (dealers)'], default: 'Consumer' },
          { key: 'prices_quoted', label: 'Prices quoted', kind: 'text' },
          { key: 'summary', label: 'Summary', kind: 'textarea', wide: true },
          { key: 'source_note', label: 'Image source', kind: 'text', wide: true },
          { key: 'sharpener_ids', label: 'Sharpener record IDs (one per line)', kind: 'list', wide: true },
        ],
      },
    ],
  },

  Collector: {
    label: 'Collectors',
    singular: 'collector',
    titleField: 'name',
    defaultSort: 'name',
    viewPath: () => '/collectors',
    searchFields: ['name', 'email', 'country'],
    filters: ['approved', 'collection_type'],
    bulkFields: ['approved'],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'country', label: 'Country' },
      { key: 'collection_type', label: 'Collects' },
      { key: 'approved', label: 'Approved', kind: 'bool' },
      { key: 'created_date', label: 'Joined', kind: 'date' },
    ],
    sections: [
      {
        title: 'Collector',
        fields: [
          { key: 'name', label: 'Name', kind: 'text', required: true, wide: true },
          { key: 'email', label: 'Email (private)', kind: 'text' },
          { key: 'country', label: 'Country', kind: 'text' },
          { key: 'collection_type', label: 'Collects', kind: 'select', options: ['Straight Razors', 'Safety Razors', 'Sharpeners-Stroppers', 'Hones', 'Strops', 'Barbershop Collectibles'] },
          { key: 'main_collection_size', label: 'Main collection size', kind: 'text' },
          { key: 'sharpener_collection_size', label: 'Sharpener collection size', kind: 'text' },
          { key: 'approved', label: 'Approved — show in the public directory', kind: 'checkbox' },
          { key: 'from_legacy_site', label: 'Came from the old site', kind: 'checkbox' },
        ],
      },
    ],
  },

  Patent: {
    label: 'Patents',
    singular: 'patent',
    titleField: 'title',
    defaultSort: 'year',
    viewPath: (r) => `/patents/${r.id}`,
    searchFields: ['title', 'number', 'patent_id', 'notes'],
    filters: ['country', 'verified'],
    bulkFields: ['verified', 'country'],
    columns: [
      { key: 'drawing_urls', label: '', kind: 'thumb' },
      { key: 'country', label: 'Country' },
      { key: 'number', label: 'Number' },
      { key: 'title', label: 'Title' },
      { key: 'inventors', label: 'Inventor' },
      { key: 'year', label: 'Year' },
      { key: 'verified', label: 'Verified', kind: 'bool' },
    ],
    sections: [
      {
        title: 'Patent',
        fields: [
          { key: 'country', label: 'Country', kind: 'select', options: ['US', 'GB', 'DE', 'FR', 'CA', 'CH', 'AT', 'IT', 'SE', 'AU', 'Other'], required: true },
          { key: 'number', label: 'Number', kind: 'text', required: true },
          { key: 'patent_id', label: 'Full ID with kind code (e.g. US959496A)', kind: 'text' },
          { key: 'title', label: 'Title', kind: 'text', wide: true },
          { key: 'inventors', label: 'Inventors (one per line)', kind: 'list' },
          { key: 'assignees', label: 'Assigned to (one per line)', kind: 'list' },
          { key: 'grant_date', label: 'Grant date', kind: 'date' },
          { key: 'year', label: 'Year (for sorting)', kind: 'number' },
          { key: 'maker_id', label: 'Linked maker', kind: 'ref', entity: 'Maker' },
          { key: 'verified', label: 'Verified against the patent record', kind: 'checkbox' },
          { key: 'notes', label: 'Notes', kind: 'textarea', wide: true },
        ],
      },
      {
        title: 'Drawings and links',
        fields: [
          { key: 'drawing_urls', label: 'Drawing sheets (first is main)', kind: 'images', wide: true },
          { key: 'pdf_url', label: 'Full patent PDF', kind: 'url', wide: true },
          { key: 'dates_on_items', label: 'Dates as marked on the pieces (one per line)', kind: 'list', wide: true },
          { key: 'sharpener_ids', label: 'Sharpener record IDs (one per line)', kind: 'list', wide: true },
        ],
      },
    ],
  },

  ArchiveItem: {
    label: 'Classic archive',
    singular: 'archive item',
    titleField: 'title',
    defaultSort: 'position',
    viewPath: () => '/classic',
    searchFields: ['title', 'path', 'description', 'file_name'],
    filters: ['kind'],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'kind', label: 'Kind' },
      { key: 'path', label: 'Original path' },
      { key: 'position', label: 'Order' },
      { key: 'captured_date', label: 'Captured' },
    ],
    sections: [
      {
        title: 'Archive item',
        fields: [
          { key: 'title', label: 'Title', kind: 'text', required: true, wide: true },
          { key: 'kind', label: 'Kind', kind: 'select', options: ['page', 'php', 'html', 'css', 'javascript', 'java', 'sql', 'image', 'document', 'capture'] },
          { key: 'position', label: 'Order', kind: 'number' },
          { key: 'path', label: 'Original path', kind: 'text', wide: true },
          { key: 'external_url', label: 'Classic site URL', kind: 'url', wide: true },
          { key: 'capture_url', label: 'Internet Archive capture', kind: 'url', wide: true },
          { key: 'captured_date', label: 'Captured date', kind: 'date' },
          { key: 'file_name', label: 'File name', kind: 'text' },
          { key: 'description', label: 'Description', kind: 'textarea', wide: true },
        ],
      },
    ],
  },
};

export const allFields = (config) => config.sections.flatMap((s) => s.fields);

export const fieldByKey = (config, key) => allFields(config).find((f) => f.key === key);

// Values for filter/bulk dropdowns: select options, or yes/no for checkboxes.
export const choicesFor = (field) =>
  field.kind === 'checkbox'
    ? [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]
    : (field.options || []).map((o) => ({ value: o, label: o }));
