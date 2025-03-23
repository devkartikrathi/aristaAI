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

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-pro")

@app.route('/')
def home():
    return jsonify({"data": "Welcome to the Travel Assistant API"})

@app.route('/generate_packing_list', methods=['POST'])
def generate_packing_list():
    data = request.json
    destination = data.get('destination')
    purpose = data.get('purpose')
    duration = data.get('duration')
    traveler = data.get('traveler')
    
    prompt = (f"""
              Generate a detailed packing list for a traveler going to {destination} for {duration} days for a {purpose} trip. The traveler type is {traveler}. Assume average weather for that time of year. Provide estimated item weights in grams and group items into categories. 
              
            Use the following JSON structure:
            {
            "category": "Clothing",
            "items": [
                {
                "name": "3x T-Shirts",
                "weight_grams": 600
                },
                {
                "name": "2x Pants",
                "weight_grams": 800
                }
            ]
            // Add more categories like Electronics, Toiletries, Documents, Essentials
            },
            "total_estimated_weight_grams": 8700
              """)
    
    try:
        response = model.generate_content(prompt)
        packing_list = json.loads(response.text)

        return jsonify({
            "message": "Packing list generated and added to the trip",
            "packing_list": packing_list
        })

    except Exception as e:
        return jsonify({"error": "Failed to generate packing list", "details": str(e)}), 500

@app.route('/get_suggestions', methods=['POST'])
def get_suggestions():
    data = request.json
    destination = data.get('destination')
    purpose = data.get('purpose')
    duration = data.get('duration')
    traveler = data.get('traveler')

    if not destination or not purpose:
        return jsonify({"error": "Destination and purpose are required"}), 400

    prompt = (f"""
              Create a detailed day-by-day travel itinerary for a traveler visiting {destination} for {duration} days. The purpose of the visit is {purpose}, and the traveler type is [TRAVELER TYPE: {traveler}]. The itinerary should include major attractions, suggested timings, local travel tips, and estimated daily expenses. You can also add Must-see places and attractions, Local customs and etiquette, Transportation tips, Safety tips.

            Present the itinerary in the following JSON format:
            {
            "itinerary": [
                {
                "day": 1,
                "title": "Day 1: Arrival and City Exploration",
                "activities": [
                    {
                    "time": "9:00 AM",
                    "description": "Check-in at hotel and freshen up"
                    },
                    {
                    "time": "11:00 AM",
                    "description": "Visit Tokyo Skytree",
                    "estimated_cost_usd": 25
                    }
                ],
                "total_estimated_cost_usd": 60
                }
                // More days here
            ],
            "local_emergency_contacts": {
                "police": "110",
                "ambulance": "119",
                "fire": "119",
                "nearest_embassy": {
                "country": "India",
                "phone": "+81-3-3262-2391",
                "address": "2-2-11 Kudan-Minami, Chiyoda-ku, Tokyo 102-0074"
                }
            },
            "currency_info": {
                "local_currency": "Japanese Yen (JPY)",
                "conversion_rate_to_ind": 0.57
            }
            }
            """)

    try:
        response = model.generate_content(prompt)
        suggestions = response.text
        return jsonify({"suggestions": suggestions})

    except Exception as e:
        return jsonify({"error": "Failed to generate suggestions", "details": str(e)}), 500
    
@app.route('/chat', methods=['POST'])
def get_suggestions():
    data = request.json
    query = data.get('query')
    products = data.get('products')

    prompt = (f"""
        You are Jarvis, a highly intelligent and friendly AI shopping assistant for a smart luggage e-commerce website. You know every detail about every product listed in the provided product catalog (structured as JSON). You assist users by recommending products, answering queries about specifications, comparing models, and helping them choose the best item based on their needs.

        When a user sends a query (like “I’m an 18-year-old student looking for a lightweight cabin bag”), extract relevant information such as age, use case, budget, travel habits, etc., and then match it with the most suitable products from the product catalog.

        Always respond in a helpful and friendly tone. Provide product names, short descriptions, and direct product links. If possible, recommend 2-3 top options with different advantages (e.g., lightweight, durable, tech-enabled). Avoid generic or vague responses.

        Here is the user query: {query}.

        Here is the product catalog JSON: {products}.
    """)
    
    try:
        response = model.generate_content(prompt)
        answer = response.text
        return jsonify({"response": answer})

    except Exception as e:
        return jsonify({"error": "Failed to generate response", "details": str(e)}), 500
    
@app.route('/chatai', methods=['POST'])
def get_suggestions():
    data = request.json
    query = data.get('query')

    prompt = (f"""
        You are a helpful, concise, and context-aware travel assistant for users who are currently traveling in a foreign country. The user will provide a real-time travel-related question (e.g., 'Where can I buy a SIM card near me?' or 'Best vegetarian restaurant in Shibuya?').

        Do not give long introductions or generic travel advice. Give the answer directly and clearly in 2-4 sentences. If a list is appropriate (e.g., top restaurants), return 3-5 relevant results with names, short descriptions, and locations.

        If the question is about local laws, transport, customs, or services, be precise and current. Avoid unnecessary filler text. Always assume the user is on the move and needs quick help.

        Here is the user query: {query}.
    """)
    
    try:
        response = model.generate_content(prompt)
        answer = response.text
        return jsonify({"response": answer})

    except Exception as e:
        return jsonify({"error": "Failed to generate response", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0')