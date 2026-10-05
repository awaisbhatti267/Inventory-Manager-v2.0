import React, { useEffect, useState } from 'react';
import ProductCard from './productCard';
import API_URL from '../../config';

const ProductGrid = ({
    addToCart,
    refreshProducts,
    searchTerm,
    category
}) => {

    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const productsPerPage = 4;


    // =========================
    // FETCH PRODUCTS
    // =========================
    useEffect(() => {
        fetchProducts();
    }, [refreshProducts]);


    async function fetchProducts() {

        try {

            const response = await fetch(
                `${API_URL}/add-product`
            );

            const data = await response.json();

            if (response.ok) {
                setProducts(data);
            }

        } catch (error) {

            console.error(
                'Error fetching products:',
                error
            );
        }
    }


    // =========================
    // RESET PAGE ON SEARCH/FILTER
    // =========================
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, category]);


    // =========================
    // FILTER PRODUCTS
    // =========================
    const filteredProducts = products.filter((product) => {

        const search = searchTerm
            .toLowerCase()
            .trim();

        // Search by name OR category
        const matchesSearch =
            product.name
                .toLowerCase()
                .includes(search) ||
            product.category
                .toLowerCase()
                .includes(search);


        // Category dropdown
        const matchesCategory =
            category === 'all' ||
            product.category === category;


        return matchesSearch && matchesCategory;
    });


    // =========================
    // PAGINATION
    // =========================
    const lastIndex =
        currentPage * productsPerPage;

    const firstIndex =
        lastIndex - productsPerPage;

    const currentProducts =
        filteredProducts.slice(
            firstIndex,
            lastIndex
        );

    const totalPages =
        Math.ceil(
            filteredProducts.length / productsPerPage
        );


    return (
        <>

            {/* Products Grid */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

                {currentProducts.length > 0 ? (

                    currentProducts.map((product) => (

                        <ProductCard
                            key={product.id}
                            product={product}
                            addToCart={addToCart}
                        />

                    ))

                ) : (

                    <p className="col-span-2 py-10 text-center text-[var(--muted-color)]">
                        No products found
                    </p>

                )}

            </div>


            {/* Pagination */}
            {totalPages > 1 && (

                <div className="mt-6 flex items-center justify-center gap-4">

                    <button
                        onClick={() =>
                            setCurrentPage(
                                (prev) => prev - 1
                            )
                        }
                        disabled={currentPage === 1}
                        className="rounded-lg border border-[var(--border-color)] px-4 py-2 text-[var(--text-color)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>


                    <span className="text-[var(--muted-color)]">
                        Page {currentPage} of {totalPages}
                    </span>


                    <button
                        onClick={() =>
                            setCurrentPage(
                                (prev) => prev + 1
                            )
                        }
                        disabled={currentPage === totalPages}
                        className="rounded-lg border border-[var(--border-color)] px-4 py-2 text-[var(--text-color)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                    </button>

                </div>

            )}

        </>
    );
};

export default ProductGrid;