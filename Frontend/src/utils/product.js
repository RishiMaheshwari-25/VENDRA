// Pure helpers that read the product shape the backend returns.

export const getAttributeEntries = (attributes) => {
  if (!attributes) return [];
  if (attributes instanceof Map) return [...attributes.entries()];
  if (typeof attributes === 'object') return Object.entries(attributes);
  return [];
};

export const imageUrls = (images = []) =>
  (Array.isArray(images) ? images : [])
    .map((img) => (typeof img === 'string' ? img : img?.url || img?.secure_url || img?.path))
    .filter(Boolean);

// Product-level images first, then any variant images.
export const productGallery = (product) => {
  const own = imageUrls(product?.images);
  if (own.length) return own;
  return (product?.variants || []).flatMap((v) => imageUrls(v.images));
};

export const formatPrice = (price) => {
  if (!price || price.amount === undefined || price.amount === null) return '';
  const code = (Array.isArray(price.currency) ? price.currency[0] : price.currency) || 'INR';
  const amount = Number(price.amount) || 0;
  try {
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString()}`;
  }
};

export const totalStock = (product) =>
  (product?.variants || []).reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

// 'none' = no variants yet (cannot be bought), 'out' | 'low' | 'in'
export const stockStatus = (product) => {
  const variants = product?.variants || [];
  if (variants.length === 0) return 'none';
  const stock = totalStock(product);
  if (stock <= 0) return 'out';
  return stock <= 5 ? 'low' : 'in';
};

export const firstAvailableVariant = (product) =>
  (product?.variants || []).find((v) => Number(v.stock) > 0) || null;

export const sortNewest = (list) =>
  [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

export const SORTS = {
  newest: { label: 'Newest', fn: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0) },
  priceAsc: { label: 'Price: low to high', fn: (a, b) => (a.price?.amount || 0) - (b.price?.amount || 0) },
  priceDesc: { label: 'Price: high to low', fn: (a, b) => (b.price?.amount || 0) - (a.price?.amount || 0) },
};

// Attribute facets that really exist in the data, e.g. { Size: ['M','L'], Colour: ['Red'] }.
export const attributeFacets = (products, maxValues = 14) => {
  const facets = {};
  products.forEach((p) =>
    (p.variants || []).forEach((v) =>
      getAttributeEntries(v.attributes).forEach(([k, val]) => {
        if (!k || val === undefined || val === '') return;
        const key = String(k).trim();
        (facets[key] ||= new Set()).add(String(val).trim());
      })
    )
  );
  return Object.fromEntries(
    Object.entries(facets)
      .filter(([, set]) => set.size > 0 && set.size <= maxValues)
      .map(([k, set]) => [k, [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))])
  );
};
