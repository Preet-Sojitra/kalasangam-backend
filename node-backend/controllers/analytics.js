const {Sequelize} = require('sequelize')

const sequelize = new Sequelize({
    database: "postgres",
    username: "devparikh",
    // password: "postgres",
    host: "localhost",
    dialect: "postgres"
})


exports.test = async(req,res) => {
    try {
        const data = await sequelize.query('SELECT * from sales',{ type: Sequelize.QueryTypes.SELECT })
        return res.status(200).json({data: data})
    } catch (error) {
        return res.status(500).json(error.message)
    }
}