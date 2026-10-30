import { useResetPasswordHook } from '@/hooks/user.hook'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'
import { KeyRound } from 'lucide-react'
import { useState } from 'react'

const ResetPassword = () => {
    const { token } = useParams()
    const { register, handleSubmit } = useForm()
    const { mutate, isPending } = useResetPasswordHook()
    const [validationError, setValidationError] = useState("")

    const submitHandler = (data) => {
        setValidationError("")
        if (data.newPassword !== data.confirmPassword) {
            setValidationError("Passwords do not match")
            return
        }
        if (data.newPassword.length < 6) {
            setValidationError("Password must be at least 6 characters")
            return
        }
        mutate({ token, newPassword: data.newPassword })
    }

    return (
        <div className='min-h-screen w-full flex items-center justify-center bg-zinc-50 p-4'>
            <div className='w-full max-w-md bg-zinc-100 rounded-lg p-8 shadow-lg border border-zinc-300'>
                <form onSubmit={handleSubmit(submitHandler)} className='flex flex-col gap-6'>
                    <div className='text-center space-y-1'>
                        <div className='w-12 h-12 bg-zinc-200 text-gray-800 rounded-full flex items-center justify-center mx-auto mb-2'>
                            <KeyRound className='w-6 h-6' />
                        </div>
                        <h1 className='font-bold text-2xl text-gray-900'>Set New Password</h1>
                        <p className='text-sm text-gray-600'>
                            Enter your new password below.
                        </p>
                    </div>

                    {validationError && (
                        <div className='bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-md'>
                            {validationError}
                        </div>
                    )}

                    <div className='flex flex-col gap-3'>
                        <div className='flex flex-col gap-1'>
                            <label className='text-xs font-semibold text-gray-700 uppercase tracking-wide'>
                                New Password
                            </label>
                            <input 
                                type="password" 
                                placeholder='••••••••' 
                                required
                                minLength={6}
                                className='border border-zinc-400 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900' 
                                {...register('newPassword', { required: true })} 
                            />
                        </div>

                        <div className='flex flex-col gap-1'>
                            <label className='text-xs font-semibold text-gray-700 uppercase tracking-wide'>
                                Confirm New Password
                            </label>
                            <input 
                                type="password" 
                                placeholder='••••••••' 
                                required
                                minLength={6}
                                className='border border-zinc-400 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900' 
                                {...register('confirmPassword', { required: true })} 
                            />
                        </div>
                    </div>

                    <button 
                        type='submit' 
                        disabled={isPending}
                        className='w-full py-2.5 px-6 rounded-md bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center disabled:opacity-50'
                    >
                        {isPending ? <Spinner /> : "Reset Password"}
                    </button>

                    <div className='text-center'>
                        <Link 
                            to='/login' 
                            className='text-sm text-gray-600 hover:text-zinc-900 hover:underline'
                        >
                            Cancel and Return to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword
