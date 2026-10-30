import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { subscribeNewsletterApi } from "@/assets/Api/newsletter.api";

export const useSubscribeNewsletterHook = (options = {}) => {
    return useMutation({
        mutationFn: subscribeNewsletterApi,
        onSuccess: (data) => {
            toast.success(data.message || "Thank you for subscribing to our newsletter!");
            if (options.onSuccess) {
                options.onSuccess(data);
            }
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to subscribe. Please try again.");
            if (options.onError) {
                options.onError(err);
            }
        }
    });
};
