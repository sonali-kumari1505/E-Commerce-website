import axios from "axios";

export const getAllReviewsApi = async () => {
    const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/review/all`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
    });
    return res.data;
};

export const createReviewApi = async (payload) => {
    const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/review/create`, payload, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
    });
    return res.data;
};

export const markHelpfulApi = async (reviewId) => {
    const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/review/helpful/${reviewId}`, {}, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
    });
    return res.data;
};
