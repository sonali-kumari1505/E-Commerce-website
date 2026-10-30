import { createPaymentApi, createSuccessApi } from '@/assets/Api/payment.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useCreatePaymentHook = () => {
    return useMutation({
        mutationFn: createPaymentApi,
        onSuccess: (data) => {
            if (data?.url) {
                window.location.href = data.url
            } else {
                toast.error("Stripe checkout URL missing")
            }
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to initiate payment")
        }
    })
}

export const useCreateSuccessHook = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createSuccessApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['getCartItem'] })
            queryClient.invalidateQueries({ queryKey: ['getUser'] })
            toast.success(data.message || "Payment processed successfully")
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Payment confirmation failed")
        }
    })
}
