# VENDRA — Order Success Page: Change Plan & Log

Feature: after Razorpay payment is verified, the user lands on `/order-success?order_id=<razorpay_order_id>`
and sees a full confirmation (order, payment, items, totals, delivery estimate, next steps).

---

## 1. What I read first (current state)

| Area | File | Finding |
|---|---|---|
| FE checkout | `Frontend/src/features/cart/pages/Cart.jsx` | `handleCheckout` creates the Razorpay order, opens the modal, and on verified payment calls `navigate('/order-success?order_id=…')`. **`navigate` is never imported/defined** → would crash right after payment. |
| FE page | `Frontend/src/features/cart/pages/OrderSuccess.jsx` | Placeholder only (`<div>OrderSuccess</div>`). |
| FE routes | `Frontend/src/app/app.routes.jsx` | No `/order-success` route. |
| FE API | `Frontend/src/features/cart/services/cart.api.js` | Only `createCartOrder` and `verifyCartOrder`. No call that returns order details. |
| BE | `Backend/src/controllers/cart.controller.js` | `createOrderCart` stores a `payment` doc (status `pending`, items snapshot, price). `verifyOrderController` marks it `paid` and stores `paymentId` + signature. |
| BE | `Backend/src/models/payment.model.js` | Has `status`, `price`, `razorpay.{orderId,paymentId,signature}`, `user`, `orderItems[]`. No timestamps, no address. |
| BE | `Backend/src/routes/cart.routes.js` | Only `POST /payment/create/order` and `POST /payment/verify/order`. **No GET for an order.** |

Consequences:
1. The success page has no server source for order details today.
2. The amount really charged is `cart.totalPrice` (server side). The 10 % promo shown in the cart is front-end only and is **not** applied to the charge, so the success page shows the amount Razorpay actually charged (`order.amount / 100`), never the promo-adjusted number.

---

## 2. Approach — **no backend change needed for the page to work now**

Because the backend has no "get order" endpoint and you asked me not to change backend functionality without telling you:

* **Right before the Razorpay modal opens**, `Cart.jsx` saves a small *order snapshot* (items, qty, unit price, image, attributes, charged amount, currency, Razorpay order id) in `localStorage` under `vendra:order:<razorpay_order_id>`.
* **After `verify` succeeds**, the snapshot is stamped `verified: true` with the `razorpay_payment_id` and paid time, then we navigate to `/order-success`.
* **The success page** loads the snapshot for `order_id`. It only shows "Payment confirmed" if the snapshot is `verified`. Typing a random `order_id` in the URL shows a neutral "can't confirm this order" state instead of a fake success.
* **It also tries a backend fetch first** (`GET /api/cart/payment/order/:orderId`). Today that route doesn't exist, so the call fails silently and the snapshot is used. If you approve the optional backend change (§5), the page automatically starts using real server data (works after refresh on any device, can't be spoofed).

Customer name / email / phone come from the logged-in user in Redux (`state.auth.user`) — nothing hardcoded.

---

## 3. Files I will CREATE

| File | Purpose |
|---|---|
| `VENDRA/ORDER_SUCCESS_CHANGES.md` | This document. |
| `Frontend/src/features/cart/utils/orderSnapshot.js` | Build / save / update / load the order snapshot; money + date helpers; normalises both snapshot and (future) API shapes into one view-model. |
| `Frontend/src/styles/order-success.scss` | Page styles. Uses existing tokens in `_variables.scss` (light + dark theme, serif headings, eyebrow, buttons). Responsive + print styles. |

## 4. Files I will MODIFY (frontend only)

| File | Change |
|---|---|
| `Frontend/src/features/cart/pages/OrderSuccess.jsx` | Full page (see §6). |
| `Frontend/src/features/cart/pages/Cart.jsx` | Import `useNavigate` and define `navigate` (fixes crash); save snapshot before opening Razorpay; mark it verified on success; handle modal-dismiss/payment-failed gracefully. Nothing else in the cart UI is touched. |
| `Frontend/src/features/cart/services/cart.api.js` | Add `getOrderById(orderId)` (GET `/payment/order/:orderId`). |
| `Frontend/src/features/cart/hooks/useCart.js` | Add `handleGetOrder`. |
| `Frontend/src/app/app.routes.jsx` | Add `/order-success` wrapped in `<Protected>`. |

