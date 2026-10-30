import { useCreateProduct, useDeleteProductApi, useGetAllProductHook, useToggleProduct } from '@/hooks/product.hook'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useForm } from 'react-hook-form'
import { Spinner } from '@/components/ui/spinner'

const ProductDashboard = () => {
  const [searchInput, setsearchInput] = useState("")
  const [page, setpage] = useState(1)
  const [activeSearch, setactiveSearch] = useState("")

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setpage(1)
    setactiveSearch(searchInput)
  }

  const { data } = useGetAllProductHook({
    page,
    search: activeSearch,
  })

  const { mutate, isPending } = useCreateProduct()
  const { mutate: toggleProduct } = useToggleProduct()
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProductApi()
  const { register, handleSubmit, reset } = useForm()

  const createProductHandler = (formData) => {
    const payload = new FormData()

    if (formData.name) payload.append("name", formData.name)
    if (formData.description) payload.append("description", formData.description)
    if (formData.price) payload.append("price", formData.price)
    if (formData.category) payload.append("category", formData.category)
    if (formData.image && formData.image[0]) payload.append("image", formData.image[0])
    
    mutate(payload, {
      onSuccess: () => reset()
    })
  }

  const createToggle = (id) => {
    toggleProduct(id)
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProduct(id)
    }
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-[1400px] mx-auto px-8 py-8'>
        
        {/* Header Section */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Products</h1>
            <p className='text-sm text-gray-600 mt-1'>{data?.total || 0} total products</p>
          </div>

          {/* Create Product Button */}
          <Dialog>
            <DialogTrigger asChild>
              <button className='flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors'>
                <Plus className='w-4 h-4' />
                Create Product
              </button>
            </DialogTrigger>
            
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to your inventory
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(createProductHandler)} className='space-y-4 mt-4'>
                <input 
                  type="text" 
                  placeholder='Product Name' 
                  className='w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                  {...register('name', { required: true })} 
                />
                <select 
                  className='w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                  {...register('category', { required: true })}
                >
                  <option value="">Select Category</option>
                  <option value="Mens">Men</option>
                  <option value="Womens">Women</option>
                  <option value="Kids">Kids</option>
                </select>
                <input 
                  type="text" 
                  placeholder='Description' 
                  className='w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                  {...register('description', { required: true })} 
                />
                <input 
                  type="number" 
                  step="0.01"
                  placeholder='Price' 
                  className='w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                  {...register('price', { required: true })} 
                />
                <input 
                  type="file" 
                  accept="image/*"
                  className='w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none'
                  {...register('image')} 
                />
                <button 
                  type='submit' 
                  disabled={isPending}
                  className='w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors disabled:opacity-50 flex items-center justify-center'
                >
                  {isPending ? <Spinner /> : "Create Product"}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className='mb-8'>
          <div className='flex gap-2 max-w-xl'>
            <input 
              type="text" 
              className='flex-1 px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent' 
              placeholder='Search products...'
              value={searchInput} 
              onChange={(e) => setsearchInput(e.target.value)}
            />
            <button 
              type='submit' 
              className='px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2'
            >
              <Search className='w-4 h-4' />
              Search
            </button>
          </div>
        </form>

        {/* Products Table */}
        <div className='border border-gray-200 rounded-lg overflow-hidden'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider'>Product</th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider'>Category</th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider'>Price</th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider'>Featured</th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {data?.products?.map((item) => {
                return (
                  <tr key={item._id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='h-12 w-12 bg-gray-50 rounded-md overflow-hidden flex-shrink-0'>
                          <img 
                            src={item.image} 
                            className='h-full w-full object-cover' 
                            alt={item.name} 
                          />
                        </div>
                        <span className='text-sm font-medium text-gray-900'>{item.name}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-sm text-gray-700'>{item.category}</span>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-sm font-semibold text-gray-900'>${item.price}</span>
                    </td>
                    <td className='px-6 py-4'>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.isFeatured 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.isFeatured ? "Featured" : "Standard"}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <button
                          onClick={() => createToggle(item._id)}
                          className='text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors'
                        >
                          Toggle
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.name)}
                          disabled={isDeleting}
                          className='text-sm font-medium text-red-600 hover:text-red-800 transition-colors flex items-center gap-1'
                          title="Delete product"
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className='flex items-center justify-center gap-6 mt-8'>
            <button 
              disabled={page === 1}
              onClick={() => setpage((prev) => prev - 1)}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                page === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              Previous
            </button>

            <div className='flex items-center gap-2 text-sm'>
              <span className='font-semibold text-gray-900'>{data?.page}</span>
              <span className='text-gray-500'>of</span>
              <span className='font-semibold text-gray-900'>{data?.totalPages}</span>
            </div>

            <button 
              disabled={!data?.hasMore}
              onClick={() => setpage((prev) => prev + 1)}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                !data?.hasMore 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDashboard
