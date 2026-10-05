import React from 'react';
import { FiTrash2 } from 'react-icons/fi';

const Cart = ({
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    completeSale,
    saleMessage,
    messageType
}) => {

    const total = cart.reduce(
        (sum, product) =>
            sum + Number(product.price) * product.quantity,
        0
    );

    return (
        <div className="flex flex-col rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">

            {/* Heading */}
            <h2 className="mb-4 text-xl font-semibold text-[var(--text-color)]">
                Cart
            </h2>


            {/* Scrollable Cart Products */}
            <div className="max-h-[240px] overflow-y-auto pr-2">

                {cart.length === 0 ? (
                    <p className="text-[var(--muted-color)]">
                        Cart is empty
                    </p>
                ) : (
                    <div className="space-y-3">

                        {cart.map((product) => (
                            <div
                                key={product.id}
                                className="relative rounded-lg border border-[var(--border-color)] p-3"
                            >

                                {/* Trash */}
                                <button
                                    onClick={() => removeFromCart(product.id)}
                                    className="absolute right-3 top-3 rounded-md p-1.5 text-red-500 hover:bg-red-500/10"
                                    title="Remove from cart"
                                >
                                    <FiTrash2 size={18} />
                                </button>


                                {/* Product Name */}
                                <h3 className="pr-10 font-semibold text-[var(--text-color)]">
                                    {product.name}
                                </h3>


                                {/* Unit Price */}
                                <p className="text-sm text-[var(--muted-color)]">
                                    Rs. {Number(product.price).toLocaleString()} each
                                </p>


                                {/* Quantity + Subtotal */}
                                <div className="mt-3 flex items-center justify-between">

                                    {/* Quantity */}
                                    <div className="flex items-center gap-3">

                                        <button
                                            onClick={() => decreaseQuantity(product.id)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--input-bg)]"
                                        >
                                            −
                                        </button>

                                        <span className="min-w-6 text-center font-semibold text-[var(--text-color)]">
                                            {product.quantity}
                                        </span>

                                        <button
                                            onClick={() => increaseQuantity(product.id)}
                                            disabled={product.quantity >= product.stock}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0969FF] text-white hover:bg-[#075bd8] disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            +
                                        </button>

                                    </div>


                                    {/* Subtotal */}
                                    <span className="font-semibold text-[var(--text-color)]">
                                        Rs. {(Number(product.price) * product.quantity).toLocaleString()}
                                    </span>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>


            {/* Total + Complete Sale */}
            {cart.length > 0 && (
                <div className="mt-4 shrink-0 border-t border-[var(--border-color)] pt-4">

                    <div className="flex items-center justify-between">

                        <span className="font-medium text-[var(--muted-color)]">
                            Total
                        </span>

                        <span className="text-xl font-bold text-[var(--text-color)]">
                            Rs. {total.toLocaleString()}
                        </span>

                    </div>


                    <button
                        onClick={completeSale}
                        className="mt-4 w-full rounded-lg bg-[#0969FF] py-3 font-semibold text-white hover:bg-[#075bd8]"
                    >
                        Complete Sale
                    </button>

                </div>
            )}


            {/* Sale Message */}
            {saleMessage && (
                <div
                    className={`mt-3 rounded-lg border px-4 py-3 text-center text-sm font-medium ${
                        messageType === 'success'
                            ? 'border-green-500/30 bg-green-500/10 text-green-500'
                            : 'border-red-500/30 bg-red-500/10 text-red-500'
                    }`}
                >
                    {saleMessage}
                </div>
            )}

        </div>
    );
};

export default Cart;