## 5. Backend — NOT changed. Proposed (needs your OK)

I have **not** touched anything in `Backend/`. Two optional, small, additive changes I recommend:

**A. Read-only endpoint (recommended)** — `GET /api/cart/payment/order/:orderId`
* `authenticateUser`, then `paymentModel.findOne({ 'razorpay.orderId': orderId, user: req.user._id })`.
* Returns `{ success, order: { orderId, paymentId, status, amount, currency, createdAt, items[] } }`; 404 if not found / not the user's order. Never returns `signature`.
* No existing route or behaviour changes.

**B. Clear the cart after successful verification (recommended, separate decision)**
* Currently the cart still holds the purchased items after payment, so going back to the bag shows items the user already paid for. Fix would be: in `verifyOrderController`, after `payment.status = 'paid'`, empty the user's cart. This **does** change existing behaviour, so I will only do it if you say yes.

Other gaps I noticed but am **not** acting on: no shipping address is collected anywhere (so the page does not show one rather than inventing it); `payment` schema has no `timestamps`; Razorpay key id is hardcoded in `Cart.jsx` (could move to a Vite env var).

---

## 6. Page design (professional clothing-store UX)

Header (same VENDRA brand header as cart) → hero → two-column body → help strip → footer actions.

1. **Hero confirmation** — animated check mark, "Thank you, {first name}", "Your order is confirmed", subtext, light confetti (CSS only, respects `prefers-reduced-motion`).
2. **Key facts bar** — Order ID (copy button), Payment ID, Date & time, Amount paid, Payment status badge (Paid).
3. **Order progress tracker** — Order placed ✔ → Payment confirmed ✔ → Packed → Shipped → Delivered (the last three shown as upcoming).
4. **Estimated delivery** — computed from the paid time + a delivery window constant (`DELIVERY_WINDOW_DAYS = [5, 7]` at top of the file; change it to match your logistics).
5. **Items ordered** — image (with fallback), title, variant attributes (size/colour… from the real data), qty, unit and line price, link back to product.
6. **Payment summary** — subtotal, shipping (Free — matches cart copy), **total paid**, currency-aware formatting.
7. **Customer details** — name, email, phone from the logged-in user.
8. **What happens next** — 3 short steps (confirmation, packing, dispatch).
9. **Care & policies** — 7-day returns, authenticity, secure packaging (same copy as the cart's service box).
10. **Actions** — Continue shopping, Back to home, Print / save receipt (print stylesheet hides chrome), Copy order ID.
11. **States** — loading skeleton; missing `order_id`; order not verifiable (neutral, no false "paid"); works in light & dark; mobile-first.

Accessibility: semantic landmarks, `aria-live` for copy toast, focus-visible styles, reduced-motion support.

Hardcoded content is limited to: static policy copy (matches cart), the delivery-window constant, and the 3 "what's next" steps. All order data is dynamic.

---

## 7. Change log (updated as I work)

Done (frontend only; `Backend/` untouched). `vite build` passes.

* **Created:** `utils/orderSnapshot.js`, `styles/order-success.scss`, this file.
* **Rewrote:** `pages/OrderSuccess.jsx`.
* **Modified:**
  * `Cart.jsx` — `useNavigate` added (fixes the crash), snapshot saved before Razorpay opens, marked verified after `verify` succeeds, errors from order creation/verification now show a toast instead of an unhandled rejection. `console.log(order)` removed.
  * `cart.api.js` — `getOrderById`.
  * `useCart.js` — `handleGetOrder`.
  * `app.routes.jsx` — `/order-success` (Protected).
* **Not tested in a browser** with a live Razorpay payment (needs your test keys/session); verified by build only.
* **Pending your decision:** backend §5 A (GET order endpoint) and §5 B (clear cart after payment).
