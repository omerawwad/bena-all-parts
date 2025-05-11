import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Place {
  places_id: string;
  name: string;
  description: string;
  address: string;
  category: string;
  image: string;
  city: string;
}

const fetchPlaces = async (): Promise<Place[]> => {
  const { data: places, error } = await supabase
    .from('places')
    .select('places_id, name, description, address, category, image, city')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return places || [];
};

export const usePlaces = () => {
  const {
    data: places = [],
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['places'],
    queryFn: fetchPlaces,
  });

  return {
    places,
    loading,
    error: isError ? (error as Error).message : null,
    refetch,
  };
};
