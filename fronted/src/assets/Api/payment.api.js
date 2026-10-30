import axios from "axios";

export const createPaymentApi = async (products) => {
    const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/payment/createPayment`,
        { products },
        {
            headers: { 'Content-Type': "application/json" },
            withCredentials: true,
            timeout: 15000
        }
    );
    return res.data;
};

export const createSuccessApi = async (sessionId) => {
    const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/payment/create-success`,
        { sessionId },
        {
            headers: { 'Content-Type': "application/json" },
            withCredentials: true,
            timeout: 15000
        }
    );
    return res.data;
};
