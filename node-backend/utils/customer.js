const Product = require('../models/product');
// Assuming you have an Express app set up and a database connection established

// GET request to search for products by name
module.exports.search = ('/search', async (req, res) => {
    const { name } = req.query;

    try {
        const regex = new RegExp(name, 'i');
        const products = await Product.find({ name: regex });

        if(products.length === 0) return res.status(404).json({ message: 'No products are available with this name at this moment' });

        let responses = [];
        for (let i = 0; i < products.length; i++) {
            let response = {
                name: products[i].name,
                price: products[i].price,
                image: products[i].images[0],
                id: products[i]._id
            }
            responses.push(response);
        }
        res.status(200).json(responses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
