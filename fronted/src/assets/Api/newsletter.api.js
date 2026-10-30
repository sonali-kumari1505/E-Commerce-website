import axios from "axios";

export const subscribeNewsletterApi = async ({ email }) => {
    const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/newsletter/subscribe`,
        { email },
        {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        }
    );
    return res.data;
};
