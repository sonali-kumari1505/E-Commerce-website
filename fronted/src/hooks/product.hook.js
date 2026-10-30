import { createProductApi, deleteProductApi, getAllProductApi, getFeaturedProductApi, getSingleProductApi, toggleProductApi } from "@/assets/Api/product.api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateProduct = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createProductApi,
        onSuccess: () => {
            toast.success("Product created successfully")
            queryClient.invalidateQueries({ queryKey: ['getAllProduct'] })
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to create product")
        }
    })
}

export const useGetAllProductHook = ({
  page = 1,
  limit = 20,
  search = "",
  category = "",
  minPrice = "",
  maxPrice = ""
} = {}) => {
  return useQuery({
    queryKey: [
      'getAllProduct',
      page,
      limit,
      search,
      category,
      minPrice,
      maxPrice
    ],
    queryFn: () =>
      getAllProductApi({
        page,
        limit,
        search,
        category,
        minPrice,
        maxPrice
      }),
    placeholderData: (previousData) => previousData
  });
};

export const useDeleteProductApi = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteProductApi,
        onSuccess: () => {
            toast.success("Product deleted successfully")
            queryClient.invalidateQueries({ queryKey: ['getAllProduct'] })
            queryClient.invalidateQueries({ queryKey: ['getFeatured'] })
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to delete product")
        }
    })
}

export const useToggleProduct = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: toggleProductApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['getAllProduct'] })
            queryClient.invalidateQueries({ queryKey: ['getFeatured'] })
            toast.success("Product featured status toggled successfully")
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to toggle product status")
        }
    })
}

export const useGetSingleProduct = (id) => {
    return useQuery({
        queryFn: () => getSingleProductApi(id),
        queryKey: ['getSingleProduct', id],
        enabled: !!id
    })
}

export const useGetFeaturedProduct = () => {
    return useQuery({
        queryFn: getFeaturedProductApi,
        queryKey: ['getFeatured']
    })
}

// Backward compatibility alias for the old typo
export const useGetFeaturedProcut = useGetFeaturedProduct;
