# Create Trips suggestion, recommendations model and auto created Trips

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

# fetch trips data from database into dataframe
table_name = "trips"
response = supabase.table(table_name).select("*").execute()
data = response.data
trips_df = pd.DataFrame(data)

# fetch trips steps data from database into dataframe
table_name = "tripstep"
response = supabase.table(table_name).select("*").execute()
data = response.data
trip_step_df = pd.DataFrame(data)

# merge interactions and bookmarks tables
interactions_df = trips_df.merge(trip_step_df, on=["trip_id", "trip_id"], how="outer")



