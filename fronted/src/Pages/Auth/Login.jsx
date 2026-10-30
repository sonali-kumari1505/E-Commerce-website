import { Spinner } from '@/components/ui/spinner'
import { useLoginHook } from '@/hooks/user.hook'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

const Login = () => {
    const { register, handleSubmit } = useForm()
    const { mutate, isPending } = useLoginHook()

    const loginHandler = (data) => {
        mutate(data)
    }

    return (
        <div className='h-screen w-full flex items-center justify-center bg-zinc-50'>
            <form onSubmit={handleSubmit(loginHandler)} className='flex flex-col items-center justify-center gap-7 shadow-lg rounded-md p-9 bg-zinc-100 hover:shadow-xl transition-all duration-300 border border-zinc-300 w-full max-w-sm'>
                <h1 className='font-semibold text-xl'>Login Here</h1>

                <div className='flex flex-col w-full gap-3'>
                    <input 
                        type="email" 
                        placeholder='Email' 
                        required
                        className='border border-zinc-400 rounded-md px-3 py-2 text-sm bg-white' 
                        {...register('email', { required: true })} 
                    />
                    <input 
                        type="password" 
                        placeholder='Password' 
                        required
                        className='border border-zinc-400 rounded-md px-3 py-2 text-sm bg-white' 
                        {...register('password', { required: true })} 
                    />
                    <div className='flex justify-end'>
                        <Link 
                            to='/forgot-password' 
                            className='text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium'
                        >
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <button 
                    type='submit' 
                    disabled={isPending}
                    className='w-full py-2.5 px-6 rounded-md bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center disabled:opacity-50'
                >
                    {isPending ? <Spinner /> : "Login"}
                </button>

                <p className='text-sm text-gray-600'>
                    Don't have an account? <Link to={'/register'} className='text-blue-600 font-medium hover:underline'>Register</Link>
                </p>
            </form>
        </div>
    )
}

export default Login
