const KEY = 'stropper.book';

export function readBook() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addToBook(id) {
  const ids = readBook();
  if (!ids.includes(id)) ids.push(id);
  localStorage.setItem(KEY, JSON.stringify(ids));
  return ids;
}

export function bookHref(ids) {
  return `/book?ids=${ids.join(',')}`;
}