const {Sequelize} = require('sequelize')

const sequelize = new Sequelize({
    database: "postgres",
    username: "devparikh",
    // password: "postgres",
    host: "localhost",
    dialect: "postgres"
})

module.exports = {sequelize}