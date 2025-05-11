import { useQuery } from "@tanstack/react-query";
import { Place } from "@/db/schema";
import { supabase } from "@/lib/supabase";

interface SearchPlaceResponse {
  places: Place[];
}

export const useSearchPlace = () => {
  // Function to search places using Supabase Edge Function
  const getSearchedPlaces = async (searchText: string) => {
    if (!searchText) {
      return [];
    }

    const { data: response, error } = await supabase.functions.invoke("searchPlaces", {
      body: { query: searchText },
    });

    if (error) {
      throw new Error(error.message || "Failed to fetch places");
    }

    return response.result;
  };

  // Function to get nearby places using Supabase Edge Function
  const getNearbyPlaces = async (placeID: string) => {
    if (!placeID) {
      return [];
    }

    const { data: response, error } = await supabase.functions.invoke("fetchNearby", {
      body: { id: placeID },
    });

    if (error) {
      throw new Error(error.message || "Failed to fetch nearby places");
    }

    return response.nearby;
  };

  // Default query for fetching places (modify if needed)
  const { data, isLoading, isError, error, refetch } = useQuery<SearchPlaceResponse, Error>({
    queryKey: ["searchedPlaces"],
    queryFn: async () => {
      const { data: response, error } = await supabase.functions.invoke("searchPlaces", {
        body: { query: "pyramids" }, // Default query
      });

      if (error) {
        throw new Error(error.message || "Failed to fetch places");
      }

      return response.result;
    },
  });

  return {
    getPlaces: getSearchedPlaces,
    getNearbyPlaces: getNearbyPlaces,
    places: data?.places ?? [],
    loading: isLoading,
    isError,
    error,
    refetch,
  };
};
