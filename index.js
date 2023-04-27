const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000;
const bcrypt = require('bcryptjs')
const { MongoClient } = require('mongodb')
    // const url = "mongodb://localhost:27017"
const url = "mongodb+srv://CAASS:CAASScaass@caass.irtykc7.mongodb.net/test"
const client = new MongoClient(url)
const database = "caass"
const bodyParser = require("body-parser");
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
app.post('/register', (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const table = "register_login"
            // console.log(req.body)

        let create = register(table, name, email, password)

        create.then(function(val) {
            console.log(val.body)
            if (val.body === "Registration successful") {

                res.send("Registration Success, Now LogIn")

            } else if (val.body === "Email exists") {

                res.send("User Already Exists")

            } else if (val.body === "Error in register") {
                res.send("Error in registration, Try again")
            } else {
                res.send("Error, Something went wrong, Try again after some time")
            }
        })
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        }
    }
})
app.post('/login', (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const table = "register_login"
        const check = login(table, email, password)
            // console.log(req.body)
            // console.log(check)
        check.then(function(val) {
            // console.log(val.body)
            if (val.body === "Password doesn't match") {
                res.send("password deoes not match")
            } else if (val.body === "Email Not Registered") {
                res.send("Email Not Registered")
            } else if (val.body === "Login Success") {
                res.send("Logged In")
            } else {
                res.send("Error, Something went wrong, Try again after some time")
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
    console.log("Server started at port " + port)
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
        };
    }
}
const register = async(table, name, email, password) => {
    try {
        // let result = false;
        const db = await dbConnect(table)
        let find = await db.findOne({ email: email })
        if (find != undefined) {
            return {
                statusCode: 500,
                body: "Email exists"
            }
        } else {
            const hash = bcrypt.hashSync(password, 8)
            const result = await db.insertOne({
                    name: name,
                    email: email,
                    password: hash
                })
                // console.log(result.acknowledge)
            if (result.acknowledge) {
                return {
                    statusbar: 200,
                    body: "Registration successful"
                };
            } else {
                return {
                    statusCode: 500,
                    body: "Error in register"
                }
            }
        }
        // return result

    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        }
    }
}
const login = async(table, email, password) => {
    try {
        let db = await dbConnect(table)
            // console.log("lgoin fn email=" + email)
        const info = await db.findOne({ email: email });
        // console.log(info)


        if (info != undefined) {
            // let x = await db.findOne({ password: password })
            if (bcrypt.compareSync(password, info.password)) {
                return {
                    statusCode: 200,
                    body: "Login Success"
                };
            } else {
                return {
                    statusCode: 500,
                    body: "Password doesn't match"
                };
            }
        } else {
            return {
                statusCode: 404,
                body: "Email Not Registered"
            };
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        }
    }
}