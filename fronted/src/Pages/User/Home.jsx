import FeaturedProducts from './FeaturedProducts'
import { useGetFeaturedProduct } from '@/hooks/product.hook'
import Footer from '@/components/Footer'
import CustomerReview from '@/components/CustomerReview'

const Home = () => {
  const { data } = useGetFeaturedProduct()
    
  return (
    <div className='min-h-screen w-full'>
        <div className='h-[60vh] w-full'>
            <img src="/img.jpg" className='w-full h-full object-cover' alt="Hero Banner" />
        </div>

        <div className='min-h-fit w-full max-w-[1400px] mx-auto'>
          <h1 className='font-semibold text-2xl mx-9 my-6'>Featured Products</h1>
          <div className='flex flex-wrap gap-9 mt-9 mb-8 px-9'>
           {
            data?.map((item, index) => {
              return (
                <div key={item?._id || index}>
                   <FeaturedProducts item={item} />
                </div>
              )
            })
           }
          </div>
        </div>
        <CustomerReview />
        <Footer />
    </div>
  )
}

export default Home
