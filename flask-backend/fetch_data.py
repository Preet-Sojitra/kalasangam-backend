from init import app, db

@app.route('/sales')
def fetch_sales_data():
    