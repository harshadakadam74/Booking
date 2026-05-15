import React, { useEffect, useState } from 'react';
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../../services/cartService';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    fetchCart(token).then(setCart).catch(console.error);
  }, [token]);

  const handleQtyChange = async (itemId, quantity) => {
    const updated = await updateCartItem({ itemId, quantity }, token);
    setCart(updated);
  };

  const handleRemove = async (itemId) => {
    const updated = await removeCartItem(itemId, token);
    setCart(updated);
  };

  const handleClear = async () => {
    await clearCart(token);
    setCart({ items: [], totalPrice: 0 });
  };

  return (
    <div>
      <h2>My Cart</h2>
      {cart.items.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          <ul>
            {cart.items.map((item) => (
              <li key={item._id}>
                <div>{item.room?.title || 'Room'}</div>
                <div>Price: {item.price}</div>
                <div>
                  Qty:
                  <button onClick={() => handleQtyChange(item._id, item.quantity - 1)}>-</button>
                  {item.quantity}
                  <button onClick={() => handleQtyChange(item._id, item.quantity + 1)}>+</button>
                </div>
                <button onClick={() => handleRemove(item._id)}>Remove</button>
              </li>
            ))}
          </ul>
          <div>Total: {cart.totalPrice}</div>
          <button onClick={handleClear}>Clear Cart</button>
        </>
      )}
    </div>
  );
};

export default Cart;