// Order snapshot helpers.
// The backend has no "get order" endpoint yet, so Cart.jsx stores a snapshot of what was
// charged right before Razorpay opens, and OrderSuccess reads it back. normalizeOrder()
// maps both the snapshot and a future API response onto one view-model.

const keyFor = (orderId) => `vendra:order:${orderId}`;

export const getAttributeEntries = (attributes) => {
  if (!attributes) return [];
  if (attributes instanceof Map) return [...attributes.entries()];
  if (typeof attributes === 'object') return Object.entries(attributes);
  return [];
};

const firstImageUrl = (images) => {
  if (!Array.isArray(images) || images.length === 0) return null;
  const first = images[0];
  if (typeof first === 'string' && first.trim()) return first;
  if (first && typeof first === 'object') return first.url || first.secure_url || first.path || null;
  return null;
};

export const formatMoney = (amount, currency = 'INR') => {
  const code = (Array.isArray(currency) ? currency[0] : currency) || 'INR';
  try {
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `${code} ${Number(amount) || 0}`;
  }
};

export const formatDateTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const formatShortDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);

// Cart items come from the aggregation in cart.dao.js, where `product.variants` is the single
// matched variant object (not an array). Handle both shapes defensively.
const pickVariant = (item) => {
  const variants = item?.product?.variants;
  if (Array.isArray(variants)) {
    const id = String(item?.variant?._id || item?.variant || '');
    return variants.find((v) => String(v?._id) === id) || variants[0] || null;
  }
  return variants || null;
};

export const buildOrderItems = (cartItems) =>
  (Array.isArray(cartItems) ? cartItems : []).map((item) => {
    const product = item?.product || {};
    const variant = pickVariant(item);
    const price = variant?.price ?? product.price ?? item?.price ?? {};
    return {
      productId: product._id || null,
      variantId: variant?._id || (typeof item?.variant === 'string' ? item.variant : null),
      title: product.title || 'Selected piece',
      image: firstImageUrl(variant?.images) || firstImageUrl(product.images) || null,
      attributes: Object.fromEntries(getAttributeEntries(variant?.attributes)),
      quantity: Number(item?.quantity) || 1,
      unitPrice: Number(price?.amount) || 0,
      currency: price?.currency || 'INR',
    };
  });

const read = (orderId) => {
  try {
    const raw = localStorage.getItem(keyFor(orderId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const write = (orderId, data) => {
  try {
    localStorage.setItem(keyFor(orderId), JSON.stringify(data));
  } catch {
    // Storage may be blocked (private mode); the page falls back to its neutral state.
  }
};

export const saveOrderSnapshot = (orderId, { items, order }) => {
  if (!orderId) return;
  write(orderId, {
    orderId,
    items,
    amount: Number(order?.amount) / 100, // Razorpay amounts are in the smallest currency unit
    currency: order?.currency || 'INR',
    createdAt: new Date().toISOString(),
    verified: false,
  });
};

export const markOrderVerified = (orderId, paymentId) => {
  const snapshot = read(orderId);
  if (!snapshot) return;
  write(orderId, { ...snapshot, verified: true, paymentId, paidAt: new Date().toISOString() });
};

export const loadOrderSnapshot = (orderId) => (orderId ? read(orderId) : null);

// Maps a snapshot or a backend order ({ orderId, paymentId, status, amount, currency, createdAt, items })
// onto the shape the page renders. Returns null if the order can't be shown as paid.
export const normalizeOrder = (raw, source) => {
  if (!raw) return null;
  const paid = source === 'snapshot' ? raw.verified === true : raw.status === 'paid';
  const items = (raw.items || []).map((it) => ({
    productId: it.productId || null,
    title: it.title || 'Selected piece',
    image: it.image || firstImageUrl(it.images) || null,
    attributes: it.attributes || {},
    quantity: Number(it.quantity) || 1,
    unitPrice: Number(it.unitPrice ?? it.price?.amount) || 0,
    currency: it.currency || it.price?.currency || raw.currency || 'INR',
  }));
  const currency = raw.currency || items[0]?.currency || 'INR';
  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  return {
    source,
    paid,
    orderId: raw.orderId,
    paymentId: raw.paymentId || null,
    paidAt: raw.paidAt || raw.createdAt || null,
    currency,
    subtotal,
    total: Number.isFinite(Number(raw.amount)) && Number(raw.amount) > 0 ? Number(raw.amount) : subtotal,
    items,
  };
};

