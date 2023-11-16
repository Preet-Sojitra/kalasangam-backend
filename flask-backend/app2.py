import json, os, logging, requests

from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

from dotenv import load_dotenv

from selenium import webdriver
from selenium.webdriver.common.by import By

import pandas as pd


load_dotenv()

class Config:
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    NODE_JS_SERVER = 'http://192.168.140.61:3000'

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)
jwt = JWTManager(app)

options = webdriver.FirefoxOptions()
options.add_argument("-headless")
driver = webdriver.Firefox(options=options)

data = None


def save_to_json(data, filename):
    with open(filename, 'w') as file:
        json.dump(data, file)

def url_gen_amz(search_term):
    url = 'https://www.amazon.in/s?k='
    for term in search_term.split('_'):
        url += term + '+'
    return url[:-1]

def url_gen_flp(search_term):
    return f'https://www.flipkart.com/search?q={search_term}'

def price_cleanup(price_list):
    cleaned_prices = []
    for price in price_list:
        price = price[1:].replace(',', '')
        try:
            cleaned_prices.append(int(price))
        except ValueError:
            pass
    return sorted(cleaned_prices)


@app.route('/api/v1/test')
@cross_origin(origins='*')
def test():
    response = requests.get(f'{app.config["NODE_JS_SERVER"]}/api/v1/test')
    logging.info(f'Response: {response}')
    if response.status_code == 200:
        return jsonify(response.json())
    return jsonify({'error': 'Failed to fetch data from Node.js server'}), 500

@app.route('/fetch-data', methods=['GET'])
def fetch_data():
    response = response = requests.get(f'{app.config["NODE_JS_SERVER"]}/fetch-db-content')
    if response.status_code == 200:
        return jsonify(response.json())
    return jsonify({'error': 'Failed to fetch data from Node.js server'}), 500

@app.route('/send', methods=['GET'])
def send_json_response():
    global data
    response = requests.get(f'{app.config["NODE_JS_SERVER"]}/api/v1/test')
    logging.info(f'Response: {response}')
    if response.status_code == 200:
        data = response.json()

    products, timeline = {}, {}

    df = pd.read_json(data)

    for entry in df['data']:
        if entry['product_id'] in products:
            products[entry['product_id']] += 1
        else:
            products[entry['product_id']] = 1
    
    for entry in df['data']:
        month = entry['purchase_date'][5:7]
        timeline[month] = timeline.get(month, 0) + 1
    
    logging.info(f'Products: {products}\nTimeline: {timeline}')

    return jsonify({'products': products, 'timeline': timeline})

@app.route('/scrape', methods=['GET'])
def get_amz_prices():
    args = request.args.to_dict()
    search_term = args['search_term']

    amz_url = url_gen_amz(search_term)
    logging.info(f'Amazon URL: {amz_url}')
    
    driver.get(amz_url)
    price_string = driver.find_elements(By.CLASS_NAME, 'a-price') 
    
    prices = []
    for price_element in price_string:
        prices.append(price_element.text)

    flp_url = url_gen_flp(search_term)
    logging.info(f'Flipkart URL: {flp_url}')

    driver.get(flp_url)
    price_string = driver.find_elements(By.CLASS_NAME, '_30jeq3') 

    for price_element in price_string:
        prices.append(price_element.text)

    cleaned_prices = price_cleanup(prices)
    median_price = cleaned_prices[len(cleaned_prices) // 2]

    return jsonify({'median': median_price})

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0')

