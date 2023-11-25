CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY, 
    artisian_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    january INTEGER DEFAULT 0,
    february INTEGER DEFAULT 0,
    march INTEGER DEFAULT 0,
    april INTEGER DEFAULT 0,
    may INTEGER DEFAULT 0,
    june INTEGER DEFAULT 0,
    july INTEGER DEFAULT 0,
    august INTEGER DEFAULT 0,
    september INTEGER DEFAULT 0,
    october INTEGER DEFAULT 0,
    november INTEGER DEFAULT 0,
    december INTEGER DEFAULT 0
);


CREATE TABLE IF NOT EXISTS products (
    product_name varchar(255) NOT NULL,
    median_price INTEGER NOT NULL
);
