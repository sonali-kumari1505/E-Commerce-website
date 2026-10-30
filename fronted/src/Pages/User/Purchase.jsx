import { useCreateSuccessHook } from '@/hooks/payment.hook';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, Home, ArrowRight, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';

const Purchase = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const hasTriggeredRef = useRef(false);
  const [countdown, setCountdown] = useState(8);
  const [autoRedirect, setAutoRedirect] = useState(true);

  const { mutate, isSuccess, isPending, isError, error, data } = useCreateSuccessHook();

  const handleConfirm = () => {
    if (sessionId) {
      mutate(sessionId);
    }
  };

  useEffect(() => {
    if (sessionId && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      mutate(sessionId);
    }
  }, [sessionId, mutate]);

  useEffect(() => {
    if (isSuccess && autoRedirect) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = '/';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSuccess, autoRedirect]);

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
              We could not find an active payment session. If you recently placed an order, please check your profile.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/product" className="w-full">
              <button className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Products</span>
              </button>
            </Link>
            <Link to="/profile" className="w-full">
              <button className="w-full h-11 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2">
                <span>View Orders in Profile</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Verification Pending
  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Confirming your payment
              </h2>
              <p className="text-sm text-gray-500">
                Please wait while we process and verify your order with Stripe...
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
              Session: {sessionId.slice(0, 24)}...
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleConfirm}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Confirmation</span>
              </button>

              <Link to="/profile" className="block">
                <button className="w-full h-11 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <span>Check Profile Orders</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <Link to="/" className="block">
                <button className="w-full h-10 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
                  Return to Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 4: Success
  const order = data?.order;
  const orderId = order?._id ? `#${order._id.slice(-8).toUpperCase()}` : null;
  const orderTotal = order?.totalAmount ? `$${order.totalAmount.toFixed(2)}` : null;
  const itemCount = order?.products?.length || null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Success Icon Header */}
        <div className="bg-green-50 border-b border-green-100 p-8 flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 text-sm">
              Thank you! Your payment was successful and your order has been placed.
            </p>
          </div>

          {/* Order Info Card */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
            {orderId && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-semibold text-gray-900 font-mono">{orderId}</span>
              </div>
            )}
            {orderTotal && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total Paid:</span>
                <span className="font-semibold text-green-700">{orderTotal}</span>
              </div>
            )}
            {itemCount && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Items:</span>
                <span className="font-medium text-gray-800">{itemCount} item(s)</span>
              </div>
            )}
            <div className="flex items-start space-x-3 pt-2 border-t border-gray-200">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">
                  You can track your order status and items anytime in your user profile.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link to="/profile" className="block">
              <button className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2">
                <span>View Order in Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <Link to="/" className="block">
              <button className="w-full h-11 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </Link>
          </div>

          {/* Redirect Notice */}
          {autoRedirect && (
            <div className="text-center pt-1">
              <p className="text-xs text-gray-400">
                Redirecting to home page in {countdown}s...{' '}
                <button
                  onClick={() => setAutoRedirect(false)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Stay here
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Purchase;
