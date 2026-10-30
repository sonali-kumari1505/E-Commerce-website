import { useState } from 'react';
import { useCreateReviewHook, useGetReviewsHook, useHelpfulReviewHook } from '@/hooks/review.hook';
import { useUserStore } from '@/store/userStore';
import { Star, ThumbsUp, CheckCircle, X, Loader2, MessageSquarePlus } from 'lucide-react';
import { toast } from 'sonner';

const CustomerReview = () => {
  const user = useUserStore((state) => state.user);
  const { data, isLoading } = useGetReviewsHook();
  const { mutate: submitReview, isPending } = useCreateReviewHook({
    onSuccess: () => {
      setIsModalOpen(false);
      resetForm();
    }
  });
  const { mutate: markHelpful } = useHelpfulReviewHook();

  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');

  // Fallback initial reviews if still loading
  const defaultReviews = [
    {
      _id: '1',
      name: 'Rahul Sharma',
      rating: 5,
      createdAt: '2025-11-28',
      title: 'Excellent quality!',
      comment: 'The product exceeded my expectations. Great quality and fast delivery. Highly recommended!',
      verified: true,
      helpful: 24
    },
    {
      _id: '2',
      name: 'Priya Patel',
      rating: 4,
      createdAt: '2025-11-25',
      title: 'Good value for money',
      comment: 'Overall satisfied with the purchase. The fit is perfect and the material is comfortable.',
      verified: true,
      helpful: 18
    },
    {
      _id: '3',
      name: 'Amit Kumar',
      rating: 5,
      createdAt: '2025-11-20',
      title: 'Amazing product',
      comment: 'This is my second purchase from this store. Never disappointed with the quality and service.',
      verified: true,
      helpful: 32
    },
    {
      _id: '4',
      name: 'Sneha Reddy',
      rating: 4,
      createdAt: '2025-11-15',
      title: 'Pretty good',
      comment: 'Nice product, delivery was on time. Only minor issue was the packaging could be better.',
      verified: false,
      helpful: 12
    }
  ];

  const reviews = data?.reviews && data.reviews.length > 0 ? data.reviews : defaultReviews;

  // Calculate rating statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, review) => acc + (Number(review.rating) || 5), 0) / totalReviews).toFixed(1)
    : '5.0';

  const ratingCounts = [5, 4, 3, 2, 1].map(r =>
    reviews.filter(review => Math.round(Number(review.rating)) === r).length
  );

  // Filter reviews
  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter(review => Math.round(Number(review.rating)) === parseInt(filter));

  const resetForm = () => {
    setRating(5);
    setHoverRating(0);
    setTitle('');
    setComment('');
    setName('');
  };

  const handleOpenModal = () => {
    if (user?.name) {
      setName(user.name);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a star rating');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a review title');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please enter your review feedback');
      return;
    }

    submitReview({
      rating,
      title: title.trim(),
      comment: comment.trim(),
      name: name.trim() || user?.name || 'Verified Buyer'
    });
  };

  const starLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  // Star rendering function
  const renderStars = (starCount) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < starCount
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-200 fill-gray-100'
        }`}
      />
    ));
  };

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
      {/* Section Header */}
      <div className='text-center mb-12'>
        <h2 className='text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-2'>
          Customer Reviews
        </h2>
        <p className='text-gray-600 text-sm'>See what our customers are saying</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        
        {/* Left Sidebar - Rating Summary */}
        <div className='lg:col-span-1'>
          <div className='bg-white border border-gray-200 rounded-xl p-6 sticky top-20 shadow-sm'>
            {/* Overall Rating */}
            <div className='text-center pb-6 border-b border-gray-200'>
              <div className='text-5xl font-extrabold text-gray-900 mb-2'>
                {averageRating}
              </div>
              <div className='flex items-center justify-center gap-1 mb-2'>
                {renderStars(Math.round(Number(averageRating)))}
              </div>
              <p className='text-sm text-gray-600'>
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className='pt-6 space-y-3'>
              {[5, 4, 3, 2, 1].map((star, index) => {
                const count = ratingCounts[index];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                const isSelected = filter === star.toString();

                return (
                  <button
                    key={star}
                    type='button'
                    onClick={() => setFilter(isSelected ? 'all' : star.toString())}
                    className={`w-full flex items-center gap-3 p-1.5 rounded-lg transition-colors text-left ${
                      isSelected ? 'bg-yellow-50 ring-1 ring-yellow-400' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className='flex items-center gap-1 w-10 text-sm font-medium text-gray-700'>
                      <span>{star}</span>
                      <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                    </div>
                    <div className='flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden'>
                      <div 
                        className='h-full bg-yellow-400 rounded-full transition-all duration-300'
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className='text-xs text-gray-500 w-8 text-right font-medium'>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Filter Reset */}
            {filter !== 'all' && (
              <button
                type='button'
                onClick={() => setFilter('all')}
                className='w-full mt-4 text-xs text-gray-600 hover:text-black font-semibold underline text-center cursor-pointer'
              >
                Clear filter (Showing {filter} stars only)
              </button>
            )}

            {/* Write Review Button */}
            <button
              type='button'
              onClick={handleOpenModal}
              className='w-full mt-6 bg-black hover:bg-zinc-800 text-white py-3.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]'
            >
              <MessageSquarePlus className='w-4 h-4' />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Right Content - Reviews List */}
        <div className='lg:col-span-2 space-y-6'>
          {filteredReviews.length === 0 ? (
            <div className='text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 p-8'>
              <MessageSquarePlus className='w-12 h-12 text-gray-300 mx-auto mb-3' />
              <h3 className='text-base font-semibold text-gray-900 mb-1'>No reviews found</h3>
              <p className='text-sm text-gray-500 mb-4'>
                {filter !== 'all'
                  ? `There are no ${filter}-star reviews yet.`
                  : 'Be the first to share your experience!'}
              </p>
              <button
                type='button'
                onClick={handleOpenModal}
                className='inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors cursor-pointer'
              >
                Write a Review
              </button>
            </div>
          ) : (
            filteredReviews.map((review) => {
              const reviewDate = review.createdAt || review.date;
              const formattedDate = reviewDate
                ? new Date(reviewDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Recently';

              return (
                <div key={review._id || review.id} className='bg-white border border-gray-200 rounded-xl p-6 shadow-xs hover:border-gray-300 transition-colors'>
                  {/* Review Header */}
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex items-center gap-3'>
                      {/* User Avatar */}
                      <div className='w-11 h-11 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-base uppercase shrink-0'>
                        {review.name ? review.name.charAt(0) : 'U'}
                      </div>
                      <div>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <h3 className='font-semibold text-gray-900 text-sm sm:text-base'>
                            {review.name}
                          </h3>
                          {review.verified !== false && (
                            <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60'>
                              <CheckCircle className='w-3 h-3 text-emerald-600' />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        <p className='text-xs text-gray-400 mt-0.5'>
                          {formattedDate}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className='flex items-center gap-1 mb-2.5'>
                    {renderStars(Number(review.rating) || 5)}
                  </div>

                  {/* Review Title */}
                  <h4 className='font-bold text-gray-900 text-base mb-1.5'>
                    {review.title}
                  </h4>

                  {/* Review Comment */}
                  <p className='text-gray-600 text-sm leading-relaxed mb-4 whitespace-pre-line'>
                    {review.comment}
                  </p>

                  {/* Review Footer */}
                  <div className='flex items-center gap-6 pt-3.5 border-t border-gray-100 text-xs'>
                    <button
                      type='button'
                      onClick={() => markHelpful(review._id || review.id)}
                      className='flex items-center gap-1.5 text-gray-500 hover:text-black transition-colors font-medium cursor-pointer'
                    >
                      <ThumbsUp className='w-3.5 h-3.5' />
                      <span>Helpful ({review.helpful || 0})</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200'>
          <div 
            className='bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden relative'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex items-center justify-between p-6 border-b border-gray-100'>
              <div>
                <h3 className='text-xl font-bold text-gray-900'>Write a Customer Review</h3>
                <p className='text-xs text-gray-500 mt-0.5'>Share your honest thoughts about our products and service</p>
              </div>
              <button
                type='button'
                onClick={() => setIsModalOpen(false)}
                className='w-8 h-8 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className='p-6 space-y-5'>
              {/* Star Rating Picker */}
              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2'>
                  Overall Rating <span className='text-red-500'>*</span>
                </label>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type='button'
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className='p-1 hover:scale-110 transition-transform cursor-pointer'
                        >
                          <Star
                            className={`w-7 h-7 ${
                              active
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-200 fill-gray-100'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className='text-sm font-semibold text-gray-700 ml-2'>
                    {starLabels[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Your Name */}
              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5'>
                  Your Name
                </label>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={user?.name || 'e.g. Sonam Singh'}
                  className='w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent'
                />
              </div>

              {/* Review Headline */}
              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5'>
                  Review Headline <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='e.g. Excellent quality, exceeded my expectations!'
                  required
                  className='w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent'
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5'>
                  Review Details <span className='text-red-500'>*</span>
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder='What did you like or dislike? How was the fabric, sizing, fit, and delivery speed?'
                  required
                  className='w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none'
                />
              </div>

              {/* Action Buttons */}
              <div className='flex items-center justify-end gap-3 pt-3 border-t border-gray-100'>
                <button
                  type='button'
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPending}
                  className='px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isPending}
                  className='bg-black hover:bg-zinc-800 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50'
                >
                  {isPending ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerReview;
