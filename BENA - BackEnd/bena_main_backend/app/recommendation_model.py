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

# initialize supabase connection
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)
def update_dataframes():
    # fetch places data from database into dataframe
    table_name = "places"
    response = supabase.table(table_name).select("*").execute()
    data = response.data
    places_df = pd.DataFrame(data)
    # fetch bookmarks data from database into dataframe
    table_name = "bookmarks"
    response = supabase.table(table_name).select("*").execute()
    data = response.data
    bookmarks_df = pd.DataFrame(data)
    # fetch interactions data from database into dataframe
    table_name = "interactions"
    response = supabase.table(table_name).select("*").execute()
    data = response.data
    interactions_df = pd.DataFrame(data)
    # merge interactions and bookmarks tables
    interactions_df = interactions_df.merge(bookmarks_df, on=["user_id", "place_id"], how="outer")  
    # -------------------
    # Content-Based Filtering
    # -------------------

    # Create a TF-IDF vectorizer for tags
    tfidf = TfidfVectorizer(stop_words="english")
    places_df["tags"] = places_df["tags"].fillna("")
    tag_matrix = tfidf.fit_transform(places_df["tags"])

    # Cosine similarity for places based on tags
    cosine_sim = cosine_similarity(tag_matrix, tag_matrix)

    return places_df, bookmarks_df, interactions_df, cosine_sim




