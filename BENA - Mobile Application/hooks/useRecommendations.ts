import { useQuery } from "@tanstack/react-query";
import { Place } from "@/db/schema";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { supabase } from "@/lib/supabase";

interface RecommendationResponse {
  recommendations: Place[];
}

export const useRecommendations = () => {
  const user = useAuthCheck();

  const {
    data,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<RecommendationResponse, Error>({
    queryKey: ["recommendations", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Call the Supabase Edge Function
      const { data: response, error: recommendationsError } = await supabase.functions.invoke(
        "fetchRecommendations",
        {
          body: { id: user.id },
        }
      );

      if (recommendationsError) {
        throw new Error(recommendationsError.message || "Failed to fetch recommendations");
      }

      // console.log("Recommendations", response);
      return response;
    },
  });

  return {
    recommendations: data?.recommendations.recommendations ?? [],
    loading,
    error: isError ? error.message : null,
    refetch,
  };
};
