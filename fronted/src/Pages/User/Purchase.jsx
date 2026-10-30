import { useOrderConfirmationQuery } from '@/hooks/payment.hook';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Home,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Truck,
  CreditCard,
  Calendar
} from 'lucide-react';

const Purchase = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const { data, isLoading, isError, error, refetch, isFetching } = useOrderConfirmationQuery(sessionId);

  // State 1: No session ID provided in URL
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">No Payment Session</h1>
            <p className="text-sm text-gray-500 mt-1">
              We could not find an active payment session in this URL. If you recently placed an order, you can check your order history in your profile.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/product" className="w-full">
              <button className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer">
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Products</span>
              </button>
            </Link>
            <Link to="/" className="w-full">
              <button className="w-full h-11 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer">
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Verification in Progress
  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center justify-center space-y-5">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-100 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                Confirming your payment
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Please wait while we process and verify your order with Stripe...
              </p>
              <p className="text-xs text-gray-400">
                This usually takes just a few moments.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Verification Error
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
          <div className="bg-red-50 border-b border-red-100 p-6 flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <AlertCircle className="w-9 h-9" />
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <h1 className="text-xl font-bold text-gray-900">
                Payment Confirmation Issue
              </h1>
              <p className="text-sm text-gray-600">
                {error?.response?.data?.message || 'We could not automatically confirm your payment session. If your card was charged, your order may already be saved.'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 font-mono break-all border border-gray-200">
              Session: {sessionId.slice(0, 28)}...
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => refetch()}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Confirmation</span>
              </button>

              <Link to="/profile" className="block">
                <button className="w-full h-11 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer">
                  <span>Check Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <Link to="/" className="block">
                <button className="w-full h-10 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors cursor-pointer">
                  Return to Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 4: Order Confirmed Successfully
  const order = data?.order;
  const orderId = order?._id ? `#${order._id.slice(-8).toUpperCase()}` : '#CONFIRMED';
  const orderTotal = Number(order?.totalAmount || 0);
  const products = order?.products || [];
  const createdAtFormatted = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Main Success Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-b from-green-50 to-white border-b border-green-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-green-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">
              Thank you for your order! Your payment has been processed and your items are now being prepared.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Order Meta Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200/80 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Order Number</p>
                <p className="font-mono font-bold text-gray-900 mt-0.5">{orderId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Order Date</p>
                <p className="font-semibold text-gray-800 mt-0.5">{createdAtFormatted}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-gray-500 uppercase font-medium">Payment Status</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                  Paid
                </span>
              </div>
            </div>

            {/* Delivery Info Box */}
            <div className="flex items-center gap-3 p-4 bg-blue-50/60 border border-blue-200/60 rounded-xl text-blue-950">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm">
                <p className="font-semibold text-blue-900">Standard Delivery</p>
                <p className="text-blue-700/80">Estimated delivery within 3 - 5 business days.</p>
              </div>
            </div>

            {/* Ordered Products Section */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gray-700" />
                  <span>Ordered Products ({products.length})</span>
                </h2>
                <span className="text-xs text-gray-500 font-medium">
                  {products.reduce((acc, p) => acc + (p.quantity || 1), 0)} item(s) total
                </span>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  <p>Your ordered items will be displayed in your profile shortly.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {products.map((item, idx) => {
                    const productObj = item.product || {};
                    const name = productObj.name || item.name || 'Product';
                    const image = productObj.image || item.image || '';
                    const price = Number(item.price || productObj.price || 0);
                    const quantity = Number(item.quantity || 1);
                    const itemTotal = price * quantity;

                    return (
                      <div key={item._id || idx} className="py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Product Image */}
                          <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                            {image ? (
                              <img
                                src={image}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                }}
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                              {name}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span>Qty: <strong className="text-gray-700">{quantity}</strong></span>
                              <span>•</span>
                              <span>Price: <strong className="text-gray-700">${price.toFixed(2)}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right shrink-0">
                          <p className="font-bold text-gray-900 text-sm sm:text-base">
                            ${itemTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 border border-gray-200/80 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">${orderTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
              <div className="border-t border-gray-200 pt-2.5 flex justify-between items-center text-base">
                <span className="font-bold text-gray-900">Total Paid</span>
                <span className="text-xl font-extrabold text-green-700">
                  ${orderTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link to="/product" className="flex-1">
                <button className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-sm">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </button>
              </Link>
              <Link to="/" className="flex-1">
                <button className="w-full h-11 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer">
                  <Home className="w-4 h-4" />
                  <span>Back to Home</span>
                </button>
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Purchase;
