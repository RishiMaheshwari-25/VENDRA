import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loaded: false,
  },
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
      state.loaded = true;
    },
    addWishlistItem: (state, action) => {
      if (!state.items.some((p) => p._id === action.payload._id)) {
        state.items.unshift(action.payload);
      }
    },
    removeWishlistItem: (state, action) => {
      state.items = state.items.filter((p) => p._id !== action.payload);
    },
  },
});

export const { setWishlist, addWishlistItem, removeWishlistItem } = wishlistSlice.actions;
export default wishlistSlice.reducer;
