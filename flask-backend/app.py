from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

from selenium import webdriver
from selenium.webdriver.common.by import By

app = Flask(__name__)
CORS(app)

NODE_JS_SERVER = 'http://node-js-url'

options = webdriver.FirefoxOptions()
options.add_argument("-headless")
driver = webdriver.Firefox(options=options)

@app.route('/fetch-data', methods=['GET'])
def fetch_data():
    response = requests.get(f'{NODE_JS_SERVER}/fetch-db-content')
    if response.code == 200:
        data = response.json()
        return jsonify(data)
    return jsonify({'error': 'Failed to fetch data from Node.js server'}), 500

@app.route('/send-json-response', methods=['POST'])
def send_json_response(data):
    return jsonify({'data': data})

def url_gen(search_term):
    url = 'https://www.amazon.in/s?k='
    for i in search_term.split('_'):
        url += i + '+'
    url = url[:-1]
    return url

@app.route('/scrape', methods=['GET'])
def get_prices():
    args = request.args
    args = args.to_dict()
    search_term = args['search_term']
    input_url = url_gen(search_term)
    driver.get(input_url)
    price_string = driver.find_elements(By.CLASS_NAME, 'a-price') 
    
    l = []
    for i in price_string:
        l.append(i.text)

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
    
    l_prices = sorted(l_prices)
    
    return jsonify({'median': l_prices[len(l_prices) // 2]})


if __name__ == '__main__':
    app.run(debug=True)