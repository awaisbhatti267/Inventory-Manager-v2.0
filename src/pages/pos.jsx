import React, { useEffect, useState } from 'react';
import API_URL from '../config';

import ProductSearch from '../components/pos/productSearch';
import ProductGrid from '../components/pos/productGrid';
import Cart from '../components/pos/cart';
import Receipt from '../components/pos/Receipt';

const POS = () => {
  // Cart items
  const [cart, setCart] = useState([]);

  // Sale message
  const [saleMessage, setSaleMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  // Product refresh
  const [refreshProducts, setRefreshProducts] = useState(0);

  // Search + Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('all');

  // Receipt
  const [receipt, setReceipt] = useState(null);

  // =========================
  // SEARCH DEBOUNCE
  // =========================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // =========================
  // ADD TO CART
  // =========================
  function addToCart(product) {
    const existingProduct = cart.find((item) => item.id === product.id);

    if (existingProduct) {
      if (existingProduct.quantity >= product.stock) {
        return;
      }

      const updatedCart = cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );

      setCart(updatedCart);
    } else {
      if (product.stock <= 0) {
        return;
      }

      setCart([...cart, { ...product, quantity: 1 }]);
    }
  }

  // =========================
  // INCREASE QUANTITY
  // =========================
  function increaseQuantity(id) {
    const updatedCart = cart.map((item) => {
      if (item.id === id && item.quantity < item.stock) {
        return { ...item, quantity: item.quantity + 1 };
      }

      return item;
    });

    setCart(updatedCart);
  }

  // =========================
  // DECREASE QUANTITY
  // =========================
  function decreaseQuantity(id) {
    const product = cart.find((item) => item.id === id);

    if (!product) {
      return;
    }

    if (product.quantity === 1) {
      const updatedCart = cart.filter((item) => item.id !== id);
      setCart(updatedCart);
    } else {
      const updatedCart = cart.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );

      setCart(updatedCart);
    }
  }

  // =========================
  // REMOVE FROM CART
  // =========================
  function removeFromCart(id) {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
  }

  // =========================
  // CLOSE RECEIPT
  // =========================
  function closeReceipt() {
    setReceipt(null);
  }

  // =========================
  // SHOW MESSAGE
  // =========================
  function showMessage(message, type) {
    setSaleMessage(message);
    setMessageType(type);

    setTimeout(() => {
      setSaleMessage('');
    }, 3000);
  }

  // =========================
  // COMPLETE SALE
  // =========================
  async function completeSale() {
    const total = cart.reduce(
      (sum, product) => sum + Number(product.price) * product.quantity,
      0
    );

    try {
      const response = await fetch(`${API_URL}/complete-sale`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart,
          total,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save receipt before clearing cart
        setReceipt({
          saleId: data.saleId,
          items: [...cart],
          total: total,
          date: new Date(),
        });

        // Clear cart
        setCart([]);

        // Refresh products / stock
        setRefreshProducts((prev) => prev + 1);

        // Success message
        showMessage('Sale completed successfully', 'success');
      } else {
        showMessage(data.message || 'Sale failed', 'error');
      }
    } catch (error) {
      console.error('Complete sale error:', error);
      showMessage('Server error', 'error');
    }
  }

  return (
    <div className="text-[var(--text-color)]">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">POS</h1>
          <p className="mt-1 text-sm text-[var(--muted-color)]">
            Create a new sale and generate bill
          </p>
        </div>
      </div>

      {/* POS Layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        {/* Products Section */}
        <section className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-bg)] p-5">
          <h2 className="mb-4 text-xl font-semibold">Products</h2>

          {/* Search + Category */}
          <ProductSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            category={category}
            setCategory={setCategory}
          />

          {/* Products */}
          <ProductGrid
            addToCart={addToCart}
            refreshProducts={refreshProducts}
            searchTerm={debouncedSearch}
            category={category}
          />
        </section>

        {/* Cart + Receipt Section */}
        <section className="space-y-4">
          <Cart
            cart={cart}
            increaseQuantity={increaseQuantity}
            decreaseQuantity={decreaseQuantity}
            removeFromCart={removeFromCart}
            completeSale={completeSale}
            saleMessage={saleMessage}
            messageType={messageType}
          />

          {/* Receipt */}
          {receipt && (
            <Receipt receipt={receipt} closeReceipt={closeReceipt} />
          )}
        </section>
      </div>
    </div>
  );
};

export default POS;