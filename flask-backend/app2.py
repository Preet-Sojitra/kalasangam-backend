import json, os, logging, requests, datetime

from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

from dotenv import load_dotenv

from selenium import webdriver
from selenium.webdriver.common.by import By

import pandas as pd
import psycopg2


load_dotenv()

class Config:
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    NODE_JS_SERVER = 'http://192.168.140.61:3000'

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)
jwt = JWTManager(app)

DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')

conn = psycopg2.connect(
    host=DB_HOST, port=DB_PORT, database=DB_NAME, 
    user=DB_USER, password=DB_PASSWORD
)

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


@app.route('/analytics', methods=['GET'])
@cross_origin(origins='*')
@jwt_required
def analytics():
    try:
        artisan_id = get_jwt_identity()
        with conn.cursor() as cursor:
            query = f'SELECT artisan_id, january, february, march, april, may,
                            june, july, august, september, october, november, december \
                     FROM analytics WHERE artisan_id = {artisan_id} \
                     GROUP BY artisan_id;'
            cursor.execute(query)
            result = cursor.fetchone()

            if result is not None:
                monthly_sales = {
                    'January': result[1], 'February': result[2], 'March': result[3],
                    'April': result[4], 'May': result[5], 'June': result[6],
                    'July': result[7], 'August': result[8], 'September': result[9],
                    'October': result[10], 'November': result[11], 'December': result[12]
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
        return jsonify({'error': 'Failed to retrieve analytics'}), 500

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

@app.route('/update-analytics', methods=['POST'])
@cross_origin(origins='*')
@jwt_required
def update_analytics():
    try:
        data = request.get_json()
        artisan_id = data.get('artisan_id')
        product_id = data.get('product_id')

        if artisan_id is None or product_id is None:
            return jsonify({'error': 'Missing artisan or product id in the request'}), 400
        
        current_month = datetime.datetime.now().strftime('%B').lower()

        with conn.cursor() as cursor:
            update_query = f'UPDATE analytics SET {current_month} = {current_month} + 1 WHERE artisan_id = {artisan_id} AND product_id = {product_id};'
            cursor.execute(update_query)
            conn.commit()
        
        return jsonify({'success': 'analytics updated successfully'}), 200

    except Exception as e:
        print('error:', e)
        return jsonify({'error': 'failed to update analytics'}), 500
    
@app.route('/create-analytics-entry', methods=['POST'])
@cross_origin(origins='*')
@jwt_required()
def create_analytics_entry():
    try:
        data = request.get_json()
        product_id = data.get('product_id')

        if product_id is None:
            return jsonify({'error': 'Missing product_id in the request'}), 400

        artisan_id = get_jwt_identity()

        current_month = datetime.now().strftime('%B').lower()  # Get the current month in lowercase

        with conn.cursor() as cursor:
            # Insert a new entry in the analytics table
            insert_query = f"INSERT INTO analytics (artisan_id, product_id, year, {current_month}) VALUES ({artisan_id}, {product_id}, EXTRACT(YEAR FROM NOW()), 1) ON CONFLICT (artisan_id, product_id, year) DO UPDATE SET {current_month} = analytics.{current_month} + 1;"
            cursor.execute(insert_query)
            conn.commit()

        return jsonify({'success': 'Analytics entry created successfully'}), 200

    except Exception as e:
        print(f'Error during analytics entry creation: {str(e)}')
        return jsonify({'error': 'Failed to create analytics entry'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0')

