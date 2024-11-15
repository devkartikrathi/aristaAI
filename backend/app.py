from flask import Flask, request, jsonify
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
from bson import json_util
import json
import google.generativeai as genai
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")

MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client['travel_assistant']
trips_collection = db['trips']
users_collection = db['users']

genai.configure(api_key=os.getenv("API_KEY"))
model = genai.GenerativeModel("gemini-1.5-pro")

@app.route('/')
def home():
    return jsonify({"data": "Welcome to the Travel Assistant API"})

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = generate_password_hash(password, method='sha256')
    users_collection.insert_one({"username": username, "password": hashed_password})

    return jsonify({"message": "User registered successfully"})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = users_collection.find_one({"username": username})

    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid username or password"}), 401

    token = jwt.encode({'username': username, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({"token": token})

@app.route('/trips', methods=['GET', 'POST'])
def handle_trips():
    if request.method == 'POST':
        data = request.json
        destination = data.get('destination')
        purpose = data.get('purpose')
        duration = data.get('duration')
        weather = data.get('weather')
        trip_date = data.get('trip_date')

        if not destination or not purpose or not duration or not weather or not trip_date:
            return jsonify({"error": "All fields are required"}), 400

        trip = {
            "destination": destination,
            "purpose": purpose,
            "duration": duration,
            "weather": weather,
            "trip_date": trip_date,
            "packing_list": [],
            "checked_items": []
        }

        trip_id = trips_collection.insert_one(trip).inserted_id
        trip = trips_collection.find_one({"_id": trip_id})

        return json.loads(json_util.dumps(trip))

    else:
        trips = list(trips_collection.find().sort("trip_date", 1))
        return json.loads(json_util.dumps(trips))

@app.route('/generate_packing_list', methods=['POST'])
def generate_packing_list():
    data = request.json
    trip_id = ObjectId(data.get('trip_id'))
    destination = data.get('destination')
    purpose = data.get('purpose')
    duration = data.get('duration')
    weather = data.get('weather')

    if not destination or not purpose or not duration or not weather:
        return jsonify({"error": "All fields are required"}), 400

    prompt = (f"As a travel assistant, help me pack for a trip to {destination} for {purpose}. "
              f"The trip lasts {duration} and the weather is {weather}. What should I pack?")

    try:
        response = model.generate_content(prompt)
        packing_list = response.text.split('\n')

        packing_items = [{"name": item, "checked": False, "compartment": "Main Compartment"} for item in packing_list]

        trips_collection.update_one(
            {"_id": trip_id},
            {"$set": {"packing_list": packing_items}}
        )

        return jsonify({"message": "Packing list generated and added to the trip", "packing_list": packing_items})

    except Exception as e:
        return jsonify({"error": "Failed to generate packing list", "details": str(e)}), 500

@app.route('/edit_packing_list', methods=['POST'])
def edit_packing_list():
    data = request.json
    trip_id = ObjectId(data.get('trip_id'))
    updated_items = data.get('items')

    if not trip_id or not updated_items:
        return jsonify({"error": "Trip ID and updated items are required"}), 400

    trip = trips_collection.find_one({"_id": trip_id})

    if trip:
        trips_collection.update_one(
            {"_id": trip_id},
            {"$set": {"packing_list": updated_items}}
        )
        return jsonify({"message": "Packing list updated", "updated_items": updated_items})
    else:
        return jsonify({"error": "Trip not found"}), 404

@app.route('/get_suggestions', methods=['POST'])
def get_suggestions():
    data = request.json
    destination = data.get('destination')

    if not destination:
        return jsonify({"error": "Destination is required"}), 400

    prompt = (f"Provide travel tips for {destination}, including must-see places and time management advice.")

    try:
        response = model.generate_content(prompt)
        suggestions = response.text
        return jsonify({"suggestions": suggestions})

    except Exception as e:
        return jsonify({"error": "Failed to generate suggestions", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)