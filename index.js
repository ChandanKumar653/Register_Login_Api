const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const bcrypt = require('bcryptjs')
const { MongoClient } = require('mongodb')
    // const url = "mongodb://localhost:27017"
const url = "mongodb+srv://CAASS:CAASScaass@caass.irtykc7.mongodb.net/test"
const client = new MongoClient(url)
const database = "caass"
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.post('/register', (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const table = "register_login"
            // console.log(req.body)
        let create = register(table, name, email, password)
        create.then(function(val) {
            if (val) {
                res.send("Registration Success, Now LogIn")

            } else {
                res.send("User Already Exists OR Error, try again after some time")

            }
        })
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        }
    }
})
app.listen(port, () => {
    console.log("Server started at " + port)
})
async function dbConnect(table) {
    try {
        const result = await client.connect()
        let db = result.db(database)
        return db.collection(table)
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        }
    }
}
const register = async(table, name, email, password) => {
    try {
        const db = await dbConnect(table)
        let find = await db.findOne({ email: email })
        if (find != undefined) {
            result = false
        } else {
            const hash = bcrypt.hashSync(password, 8)
            const result = await db.insertOne({
                name: name,
                email: email,
                password: hash
            })
        }
        return result

    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        }
    }
}