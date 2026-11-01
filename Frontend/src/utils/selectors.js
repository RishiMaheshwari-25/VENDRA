const EMPTY = [];

export const selectProducts = (state) => state.product?.products ?? EMPTY;
export const selectSellerProducts = (state) => state.product?.sellerProducts ?? EMPTY;
