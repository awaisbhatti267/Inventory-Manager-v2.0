import React from 'react';
import { FiSearch } from 'react-icons/fi';

const ProductSearch = ({
  searchTerm,
  setSearchTerm,
  category,
  setCategory
}) => {

  return (
    <div className="flex gap-4">

      {/* Search */}
      <div className="relative flex-1">

        <FiSearch
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-color)]"
          size={20}
        />

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by name or category..."
          className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] py-3 pl-12 pr-4 text-[var(--text-color)] outline-none focus:border-[#0969FF]"
        />

      </div>


      {/* Category Filter */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-4 text-[var(--text-color)] outline-none"
      >
        <option value="all">All Categories</option>
        <option value="Electronics">Electronics</option>
        <option value="Accessories">Accessories</option>
        <option value="Other">Other</option>
      </select>

    </div>
  );
};

export default ProductSearch;