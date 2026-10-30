import { addToCart, removeAllApi, removeFromCartApi, updateQuantityApi } from '@/assets/Api/cart.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useAddToCartHook = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: addToCart,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['getUser'] })
            queryClient.invalidateQueries({ queryKey: ['getCartItem'] })
            toast.success(data.message || "Product added to cart")
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to add to cart")
        }
    })
}

export const useUpdateQuantity = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateQuantityApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['getCartItem'] })
            queryClient.invalidateQueries({ queryKey: ['getUser'] })
            toast.success(data.message || "Cart updated")
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to update quantity")
        }
    })
}

export const useRemoveCartItemHook = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: removeFromCartApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['getCartItem'] })
            queryClient.invalidateQueries({ queryKey: ['getUser'] })
            toast.success(data.message || "Item removed from cart")
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to remove item")
        }
    })
}

export const useClearCartHook = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: removeAllApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['getCartItem'] })
            queryClient.invalidateQueries({ queryKey: ['getUser'] })
            toast.success(data.message || "Cart cleared")
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to clear cart")
        }
    })
}
