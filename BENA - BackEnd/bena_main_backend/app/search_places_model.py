# create auto categorization model and its auto generated Trips
from dotenv import load_dotenv

load_dotenv()

import re
import os
import numpy as np 
import pandas as pd 
from supabase import create_client, Client
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors
# search similarities libraries
from fuzzywuzzy import fuzz
from fuzzywuzzy import process

# initialize supabase connection
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# fetch places data from database into dataframe
table_name = "places"
response = supabase.table(table_name).select("*").execute()
data = response.data
places_df = pd.DataFrame(data)

# refetch bookmarks data from database into dataframe
def update_dataframes():
    # fetch places data from database into dataframe
    table_name = "places"
    response = supabase.table(table_name).select("*").execute()
    data = response.data
    places_df = pd.DataFrame(data)


def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of Earth in kilometers
    lat1, lat2, lon1, lon2 = map(np.radians, [lat1, lat2, lon1, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return R * c

def find_places_near_place_id(place_id, radius=5, n=5):
    update_dataframes()
    if places_df.empty:
        print("Places dataframe is empty.")
        return pd.DataFrame()
    # Get the coordinates of the given place_id
    place = places_df[places_df["places_id"] == place_id]
    
    if place.empty:
        print(f"No place found with place_id {place_id}.")
        return pd.DataFrame()  # Return an empty DataFrame if the place_id does not exist
    
    lat, lon = place.iloc[0]["latitude"], place.iloc[0]["longitude"]

    # Calculate the distance of all places from the given place_id
    places_df["distance_from_place"] = places_df.apply(
        lambda row: haversine_distance(lat, lon, row["latitude"], row["longitude"]),
        axis=1
    )

    # Filter places within the specified radius
    nearby_places = places_df[places_df["distance_from_place"] <= radius].copy()

    # Exclude the given place_id itself from the results
    nearby_places = nearby_places[nearby_places["places_id"] != place_id]

    # Sort by distance and return the top n places
    nearby_places = nearby_places.sort_values("distance_from_place").head(n)
    
    return nearby_places

def smart_search(query, n=10, min_score=50):
    if places_df.empty:
        print("Places dataframe is empty.")
        return pd.DataFrame()
    
    # Preprocessing: Combine 'name' and 'tags' columns for searching
    places_df["search_field"] = (
        places_df["name"].fillna("") + " " + 
        places_df["tags"].fillna("") +
        places_df["arabic_name"].fillna("") +
        places_df["address"].fillna("")
    )

    # Calculate similarity scores
    places_df["similarity_score"] = places_df["search_field"].apply(
        lambda text: fuzz.partial_ratio(query.lower(), text.lower())
    )

    # Filter results by minimum score
    results = places_df[places_df["similarity_score"] >= min_score]

    # Sort by similarity score and return top n results
    results = results.sort_values(by="similarity_score", ascending=False).head(n)
    
    # Drop intermediate columns before returning
    return results.drop(columns=["search_field", "similarity_score"])