import { useForgotPasswordHook } from '@/hooks/user.hook'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'

const ForgotPassword = () => {
    const { register, handleSubmit } = useForm()
    const { mutate, isPending, isSuccess, data } = useForgotPasswordHook()

    const submitHandler = (data) => {
        mutate(data)
    }

    return (
        <div className='min-h-screen w-full flex items-center justify-center bg-zinc-50 p-4'>
            <div className='w-full max-w-md bg-zinc-100 rounded-lg p-8 shadow-lg border border-zinc-300'>
                {isSuccess ? (
                    <div className='text-center space-y-4'>
                        <div className='w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto'>
                            <CheckCircle2 className='w-8 h-8' />
                        </div>
                        <h2 className='text-xl font-bold text-gray-900'>Check Your Email</h2>
                        <p className='text-sm text-gray-600 leading-relaxed'>
                            If an account exists with that email address, we have sent a password reset link. Please check your inbox and spam folder.
                        </p>

                        {data?.resetUrl && (
                            <div className='bg-blue-50 border border-blue-200 rounded-md p-4 text-left space-y-2 mt-4'>
                                <p className='text-xs font-semibold text-blue-900'>Development Simulator Link:</p>
                                <p className='text-xs text-blue-700'>
                                    No live SMTP credentials configured in .env. You can reset directly using this link:
                                </p>
                                <a 
                                    href={data.resetUrl}
                                    className='inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2.5 rounded transition-colors shadow-sm'
                                >
                                    Proceed to Reset Password &rarr;
                                </a>
                            </div>
                        )}

                        <div className='pt-4'>
                            <Link 
                                to='/login' 
                                className='inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-black hover:underline'
                            >
                                <ArrowLeft className='w-4 h-4' />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(submitHandler)} className='flex flex-col gap-6'>
                        <div className='text-center space-y-1'>
                            <div className='w-12 h-12 bg-zinc-200 text-gray-800 rounded-full flex items-center justify-center mx-auto mb-2'>
                                <Mail className='w-6 h-6' />
                            </div>
                            <h1 className='font-bold text-2xl text-gray-900'>Forgot Password</h1>
                            <p className='text-sm text-gray-600'>
                                Enter your registered email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <label className='text-xs font-semibold text-gray-700 uppercase tracking-wide'>
                                Email Address
                            </label>
                            <input 
                                type="email" 
                                placeholder='name@example.com' 
                                required
                                className='border border-zinc-400 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900' 
                                {...register('email', { required: true })} 
                            />
                        </div>

                        <button 
                            type='submit' 
                            disabled={isPending}
                            className='w-full py-2.5 px-6 rounded-md bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center disabled:opacity-50'
                        >
                            {isPending ? <Spinner /> : "Send Reset Link"}
                        </button>

                        <div className='text-center'>
                            <Link 
                                to='/login' 
                                className='inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-zinc-900 hover:underline'
                            >
                                <ArrowLeft className='w-4 h-4' />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default ForgotPassword
