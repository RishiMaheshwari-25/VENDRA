import { createBrowserRouter } from "react-router";
import Layout from "../components/layout/Layout";
import NotFound from "../components/layout/NotFound";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import CreateProduct from "../features/products/pages/CreateProduct";
import Dashboard from "../features/products/pages/Dashboard";
import Protected from "../features/auth/components/Protected";
import Home from "../features/products/pages/Home";
import ProductDetails from "../features/products/pages/ProductDetails";
import SellerProductDetails from "../features/products/pages/SellerProductDetails";
import SearchPage from "../features/search/SearchPage";
import Cart from "../features/cart/pages/Cart";
import OrderSuccess from "../features/cart/pages/OrderSuccess";
import MyOrders from "../features/orders/pages/MyOrders";
import OrderDetails from "../features/orders/pages/OrderDetails";
import Wishlist from "../features/wishlist/pages/Wishlist";

export const router = createBrowserRouter([
  // Full-screen auth pages (no storefront chrome)
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },

  // Everything else shares the navbar, footer, toasts and search overlay
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/product/:productId", element: <ProductDetails /> },
      {
        path: "/cart",
        element: (
          <Protected>
            <Cart />
          </Protected>
        ),
      },
      {
        path: "/order-success",
        element: (
          <Protected>
            <OrderSuccess />
          </Protected>
        ),
      },
      {
        path: "/wishlist",
        element: (
          <Protected>
            <Wishlist />
          </Protected>
        ),
      },
      {
        path: "/orders",
        element: (
          <Protected>
            <MyOrders />
          </Protected>
        ),
      },
      {
        path: "/orders/:orderId",
        element: (
          <Protected>
            <OrderDetails />
          </Protected>
        ),
      },
      {
        path: "/seller/create-product",
        element: (
          <Protected role="seller">
            <CreateProduct />
          </Protected>
        ),
      },
      {
        path: "/seller/dashboard",
        element: (
          <Protected role="seller">
            <Dashboard />
          </Protected>
        ),
      },
      {
        path: "/seller/product/:productId",
        element: (
          <Protected role="seller">
            <SellerProductDetails />
          </Protected>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
