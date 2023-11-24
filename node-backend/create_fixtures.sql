CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER NOT NULL,
    artisan_id INTEGER NOT NULL,
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
    december INTEGER DEFAULT 0,
    PRIMARY KEY(id)
);