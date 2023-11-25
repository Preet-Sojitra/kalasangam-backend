import json, os, logging, requests, datetime
from random import randint

from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
# from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

from sqlalchemy import create_engine, text

from dotenv import load_dotenv

from selenium import webdriver
from selenium.webdriver.common.by import By

import pandas as pd


load_dotenv()

class Config:
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    NODE_JS_SERVER = 'http://192.168.140.61:3000'
    DB_HOST = os.getenv('DB_HOST')
    DB_PORT = os.getenv('DB_PORT')
    DB_NAME = os.getenv('DB_NAME')
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)
# jwt = JWTManager(app)

db_string = f'postgresql://{Config.DB_USER}:{Config.DB_PASSWORD}@{Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME}'
db = create_engine(db_string)
print('DB Connected')
query = 'SELECT * FROM analytics ORDER BY id DESC LIMIT 1'
with db.connect() as conn:
    result = conn.execute(text(query))
    for (r) in result:
        print(r[0])

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


@app.route('/analytics', methods=['POST'])
# @cross_origin(origins='*')
# @jwt_required
def analytics():
    try:
        args = request.args.to_dict()
        artisan_id = args['artisan_id']
        with db.connect() as conn:
            query = text(f'SELECT artisan_id, january, february, march, april, may, \
                            june, july, august, september, october, november, december \
                     FROM analytics WHERE artisan_id = {artisan_id}')
            result = conn.execute(query)
            r1 = None
            for (r) in result:
                r1 = r
                print(r)
                break
            
            if r1 is not None:
                monthly_sales = {
                    'January': r1[1], 'February': r1[2], 'March': r1[3],
                    'April': r1[4], 'May': r1[5], 'June': r1[6],
                    'July': r1[7], 'August': r1[8], 'September': r1[9],
                    'October': r1[10], 'November': r1[11], 'December': r1[12]
                }

                max_sale_month = max(monthly_sales, key=monthly_sales.get)
                min_sale_month = min(monthly_sales, key=monthly_sales.get)

                total_sales = sum(monthly_sales.values())
                average_sale = total_sales / 12

                return jsonify({
                    'monthly_sales': monthly_sales,
                    'max_sale_month': max_sale_month,
                    'min_sale_month': min_sale_month,
                    'average_sale': average_sale
                }), 200
            else:
                return jsonify({'error': 'No data found for the artisan'}), 404

    except Exception as e:
        print(f'Error during analytics retrieval: {str(e)}')
        return jsonify({'error': str(e)}), 500

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
    
    print(f'Products: {products}\nTimeline: {timeline}')

    return jsonify({'products': products, 'timeline': timeline})

@app.route('/scrape', methods=['GET'])
def get_amz_prices():
    args = requests.args.to_dict()
    search_term = args['search_term']
    median_price = 0
    with db.connect() as conn:
        query = text(f'SELECT median_price FROM products where product_name like {search_term}')
        result = conn.execute(query)
        for row in result:
            median_price = row[1]
    return jsonify({'median': median_price})

# @app.route('/protected', methods=['GET'])
# @jwt_required()
# def protected():
#     current_user = get_jwt_identity()
#     return jsonify(logged_in_as=current_user), 200

@app.route('/update-analytics', methods=['POST'])
@cross_origin(origins='*')
def update_analytics():
    try:
        args = request.args.to_dict()
        artisan_id = args['artisan_id']
        product_id = args['product_id']

        if artisan_id is None or product_id is None:
            return jsonify({'error': 'Missing artisan or product id in the request'}), 400
        
        current_month = datetime.datetime.now().strftime('%B').lower()

        with db.connect() as conn:
            update_query = f'UPDATE analytics SET {current_month} = {current_month} + 1 WHERE artisan_id = {artisan_id} AND product_id = {product_id};'
            conn.execute(update_query)
            conn.commit()
        
        return jsonify({'success': 'analytics updated successfully'}), 200

    except Exception as e:
        print('error:', e)
        return jsonify({'error': 'failed to update analytics'}), 500
    
@app.route('/create-analytics-entry', methods=['POST'])
@cross_origin(origins='*')
# @jwt_required()
def create_analytics_entry():
    try:
        args = request.args.to_dict()
        artisan_id = args['artisan_id']
        product_id = args['product_id']

        if product_id is None:
            return jsonify({'error': 'Missing product_id in the request'}), 400

        # artisan_id = get_jwt_identity()

        current_month = datetime.datetime.now().strftime('%B').lower()  # Get the current month in lowercase

        with db.connect() as conn:
            # Insert a new entry in the analytics table
            insert_query = f"INSERT INTO analytics (id, artisan_id, product_id, year, {current_month}) VALUES ({randint(1000, 200000)}, {artisan_id}, {product_id}, EXTRACT(YEAR FROM NOW()), 1);"
            conn.execute(text(insert_query))
            # conn.commit()

        return jsonify({'success': 'Analytics entry created successfully'}), 200

    except Exception as e:
        print(f'Error during analytics entry creation: {str(e)}')
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)

