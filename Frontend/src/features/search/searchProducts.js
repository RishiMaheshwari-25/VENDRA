import { getAttributeEntries } from '../../utils/product';

export const normalize = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export const tokenize = (query) => normalize(query).split(/[^a-z0-9]+/).filter(Boolean);

// True when a and b are within one edit (insert / delete / substitute).
const withinOneEdit = (a, b) => {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
};

const attrText = (product) =>
  (product.variants || [])
    .flatMap((v) => getAttributeEntries(v.attributes).map(([k, val]) => `${k} ${val}`))
    .join(' ');

// Every word of the query must match somewhere. Returns products ranked by relevance.
export const searchProducts = (products, query) => {
  const tokens = tokenize(query);
  if (!tokens.length) return [];

  return products
    .map((product) => {
      const title = normalize(product.title);
      const titleWords = title.split(/[^a-z0-9]+/).filter(Boolean);
      const attrs = normalize(attrText(product));
      const attrWords = attrs.split(/[^a-z0-9]+/).filter(Boolean);
      const desc = normalize(product.description);

      let score = 0;
      for (const t of tokens) {
        if (titleWords.some((w) => w.startsWith(t))) score += title.startsWith(t) ? 9 : 6;
        else if (title.includes(t)) score += 4;
        else if (attrWords.some((w) => w === t || w.startsWith(t))) score += 3;
        else if (desc.includes(t)) score += 1;
        else if (t.length >= 5 && [...titleWords, ...attrWords].some((w) => withinOneEdit(w, t))) score += 2;
        else return null;
      }
      return { product, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || new Date(b.product.createdAt || 0) - new Date(a.product.createdAt || 0))
    .map((r) => r.product);
};

const RECENT_KEY = 'vendra:recent-searches';

export const loadRecent = () => {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(list) ? list.slice(0, 6) : [];
  } catch {
    return [];
  }
};

export const saveRecent = (query) => {
  const q = query.trim();
  if (!q) return loadRecent();
  const next = [q, ...loadRecent().filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 6);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // storage blocked; recents are optional
  }
  return next;
};

export const removeRecent = (query) => {
  const next = loadRecent().filter((r) => r !== query);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
};

export const clearRecent = () => {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    // ignore
  }
  return [];
};
