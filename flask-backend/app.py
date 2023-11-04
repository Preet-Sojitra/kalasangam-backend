from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

NODE_JS_SERVER = 'http://node-js-url'

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


if __name__ == '__main__':
    app.run(debug=True)