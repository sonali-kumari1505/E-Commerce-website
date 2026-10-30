import { forgotPasswordApi, getCartItem, getUser, loginApi, logoutApi, registerApi, resetPasswordApi, updateProfile } from "@/assets/Api/user.api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export const useRegisterHook = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: registerApi,
        onSuccess: (data) => {
            toast.success(data.message || "Registration successful")
            queryClient.invalidateQueries({ queryKey: ['getUser'] })
            navigate('/')
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Registration failed")
        }
    })
}

export const useLoginHook = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: loginApi,
        onSuccess: (data) => {
            toast.success(data.message || "Login successful")
            queryClient.invalidateQueries({ queryKey: ['getUser'] })
            queryClient.invalidateQueries({ queryKey: ['getCartItem'] })
            navigate('/')
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Login failed")
        }
    })
}

export const useLogoutHook = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: logoutApi,
        onSuccess: (data) => {
            toast.success(data.message || "Logged out successfully")
            queryClient.setQueryData(['getUser'], null)
            queryClient.setQueryData(['getCartItem'], null)
            queryClient.invalidateQueries({ queryKey: ['getUser'] })
            navigate('/login')
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Logout failed")
        }
    })
}

export const useForgotPasswordHook = () => {
    return useMutation({
        mutationFn: forgotPasswordApi,
        onSuccess: (data) => {
            toast.success(data.message || "Password reset link sent to your email")
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to send reset link")
        }
    })
}

export const useResetPasswordHook = () => {
    const navigate = useNavigate()
    return useMutation({
        mutationFn: resetPasswordApi,
        onSuccess: (data) => {
            toast.success(data.message || "Password reset successful! Please login.")
            navigate('/login')
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to reset password")
        }
    })
}

export const useUpdateProfileHook = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            toast.success(data.message || "Profile updated successfully")
            queryClient.invalidateQueries({ queryKey: ['getUser'] })
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to update profile")
        }
    })
}

export const useGetProfileHook = () => {
    return useQuery({
        queryFn: getUser,
        queryKey: ['getUser'],
        retry: false,
    })
}

export const useGetUserCartItemHook = () => {
    return useQuery({
        queryFn: getCartItem,
        queryKey: ['getCartItem'],
        retry: false,
    })
}
