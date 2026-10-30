import { useRegisterHook } from '@/hooks/user.hook'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'

const Register = () => {
    const { register, handleSubmit } = useForm()
    const { mutate, isPending } = useRegisterHook()

    const registerHandler = (data) => {
        mutate(data)
    }

    return (
        <div className='h-screen w-full flex items-center justify-center bg-zinc-50'>
            <form onSubmit={handleSubmit(registerHandler)} className='flex flex-col items-center justify-center gap-7 shadow-lg rounded-md p-9 bg-zinc-100 hover:shadow-xl transition-all duration-300 border border-zinc-300 w-full max-w-sm'>
                <h1 className='font-semibold text-xl'>Register</h1>

                <div className='flex flex-col w-full gap-3'>
                    <input 
                        type="text" 
                        placeholder='Enter Your Name' 
                        required
                        className='border border-zinc-400 rounded-md px-3 py-2 text-sm bg-white' 
                        {...register('name', { required: true })} 
                    />
                    <input 
                        type="email" 
                        placeholder='Enter Your Email' 
                        required
                        className='border border-zinc-400 rounded-md px-3 py-2 text-sm bg-white' 
                        {...register('email', { required: true })} 
                    />
                    <input 
                        type="password" 
                        placeholder='Enter Your Password' 
                        required
                        className='border border-zinc-400 rounded-md px-3 py-2 text-sm bg-white' 
                        {...register('password', { required: true })} 
                    />
                </div>

                <button 
                    type='submit' 
                    disabled={isPending}
                    className='w-full py-2.5 px-6 rounded-md bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center disabled:opacity-50'
                >
                    {isPending ? <Spinner /> : "Register"}
                </button>

                <p className='text-sm text-gray-600'>
                    Already have an account? <Link to={'/login'} className='text-blue-600 font-medium hover:underline'>Login</Link>
                </p>
            </form>
        </div>
    )
}

export default Register
