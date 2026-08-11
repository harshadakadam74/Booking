import React, { useEffect, useState } from "react";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../services/cartService";

import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Loader2,
  X,
} from "lucide-react";

import { toast } from "react-toastify";

const Cart = () => {
  const [cart, setCart] = useState({
    items: [],
    totalPrice: 0,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem("token");

  // ================= FETCH CART =================
  useEffect(() => {
    const loadCart = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchCart(token);

        setCart({
          items: data?.items || [],
          totalPrice: data?.totalPrice || 0,
        });
      } catch (error) {
        console.error(error);
        toast.error(
          error?.message || "Failed to load cart"
        );
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [token]);

  // ================= UPDATE QUANTITY =================
  const handleQtyChange = async (itemId, quantity) => {
    if (quantity < 1) return;

    try {
      setActionLoading(itemId);

      const updated = await updateCartItem(
        {
          itemId,
          quantity,
        },
        token
      );

      setCart({
        items: updated?.items || [],
        totalPrice: updated?.totalPrice || 0,
      });
    } catch (error) {
      console.error(error);

      toast.error(
        error?.message || "Failed to update quantity"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ================= REMOVE ITEM =================
  const handleRemove = async (itemId) => {
    try {
      setActionLoading(itemId);

      const updated = await removeCartItem(
        itemId,
        token
      );

      setCart({
        items: updated?.items || [],
        totalPrice: updated?.totalPrice || 0,
      });

      toast.success("Item removed from cart");
    } catch (error) {
      console.error(error);

      toast.error(
        error?.message || "Failed to remove item"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ================= CLEAR CART =================
  const handleClear = async () => {
    if (!cart.items.length) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear your cart?"
    );

    if (!confirmed) return;

    try {
      setActionLoading("clear");

      await clearCart(token);

      setCart({
        items: [],
        totalPrice: 0,
      });

      toast.success("Cart cleared successfully");
    } catch (error) {
      console.error(error);

      toast.error(
        error?.message || "Failed to clear cart"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={38}
            className="animate-spin text-[#C58A18]"
          />

          <p className="text-sm font-medium text-[#082B5C]">
            Loading your cart...
          </p>
        </div>
      </div>
    );
  }

  // ================= NOT LOGGED IN =================
  if (!token) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div
          className="
            mx-auto mb-5 flex h-16 w-16
            items-center justify-center
            rounded-2xl bg-[#FFF8E7]
          "
        >
          <ShoppingCart
            size={32}
            className="text-[#C58A18]"
          />
        </div>

        <h2 className="text-2xl font-bold text-[#082B5C]">
          Please Login
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Please login to view your cart.
        </p>
      </div>
    );
  }

  // ================= EMPTY CART =================
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div
          className="
            rounded-2xl
            border border-slate-200
            bg-white
            px-6 py-12
            text-center
            shadow-sm
          "
        >
          <div
            className="
              mx-auto mb-5
              flex h-20 w-20
              items-center justify-center
              rounded-2xl
              bg-[#FFF8E7]
            "
          >
            <ShoppingBag
              size={38}
              className="text-[#C58A18]"
            />
          </div>

          <h2 className="text-2xl font-bold text-[#082B5C]">
            Your Cart is Empty
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Looks like you haven't added any rooms yet.
            Explore our properties and find the perfect
            stay for your trip.
          </p>
        </div>
      </div>
    );
  }

  // ================= CART =================
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* ================= HEADER ================= */}
        <div className="mb-8">

          <div className="mb-2 flex items-center gap-3">
            <span className="h-px w-8 bg-[#C58A18]" />

            <span
              className="
                text-xs font-semibold
                uppercase tracking-widest
                text-[#C58A18]
              "
            >
              Your Selection
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ShoppingCart
              size={30}
              className="text-[#C58A18]"
            />

            <h1 className="text-3xl font-bold text-[#082B5C]">
              My Cart
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Review your selected rooms before booking.
          </p>
        </div>

        {/* ================= MAIN GRID ================= */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ================= ITEMS ================= */}
          <div className="space-y-4 lg:col-span-2">

            {cart.items.map((item) => (
              <div
                key={item._id}
                className="
                  overflow-hidden
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  shadow-sm
                  transition-all duration-300
                  hover:border-[#C58A18]/40
                  hover:shadow-md
                "
              >

                {/* Gold Accent */}
                <div
                  className="
                    h-1 w-full
                    bg-gradient-to-r
                    from-[#082B5C]
                    via-[#C58A18]
                    to-[#082B5C]
                  "
                />

                <div className="p-5">

                  {/* ================= ITEM HEADER ================= */}
                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <h3
                        className="
                          text-lg font-bold
                          text-[#082B5C]
                        "
                      >
                        {item.room?.title || "Room"}
                      </h3>

                      {item.room?.property?.name && (
                        <p className="mt-1 text-sm text-slate-500">
                          {item.room.property.name}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(item._id)
                      }
                      disabled={
                        actionLoading === item._id
                      }
                      className="
                        flex h-9 w-9
                        items-center justify-center
                        rounded-lg
                        border border-red-100
                        bg-red-50
                        text-red-500
                        transition
                        hover:bg-red-500
                        hover:text-white
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                      title="Remove item"
                    >
                      {actionLoading === item._id ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>

                  {/* ================= ITEM DETAILS ================= */}
                  <div
                    className="
                      mt-5
                      flex flex-col
                      gap-4
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >

                    {/* Price */}
                    <div>
                      <p className="text-xs text-slate-500">
                        Price per night
                      </p>

                      <p className="mt-1 text-xl font-bold text-[#082B5C]">
                        ${item.price}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div>
                      <p className="mb-2 text-xs text-slate-500">
                        Quantity
                      </p>

                      <div
                        className="
                          flex items-center
                          overflow-hidden
                          rounded-xl
                          border border-slate-200
                        "
                      >
                        <button
                          type="button"
                          disabled={
                            item.quantity <= 1 ||
                            actionLoading === item._id
                          }
                          onClick={() =>
                            handleQtyChange(
                              item._id,
                              item.quantity - 1
                            )
                          }
                          className="
                            flex h-10 w-10
                            items-center justify-center
                            text-[#082B5C]
                            transition
                            hover:bg-[#FFF8E7]
                            hover:text-[#C58A18]
                            disabled:cursor-not-allowed
                            disabled:opacity-30
                          "
                        >
                          <Minus size={16} />
                        </button>

                        <span
                          className="
                            flex h-10 min-w-12
                            items-center justify-center
                            border-x border-slate-200
                            px-3
                            text-sm font-bold
                            text-[#082B5C]
                          "
                        >
                          {actionLoading === item._id ? (
                            <Loader2
                              size={16}
                              className="
                                animate-spin
                                text-[#C58A18]
                              "
                            />
                          ) : (
                            item.quantity
                          )}
                        </span>

                        <button
                          type="button"
                          disabled={
                            actionLoading === item._id
                          }
                          onClick={() =>
                            handleQtyChange(
                              item._id,
                              item.quantity + 1
                            )
                          }
                          className="
                            flex h-10 w-10
                            items-center justify-center
                            text-[#082B5C]
                            transition
                            hover:bg-[#FFF8E7]
                            hover:text-[#C58A18]
                            disabled:cursor-not-allowed
                            disabled:opacity-30
                          "
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500">
                        Item Total
                      </p>

                      <p className="mt-1 text-xl font-bold text-[#C58A18]">
                        $
                        {(
                          Number(item.price || 0) *
                          Number(item.quantity || 0)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ================= SUMMARY ================= */}
          <div className="lg:col-span-1">

            <div
              className="
                sticky top-6
                overflow-hidden
                rounded-2xl
                border border-slate-200
                bg-white
                shadow-sm
              "
            >

              {/* Summary Header */}
              <div
                className="
                  bg-[#082B5C]
                  px-5 py-4
                "
              >
                <h2 className="text-lg font-bold text-white">
                  Order Summary
                </h2>

                <p className="mt-1 text-xs text-slate-300">
                  Your selected rooms
                </p>
              </div>

              <div className="p-5">

                {/* Items */}
                <div className="flex justify-between py-3">
                  <span className="text-sm text-slate-500">
                    Items
                  </span>

                  <span className="text-sm font-semibold text-[#082B5C]">
                    {cart.items.length}
                  </span>
                </div>

                <div className="border-t border-slate-100" />

                {/* Total */}
                <div className="flex items-center justify-between py-5">
                  <span className="text-base font-semibold text-[#082B5C]">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-[#C58A18]">
                    $
                    {Number(
                      cart.totalPrice || 0
                    ).toFixed(2)}
                  </span>
                </div>

                {/* Checkout */}
                <button
                  type="button"
                  className="
                    w-full
                    rounded-xl
                    bg-[#082B5C]
                    px-5 py-3
                    text-sm font-bold
                    text-white
                    transition-all duration-300
                    hover:bg-[#C58A18]
                    hover:shadow-lg
                    active:scale-[0.98]
                  "
                >
                  Proceed to Booking
                </button>

                {/* Clear */}
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={actionLoading === "clear"}
                  className="
                    mt-3
                    flex w-full
                    items-center justify-center
                    gap-2
                    rounded-xl
                    border border-slate-200
                    bg-white
                    px-5 py-3
                    text-sm font-semibold
                    text-slate-600
                    transition
                    hover:border-red-200
                    hover:bg-red-50
                    hover:text-red-500
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {actionLoading === "clear" ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <X size={16} />
                  )}

                  Clear Cart
                </button>

                <p className="mt-4 text-center text-xs text-slate-400">
                  Prices are shown before applicable taxes
                  and fees.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;