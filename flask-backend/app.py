from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import requests
import json
import pandas as pd

from selenium import webdriver
from selenium.webdriver.common.by import By

app = Flask(__name__)
CORS(app)

NODE_JS_SERVER = 'http://192.168.140.61:3000'

options = webdriver.FirefoxOptions()
options.add_argument("-headless")
driver = webdriver.Firefox(options=options)

data = None

@app.route('/api/v1/test')
@cross_origin(origins='*')
def test():
    global data
    response = requests.get(f'{NODE_JS_SERVER}/api/v1/test')
    print(response)
    if response.status_code == 200:
        data = response.json()
        return jsonify(data)
    return jsonify({'error': 'Failed to fetch data from Node.js server'}), 500

@app.route('/fetch-data', methods=['GET'])
def fetch_data():
    response = requests.get(f'{NODE_JS_SERVER}/fetch-db-content')
    if response.status_code == 200:
        data = response.json()
        return jsonify(data)
    return jsonify({'error': 'Failed to fetch data from Node.js server'}), 500

@app.route('/send', methods=['GET'])
def send_json_response():
    global data
    response = requests.get(f'{NODE_JS_SERVER}/api/v1/test')
    print(response)
    if response.status_code == 200:
        data = response.json()
    file = open('temp.json', 'w')
    json.dump(data, file)
    file.close()

    products, timeline = {}, {}

    df = pd.read_json('temp.json')

    for i in df['data']:
        # print(i)
        if i['product_id'] in products:
            products[i['product_id']] += 1
        else:
            products[i['product_id']] = 1


    for i in df['data']:
        if i['purchasedat'][5:7] in timeline:
            timeline[i['purchasedat'][5:7]] += 1
        else:
            timeline[i['purchasedat'][5:7]] = 1

    print(products, timeline, sep='\n')

    return jsonify({'products': products, 'timeline': timeline})
    

def url_gen_amz(search_term):
    url = 'https://www.amazon.in/s?k='
    for i in search_term.split('_'):
        url += i + '+'
    url = url[:-1]
    return url

def url_gen_flp(search_term):
    url = 'https://www.flipkart.com/search?q=' + search_term
    return url

@app.route('/scrape', methods=['GET'])
def amz_get_prices():
    args = request.args
    args = args.to_dict()
    search_term = args['search_term']
    print(search_term)
    input_url = url_gen_amz(search_term)
    print(input_url)
    driver.get(input_url)
    price_string = driver.find_elements(By.CLASS_NAME, 'a-price') 
    
    l = []
    for i in price_string:
        l.append(i.text)

    args = request.args
    args = args.to_dict()
    search_term = args['search_term']
    input_url = url_gen_flp(search_term)
    driver.get(input_url)
    price_string = driver.find_elements(By.CLASS_NAME, '_30jeq3') 

    for i in price_string:
        l.append(i.text)

    l_prices = price_cleanup(l)
    l_prices = sorted(l_prices)
    return jsonify({'median': l_prices[len(l_prices) // 2]})


def price_cleanup(price_list):
    l = price_list
    l_prices = []
    for i in range(len(l)):
        l[i] = l[i][1:]
        s = ''
        for j in l[i]:
            if j!=',':
                s += j
        try:
            l[i] = int(s)
            l_prices.append(l[i])
        except Exception as e:
            pass
    return l_prices


if __name__ == '__main__':
    app.run(host='0.0.0.0')
    # response = requests.get(f'{NODE_JS_SERVER}/api/v1/test')
    
    # data = response.json
    # print(jsonify(data))
    # # print(jsonify({'error': 'Failed to fetch data from Node.js server'}), 500)