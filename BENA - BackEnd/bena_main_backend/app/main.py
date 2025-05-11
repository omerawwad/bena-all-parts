# backend models
from app.recommendation_model import recommend_places
from app.recommendation_model import users_has_interactions
from app.search_places_model import find_places_near_place_id
from app.search_places_model import smart_search
# FastAPI
from typing import Union
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

# initialize FastAPI
app = FastAPI()

# Recommendation API
@app.get("/recommend/{user_id}")
def read_item(user_id: str, method: Union[str, None] = None, length: Union[int, None] = None):
    warnings = ""
    # manage length margins and fix wrong inputs
    if length is None or length < 1 or length > 10: 
        length = 10
        warnings = warnings + "Length entered is not valid, 10 recommendations are generated." + "\n"
    # validate method and fix wrong inputs 
    if method is None: method = "hybrid"
    else :
        method = method.lower()
        if method not in ["content_based", "near_bookmarks", "hybrid", "random"]:
            method = "hybrid"
            warnings = warnings + "Method entered is not valid, hybrid recommendations are generated." + "\n"
    # check if user has any past bookmarks or interactions
    if not users_has_interactions(user_id): 
        method = "random"
        warnings = warnings + "No past bookmarks or interactions found for this user, random recommendations is generated." + "\n"
    # get recommendations
    recommendations = recommend_places(user_id=user_id, n=length, method=method)
    # send the response
    return {"recommendations": recommendations.to_dict(orient="records"), "method": method, "length": length, "warnings": warnings}

# suggested trips API



# search a place APIs
@app.get("/search/places/{query}")
def read_item(query: str):
    # get the search results
    result = smart_search(query)
    # send the response
    return {"search_results": result.to_dict(orient="records"), "length": len(result), "searched_query": query}

# places near to a place API
@app.get("/search/places/near/{place_id}")
def read_item(place_id: str, length: Union[int, None] = None, radius: Union[float, None] = None):
    # manage length margins and fix wrong inputs
    if length is None or length < 1 or length > 5: length = 5
    # manage radius margins and fix wrong inputs
    if radius is None or radius < 0 or radius > 5: radius = 1
    # get the nearby places
    result = find_places_near_place_id(place_id, n=length, radius=radius)
    # send the response
    return {"near_places": result.to_dict(orient="records"), "searched_place_id": place_id, "length": len(result), "radius": radius}


@app.get("/share/trip/{trip_id}", response_class=HTMLResponse)
async def redirect_with_meta(trip_id: str):
    # Dynamically generate Open Graph metadata for the preview
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <!-- Open Graph metadata for link preview -->
        <meta property="og:title" content="Check out this trip!" />
        <meta property="og:description" content="Join me on this amazing trip. Tap the link to open it in Bena!" />
        <meta name="twitter:card" content="summary_large_image" />
        
        <!-- Redirect -->
        <meta http-equiv="refresh" content="0;url=myapp://mytrips/{trip_id}" />
        <title>Redirecting...</title>
    </head>
    <body>
        <p>If you are not redirected automatically, <a href="myapp://mytrips/{trip_id}">click here</a>.</p>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)
