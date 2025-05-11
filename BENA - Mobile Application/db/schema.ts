interface Place {
  places_id: string;
  name: string;
  description: string;
  address: string;
  location: string;
  category: string;
  rating: number;
  created_at: Date;
  image: string;
  latitude: number;
  longitude: number;
  external_link: string | null;
  arabic_name: string | null;
  city: string;
  tags: string;
  maps_id: string;
}

interface Users {
  user_id: string;
  updated_at: Date;
  username: string;
  avatar_url: string;
}

interface Bookmarks {
  bookmark_id: string;
  place_id: string;
  user_id: string;
  created_at: Date;
}

interface Trips {
  trip_id: string; // PK
  user_id: string; // FK to profiles.id
  title: string;
  description: string;
  start_date: Date;
  end_date: Date;
  created_at: Date;
  updated_at: Date;
  status: 'planned' | 'in_progress' | 'completed';
  steps: TripStep[]; // Array of steps (places to visit)
}

interface TripStep {
  step_id: string;  // PK
  trip_id: string;  // FK to trips.trip_id
  place_id: string; // FK to places.place_id
  step_num: number; // To maintain the sequence of steps
  start_time: Date;
  end_time: Date;
  status: 'pending' | 'in_progress' | 'visited' | 'skipped';
}

interface TripsGuests {
  id: string;
  trip_id: string;
  guest_id: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface PlaceUserInteractions {
  id: string;
  place_id: string;
  user_id: string;
  overall: 'empty' | 'above' | 'below';
  expense: 'empty' | 'cheap' | 'high';
  comfort: 'empty' | 'comfortable' | 'exhausting';
}

export { Place, Users, Bookmarks, Trips, TripStep, PlaceUserInteractions };
