import axios from "axios"

export const registerApi = async(payload) => {
    const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/register`,
        payload,
        {
            headers: {'Content-Type': 'application/json'},
            withCredentials: true
        }
    )
    return res.data
}

export const loginApi = async(payload) => {
    const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`,
        payload,
        {
            headers: {'Content-Type': 'application/json'},
            withCredentials: true
        }
    )
    return res.data
}

export const logoutApi = async() => {
    const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/logout`,
        {},
        {
            headers: {'Content-Type': 'application/json'},
            withCredentials: true
        }
    )
    return res.data
}

export const forgotPasswordApi = async(payload) => {
    const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/forgot-password`,
        payload,
        {
            headers: {'Content-Type': 'application/json'},
            withCredentials: true
        }
    )
    return res.data
}

export const resetPasswordApi = async({ token, newPassword }) => {
    const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/reset-password/${token}`,
        { newPassword },
        {
            headers: {'Content-Type': 'application/json'},
            withCredentials: true
        }
    )
    return res.data
}

export const updateProfile = async(payload) => {
    const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/updateProfile`,
        payload,
        {
            headers: {'Content-Type': 'multipart/form-data'},
            withCredentials: true
        }
    )
    return res.data
}

export const getUser = async() => {
    const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/getUser`,
        {
            headers: {'Content-Type': 'application/json'},
            withCredentials: true
        }
    )
    return res.data
}

export const getCartItem = async() => {
    const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/getCartItem`,
        {
            headers: {'Content-Type': 'application/json'},
            withCredentials: true
        }
    )
    return res.data
}
