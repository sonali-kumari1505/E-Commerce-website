import { useAddToCartHook } from '@/hooks/cart.hook';
import { Spinner } from '@/components/ui/spinner';
import { useNavigate } from 'react-router-dom';

const FeaturedProducts = ({ item }) => {
  const navigate = useNavigate();
  const { mutate, isPending } = useAddToCartHook();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (item?._id) {
      mutate({ productId: item._id });
    }
  };

  const handleNavigate = () => {
    if (item?._id) {
      navigate(`/product/${item._id}`);
    }
  };

  return (
    <div className="p-2">
      <div 
        onClick={handleNavigate}
        className="group h-[420px] w-72 bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 flex flex-col cursor-pointer"
      >
        {/* Image Container */}
        <div className="h-64 w-full flex items-center justify-center bg-gray-50 p-6">
          <img
            src={item?.image}
            className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-300"
            alt={item?.name || 'Product'}
          />
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col justify-between p-6">
          {/* Product Info */}
          <div className="space-y-1">
            <h3 className="text-gray-900 font-medium text-base leading-snug line-clamp-2">
              {item?.name}
            </h3>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              ${item?.price}
            </p>
          </div>

          {/* CTA Button */}
          <button 
            type="button"
            onClick={handleAddToCart}
            disabled={isPending}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md transition-colors duration-200 mt-4 flex items-center justify-center disabled:opacity-50"
          >
            {isPending ? <Spinner /> : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
