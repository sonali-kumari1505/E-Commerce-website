import { createReviewApi, getAllReviewsApi, markHelpfulApi } from "@/assets/Api/review.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetReviewsHook = () => {
    return useQuery({
        queryKey: ['reviews'],
        queryFn: getAllReviewsApi,
        staleTime: 1000 * 60 * 5
    });
};

export const useCreateReviewHook = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createReviewApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            toast.success(data.message || "Thank you! Your review has been submitted.");
            if (options.onSuccess) {
                options.onSuccess(data);
            }
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to submit review. Please try again.");
            if (options.onError) {
                options.onError(err);
            }
        }
    });
};

export const useHelpfulReviewHook = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markHelpfulApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            toast.success("Thank you for your feedback!");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to register feedback.");
        }
    });
};
