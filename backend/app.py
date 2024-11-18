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
from functools import wraps

load_dotenv()

app = Flask(__name__)
CORS(app)

SECRET_KEY = os.getenv('SECRET_KEY')

MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client['travel_assistant']
trips_collection = db['trips']
users_collection = db['users']

api_key = os.environ["GEMINI_API_KEY"]
model = genai.GenerativeModel("gemini-1.5-pro")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = users_collection.find_one({"username": data['username']})
            if not current_user:
                return jsonify({'error': 'Invalid token'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

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

    hashed_password = generate_password_hash(password, method='scrypt')
    users_collection.insert_one({
        "username": username,
        "password": hashed_password,
        "created_at": datetime.datetime.utcnow()
    })

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

    token = jwt.encode(
        {
            'username': username,
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24),
        },
        SECRET_KEY,
        algorithm="HS256"
    )

    return jsonify({"token": token})

@app.route('/trips', methods=['GET', 'POST'])
@token_required
def handle_trips(current_user):
    if request.method == 'POST':
        data = request.json
        destination = data.get('destination')
        purpose = data.get('purpose')
        duration = data.get('duration')
        weather = data.get('weather')
        trip_date = data.get('trip_date')

        if not all([destination, purpose, duration, weather, trip_date]):
            return jsonify({"error": "All fields are required"}), 400

        trip = {
            "user_id": current_user['_id'],
            "username": current_user['username'],
            "destination": destination,
            "purpose": purpose,
            "duration": duration,
            "weather": weather,
            "trip_date": trip_date,
            "packing_list": [],
            "created_at": datetime.datetime.utcnow()
        }

        trip_id = trips_collection.insert_one(trip).inserted_id
        trip = trips_collection.find_one({"_id": trip_id})

        return json.loads(json_util.dumps(trip))

    else:
        # Get only the current user's trips
        trips = list(trips_collection.find(
            {"user_id": current_user['_id']}
        ).sort("trip_date", 1))
        return json.loads(json_util.dumps(trips))

@app.route('/generate_packing_list', methods=['POST'])
@token_required
def generate_packing_list(current_user):
    data = request.json
    trip_id = ObjectId(data.get('trip_id'))
    destination = data.get('destination')
    purpose = data.get('purpose')
    duration = data.get('duration')
    weather = data.get('weather')

    if not all([trip_id, destination, purpose, duration, weather]):
        return jsonify({"error": "All fields are required"}), 400

    # Verify trip belongs to current user
    trip = trips_collection.find_one({"_id": trip_id, "user_id": current_user['_id']})
    if not trip:
        return jsonify({"error": "Trip not found or unauthorized"}), 404

    prompt = (
        f"Generate a packing list JSON for a {duration} trip to {destination} for {purpose} with {weather} weather. "
        f"The JSON should be a valid JSON array of objects. Each object should have: "
        f"'name' (string), 'checked' (boolean, initially false), 'compartment' (string), and 'weight' (number in kg). "
        f"Group items by compartments like 'Clothing', 'Electronics', 'Toiletries', 'Documents', etc. "
        f"Ensure the output is directly parsable as a JSON array with no extra text or formatting."
    )

    try:
        response = model.generate_content(prompt)
        packing_list = json.loads(response.text)

        # Calculate total weight
        total_weight = sum(item.get('weight', 0) for item in packing_list)

        trips_collection.update_one(
            {"_id": trip_id},
            {
                "$set": {
                    "packing_list": packing_list,
                    "total_weight": total_weight
                }
            }
        )

        return jsonify({
            "message": "Packing list generated and added to the trip",
            "packing_list": packing_list,
            "total_weight": total_weight
        })

    except Exception as e:
        return jsonify({"error": "Failed to generate packing list", "details": str(e)}), 500

@app.route('/edit_packing_list', methods=['POST'])
@token_required
def edit_packing_list(current_user):
    data = request.json
    trip_id = ObjectId(data.get('trip_id'))
    items = data.get('items', [])

    if not trip_id:
        return jsonify({"error": "Trip ID is required"}), 400

    # Verify trip belongs to current user
    trip = trips_collection.find_one({"_id": trip_id, "user_id": current_user['_id']})
    if not trip:
        return jsonify({"error": "Trip not found or unauthorized"}), 404

    # Calculate total weight
    total_weight = sum(item.get('weight', 0) for item in items)

    trips_collection.update_one(
        {"_id": trip_id},
        {
            "$set": {
                "packing_list": items,
                "total_weight": total_weight
            }
        }
    )

    return jsonify({
        "message": "Packing list updated",
        "updated_items": items,
        "total_weight": total_weight
    })

@app.route('/add_packing_item', methods=['POST'])
@token_required
def add_packing_item(current_user):
    data = request.json
    trip_id = ObjectId(data.get('trip_id'))
    new_item = data.get('item')

    if not trip_id or not new_item:
        return jsonify({"error": "Trip ID and item details are required"}), 400

    # Verify trip belongs to current user
    trip = trips_collection.find_one({"_id": trip_id, "user_id": current_user['_id']})
    if not trip:
        return jsonify({"error": "Trip not found or unauthorized"}), 404

    # Add required fields if missing
    new_item.update({
        'checked': new_item.get('checked', False),
        'weight': float(new_item.get('weight', 0)),
        'compartment': new_item.get('compartment', 'Other')
    })

    # Add new item to packing list
    updated_list = trip.get('packing_list', []) + [new_item]
    total_weight = sum(item.get('weight', 0) for item in updated_list)

    trips_collection.update_one(
        {"_id": trip_id},
        {
            "$set": {
                "packing_list": updated_list,
                "total_weight": total_weight
            }
        }
    )

    return jsonify({
        "message": "Item added successfully",
        "updated_items": updated_list,
        "total_weight": total_weight
    })

@app.route('/delete_trip', methods=['DELETE'])
@token_required
def delete_trip(current_user):
    trip_id = ObjectId(request.args.get('trip_id'))

    if not trip_id:
        return jsonify({"error": "Trip ID is required"}), 400

    result = trips_collection.delete_one({
        "_id": trip_id,
        "user_id": current_user['_id']
    })

    if result.deleted_count == 1:
        return jsonify({"message": "Trip deleted successfully"})
    else:
        return jsonify({"error": "Trip not found or unauthorized"}), 404

@app.route('/edit_trip', methods=['PUT'])
@token_required
def edit_trip(current_user):
    data = request.json
    trip_id = ObjectId(data.get('trip_id'))
    updated_fields = {
        "destination": data.get('destination'),
        "purpose": data.get('purpose'),
        "duration": data.get('duration'),
        "weather": data.get('weather'),
        "trip_date": data.get('trip_date')
    }

    if not trip_id or not all(updated_fields.values()):
        return jsonify({"error": "Trip ID and all fields are required"}), 400

    result = trips_collection.update_one(
        {
            "_id": trip_id,
            "user_id": current_user['_id']
        },
        {"$set": updated_fields}
    )

    if result.matched_count == 1:
        return jsonify({"message": "Trip updated successfully"})
    else:
        return jsonify({"error": "Trip not found or unauthorized"}), 404

@app.route('/get_suggestions', methods=['POST'])
@token_required
def get_suggestions(current_user):
    data = request.json
    destination = data.get('destination')
    purpose = data.get('purpose')

    if not destination or not purpose:
        return jsonify({"error": "Destination and purpose are required"}), 400

    prompt = (
        f"Provide travel tips for a {purpose} trip to {destination}, including: "
        f"1. Must-see places and attractions\n"
        f"2. Local customs and etiquette\n"
        f"3. Transportation tips\n"
        f"4. Time management advice\n"
        f"5. Suggested daily timeline\n"
        f"6. Safety tips\n"
        f"7. Local food recommendations"
    )

    try:
        response = model.generate_content(prompt)
        suggestions = response.text
        return jsonify({"suggestions": suggestions})

    except Exception as e:
        return jsonify({"error": "Failed to generate suggestions", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0')