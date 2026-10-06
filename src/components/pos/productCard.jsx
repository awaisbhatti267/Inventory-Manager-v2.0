import React from 'react';
import { FiBox } from 'react-icons/fi';
import API_URL from '../../config';

const ProductCard = ({ product, addToCart }) => {
  
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4">

      <div className="mb-4 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-[var(--input-bg)]">
        {product.image ? (
          <img
            src={`${API_URL}/${product.image.replace(/^\/+/, '')}`}
            alt={product.name}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <FiBox size={40} className="text-[var(--muted-color)]" />
        )}
      </div>

      <p className="text-sm text-[var(--muted-color)]">
        {product.category}
      </p>

      <h3 className="mt-1 font-semibold text-[var(--text-color)]">
        {product.name}
      </h3>

      <p className="mt-2 text-lg font-bold text-[#0969FF]">
        Rs. {product.price}
      </p>

      <div className="mt-3 flex items-center justify-between">

        <span className="text-sm text-green-500">
          Stock: {product.stock}
        </span>

        <button
          onClick={() => addToCart(product)}
          className="rounded-lg bg-[#0969FF] px-4 py-2 font-medium text-white hover:bg-[#075bd8]"
        >
          Add
        </button>

      </div>

    </div>
  );
};

export default ProductCard;