def recommend_places_content_based(user_id, places_df, cosine_sim, bookmarks_df, n=5):
    # Get the user's bookmarked places
    bookmarked_places = bookmarks_df[bookmarks_df["user_id"] == user_id]["place_id"].tolist()
    
    if not bookmarked_places:
        print(f"No bookmarks found for user {user_id}.")
        return pd.DataFrame()  # Return an empty DataFrame if no bookmarks exist

    # Calculate content-based scores
    content_scores = np.zeros(len(places_df))
    
    for place_id in bookmarked_places:
        place_idx = places_df[places_df["places_id"] == place_id].index[0]
        content_scores += cosine_sim[place_idx]
    
    # Assign scores to places
    places_df["score"] = content_scores

    # Exclude places with tags "Not available yet" or assign them a low score
    average_score = places_df["score"].mean()
    low_score = 0.1
    places_df.loc[places_df["tags"].str.contains("Not available yet", case=False, na=False), "score"] = low_score
    
    
    # Sort by content-based scores
    recommendations = places_df.sort_values(by="score", ascending=False)
    
    # Exclude places the user has already bookmarked
    recommendations = recommendations[~recommendations["places_id"].isin(bookmarked_places)]
    
    # Return top `n` recommendations
    return recommendations.head(n)

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of Earth in kilometers
    lat1, lat2, lon1, lon2 = map(np.radians, [lat1, lat2, lon1, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return R * c

def recommend_places_near_bookmarks(user_id, places_df, bookmarks_df, n=5):
    # Get the user's bookmarked places
    bookmarked_places = bookmarks_df[bookmarks_df["user_id"] == user_id]["place_id"].tolist()
    
    if not bookmarked_places:
        print(f"No bookmarks found for user {user_id}.")
        return pd.DataFrame()  # Return an empty DataFrame if no bookmarks exist

    # Get coordinates of bookmarked places
    bookmarked_places_coords = places_df[places_df["places_id"].isin(bookmarked_places)][["latitude", "longitude"]].values
    
    # If no coordinates are found, return an empty DataFrame
    if bookmarked_places_coords.size == 0:
        print(f"No coordinates found for bookmarked places of user {user_id}.")
        return pd.DataFrame()

    # Calculate minimum distance to any bookmarked place
    def min_distance_to_bookmarked(lat, lon):
        distances = [haversine_distance(lat, lon, b_lat, b_lon) for b_lat, b_lon in bookmarked_places_coords]
        return min(distances) if distances else float('inf')

    # Compute distances for all places
    places_df["distance_to_bookmarked"] = places_df.apply(
        lambda row: min_distance_to_bookmarked(row["latitude"], row["longitude"]),
        axis=1
    )

    # Exclude already bookmarked places
    recommendations = places_df[~places_df["places_id"].isin(bookmarked_places)]
    
    # Sort by distance
    recommendations = recommendations.sort_values(by="distance_to_bookmarked", ascending=True)
    
    # Return top `n` recommendations
    return recommendations.head(n)

def recommend_places_hybrid(user_id,places_df, bookmarks_df, cosine_sim, n=5, weight_content=0.6, weight_proximity=0.4):
    # Get the user's bookmarked places
    bookmarked_places = bookmarks_df[bookmarks_df["user_id"] == user_id]["place_id"].tolist()
    
    if not bookmarked_places:
        print(f"No bookmarks found for user {user_id}.")
        return pd.DataFrame()  # Return an empty DataFrame if no bookmarks exist

    # ------- Content-Based Filtering ------------
    content_scores = np.zeros(len(places_df))
    for place_id in bookmarked_places:
        place_idx = places_df[places_df["places_id"] == place_id].index[0]
        content_scores += cosine_sim[place_idx]
    places_df["content_score"] = content_scores

    # Exclude places with tags "Not available yet" or assign them a low score
    average_score = places_df["content_score"].mean()
    low_score = 0.1
    places_df.loc[places_df["tags"].str.contains("Not available yet", case=False, na=False), "content_score"] = low_score

    # ------- Proximity to Bookmarked Places ------------
    # Get coordinates of bookmarked places
    bookmarked_places_coords = places_df[places_df["places_id"].isin(bookmarked_places)][["latitude", "longitude"]].values

    # If no coordinates are found, return an empty DataFrame
    if bookmarked_places_coords.size == 0:
        print(f"No coordinates found for bookmarked places of user {user_id}.")
        return pd.DataFrame()

    # Calculate minimum distance to any bookmarked place
    def min_distance_to_bookmarked(lat, lon):
        distances = [haversine_distance(lat, lon, b_lat, b_lon) for b_lat, b_lon in bookmarked_places_coords]
        return min(distances) if distances else float('inf')

    # Compute distances for all places
    places_df["distance_to_bookmarked"] = places_df.apply(
        lambda row: min_distance_to_bookmarked(row["latitude"], row["longitude"]),
        axis=1
    )
    
    # Normalize distance scores (smaller is better)
    max_distance = places_df["distance_to_bookmarked"].max()
    places_df["proximity_score"] = 1 - (places_df["distance_to_bookmarked"] / max_distance)  # Scale to [0, 1]

    # -------- Hybrid Scoring ------------
    # Combine content-based and proximity scores
    places_df["hybrid_score"] = (
        weight_content * places_df["content_score"] +
        weight_proximity * places_df["proximity_score"]
    )

    # Exclude already bookmarked places
    recommendations = places_df[~places_df["places_id"].isin(bookmarked_places)]
    
    # Sort by hybrid score
    recommendations = recommendations.sort_values(by="hybrid_score", ascending=False)

    # Return top `n` recommendations
    return recommendations.head(n)

def users_has_interactions(user_id):
    interactions_df = update_dataframes()[2]
    if user_id not in interactions_df["user_id"].values:
        return False
    return True

def recommend_places(user_id, n=5, method="hybrid"):
    places_df, bookmarks_df, interactions_df, cosine_sim = update_dataframes()
    if method == "content_based":
        return recommend_places_content_based(user_id=user_id, n=n, places_df=places_df, bookmarks_df=bookmarks_df, cosine_sim=cosine_sim)
    elif method == "near_bookmarks":
        return recommend_places_near_bookmarks(user_id=user_id, n=n, places_df=places_df, bookmarks_df=bookmarks_df)
    elif method == "random":
        return places_df.sample(n=n)
    else:
        return recommend_places_hybrid(user_id=user_id, n=n, places_df=places_df, bookmarks_df=bookmarks_df, cosine_sim=cosine_sim)

