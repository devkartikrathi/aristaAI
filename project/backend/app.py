from flask import Flask, request, jsonify
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
from bson import json_util
import json
import google.generativeai as genai
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)


# MongoDB setup
uri = "mongodb+srv://devkartik:<db_password>@test-cluster.sv1e5.mongodb.net/?retryWrites=true&w=majority&appName=test-cluster"
mongo_client = MongoClient(MONGO_URI)
db = mongo_client['travel_assistant']
trips_collection = db['trips']

# Gemini AI setup (Ensure correct API key and remove unused OpenAI imports)
genai.configure(api_key=os.getenv("API_KEY"))
model = genai.GenerativeModel("gemini-1.5-pro")

@app.route('/')
def home():
    return jsonify({"data": "Welcome to the Travel Assistant API"})

@app.route('/add_trip', methods=['POST'])
def add_trip():
    data = request.json
    destination = data.get('destination')
    purpose = data.get('purpose')
    duration = data.get('duration')
    weather = data.get('weather')

    # Input validation: Ensure all required fields are present
    if not destination or not purpose or not duration or not weather:
        return jsonify({"error": "All fields are required"}), 400

    trip = {
        "destination": destination,
        "purpose": purpose,
        "duration": duration,
        "weather": weather,
        "packing_list": []  # Empty packing list initially
    }

    trip_id = trips_collection.insert_one(trip).inserted_id
    trip = trips_collection.find_one({"_id": trip_id})

    # Return the trip details, making ObjectId serializable
    return json.loads(json_util.dumps(trip))

@app.route('/generate_packing_list', methods=['POST'])
def generate_packing_list():
    data = request.json
    destination = data.get('destination')
    purpose = data.get('purpose')
    duration = data.get('duration')
    weather = data.get('weather')

    # Validate input fields
    if not destination or not purpose or not duration or not weather:
        return jsonify({"error": "All fields are required"}), 400

    # Improved prompt for better AI results
    prompt = (f"I am traveling to {destination} for {purpose}. "
              f"The trip is {duration} long, and the weather is {weather}. Can you suggest a packing list for me?")

    try:
        response = model.generate_content("You are a helpful travel assistant. " + prompt)
        packing_list = response.text
        return jsonify({"packing_list": packing_list})

    except Exception as e:
        # Improved error handling
        return jsonify({"error": "Failed to generate packing list", "details": str(e)}), 500

@app.route('/assign_luggage', methods=['POST'])
def assign_luggage():
    data = request.json
    trip_id = ObjectId(data.get('trip_id'))  # Validate this field exists
    items = data.get('items')  # Expecting a list of items

    # Validate the presence of trip_id and items
    if not trip_id or not items:
        return jsonify({"error": "Trip ID and items are required"}), 400

    trip = trips_collection.find_one({"_id": trip_id})

    if trip:
        # Update packing list with luggage assignment
        trips_collection.update_one(
            {"_id": trip_id},
            {"$set": {"packing_list": items}}
        )
        return jsonify({"message": "Items assigned to luggage", "items": items})
    else:
        # Return 404 if trip is not found
        return jsonify({"error": "Trip not found"}), 404

@app.route('/get_suggestions', methods=['POST'])
def get_suggestions():
    data = request.json
    destination = data.get('destination')

    # Input validation for the destination
    if not destination:
        return jsonify({"error": "Destination is required"}), 400

    prompt = (f"Can you suggest some tips for traveling to {destination}, "
                f"such as places to visit and time management tips?")

    try:
        response = model.generate_content("You are a helpful travel assistant. " + prompt)
        suggestions = response.text
        return jsonify({"suggestions": suggestions})

    except Exception as e:
        # Improved error message for easier debugging
        return jsonify({"error": "Failed to generate suggestions", "details": str(e)}), 500

if __name__ == '__main__':
    # For production, remove debug=True and run with a production server like gunicorn
    app.run(debug=True)
