import { useGetProfileHook } from "@/hooks/user.hook"
import { useUserStore } from "@/store/userStore"
import { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { Spinner } from "@/components/ui/spinner"

export const ProtectedRoute = ({ children }) => {
    const setUser = useUserStore((state) => state.setUser)
    const { data, isLoading } = useGetProfileHook()

    useEffect(() => {
        if (data) {
            setUser(data)
        }
    }, [data, setUser])

    if (isLoading) {
        return (
            <div className='min-h-screen w-full flex items-center justify-center'>
                <Spinner />
            </div>
        )
    }

    if (!data) {
        return <Navigate to={'/login'} replace />
    }

    return children
}

export const AdminProtectedRoute = ({ children }) => {
    const setUser = useUserStore((state) => state.setUser)
    const { data, isLoading } = useGetProfileHook()

    useEffect(() => {
        if (data) {
            setUser(data)
        }
    }, [data, setUser])

    if (isLoading) {
        return (
            <div className='min-h-screen w-full flex items-center justify-center'>
                <Spinner />
            </div>
        )
    }

    if (!data) {
        return <Navigate to={'/login'} replace />
    }

    if (!data.owner) {
        return <Navigate to={'/'} replace />
    }

    return children
}
