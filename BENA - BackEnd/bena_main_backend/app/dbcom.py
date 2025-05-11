from dotenv import load_dotenv

load_dotenv()

import re
import os
import numpy as np 
import pandas as pd 
from supabase import create_client, Client
from datetime import datetime, timezone

# initialize supabase connection
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def get_places():
    # get all places from supabase
    table_name = "places"
    response = supabase.table(table_name).select("*").execute()
    return response

def get_place(place_id):
    # get all places from supabase
    table_name = "places"
    response = supabase.table(table_name).select("*").eq("places_id", place_id).execute()
    return response.data

def get_places_dataframe():
    # get all places from supabase
    table_name = "places"
    response = supabase.table(table_name).select("*").execute()
    return pd.DataFrame(response.data)

def get_users_dataframe():
    # get all places from supabase
    table_name = "users"
    response = supabase.table(table_name).select("*").execute()
    return pd.DataFrame(response.data)

def get_trips_dataframe():
    # get all places from supabase
    table_name = "trips"
    response = supabase.table(table_name).select("*").execute()
    return pd.DataFrame(response.data)

def create_trip(user_id: str, title: str, start_date, end_date, steps, description="no description", status="planned"):
    # user_df = get_users_dataframe()
    # trips_df = get_trips_dataframe()
    # validate user_id
    # if user_id not in user_df["user_id"]:
    #     print("User with id ${user_id} not found")
    #     return None
    # print(user_df)
    # validate title
    if title is None or title == "":
        print("No title provided")
        title = "Trip to " + steps[0]["name"]
    
    # create a new trip in the database
    new_trip = {
        "user_id": user_id,
        "title": title,
        "description": description,
        # "start_date": start_date,
        # "end_date": end_date,
        "status": status,
    }

    # insert the new trip to trips table
    created_trip = supabase.table("trips").insert(new_trip).execute()
    # get the created trip id
    trip_id = created_trip.data[0]["trip_id"]

    # add steps to the trip
    for step in steps:
        new_step = {
            "trip_id": trip_id,
            "place_id": step["place_id"],
            "step_num": steps.index(step),
        }
        supabase.table("tripstep").insert(new_step).execute()

    print("Trip created successfully")
    return new_trip

create_trip("da170574-dbb5-43d6-b321-f57d2bc5ae91", "Trip to the beach", datetime.now(), datetime.now(), [{"place_id": "22bc5e88-6f6c-4784-bb82-6d3012cb6a6e"}])


# Adding basic database client

# Adding CRUD functions

# Adding specific validations methods to make sure communication with db is safe and secured
# Avoid duplicate or redundant places or data
# Avoid invalid or incomplete data
# Avoid deletion of Data

# make backup snapshots of data