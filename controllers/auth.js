const express = require('express')
const router = express.Router()
const argon2 = require('argon2');
var jwt = require('jsonwebtoken')
const { MongoClient, GridFSBucketReadStream } = require("mongodb");
const uri = process.env.DATABASE_URL
const client = new MongoClient(uri);

router.post('/login', async function(req, res) {
    console.log(req.body)
    const user = await findUser(req.body.username)
    if (user) {
        try {
            if (await argon2.verify(user.password, req.body.password)) {
                const tokenUser = {
                    username: user.username,
                    email: user.email
                }
                const token = jwt.sign(tokenUser, process.env.ACCESS_TOKEN_SECRET)
                const response = {
                    token: token,
                    message: 'Úspěšně přihlášen'
                }
                res.send(response);
              // password match
            } else {
                res.status(403).send('Uživatelské jméno nebo heslo není správné')
              // password did not match
            }
          } catch (err) {
            // internal failure
            console.error(err)
          }
    } else {
        res.status(403)
        res.send('Uživatelské jméno nebo heslo není správné')
    }
})

router.post('/register', async function(req, res) {
    const body = req.body
    console.log('body sefe', body)
    const user = await findUser(req.body.username)
    if (user) {
        res.status(403)
        res.send('Toto uživatelské jméno nelze použít')
    } else {
        insertUser(body).catch()
        res.send('Hello World')
    }
})


async function insertUser(user) {
    try {
        await client.connect();
        const database = client.db(process.env.DATABASE_NAME);
        const users = database.collection("users");
        const hash = await argon2.hash(user.password + user.username)
        // create a document to insert
        const doc = {
            username: user.username,
            password: hash,
            email: user.email
        }
        const result = await users.insertOne(doc);
        console.log(`A document was inserted with the _id: ${result.insertedId}`);
    } finally {
        await client.close();
    }
}

async function findUser(username) {
    try {
        await client.connect();
        const database = client.db(process.env.DATABASE_NAME);
        const users = database.collection("users");
        // Query for a movie that has the title 'The Room'
        const query = { username:  username};
        const user = await users.findOne(query);
        // since this method returns the matched document, not a cursor, print it directly
        console.log(user);
        return user;
    } finally {
        await client.close();
    }
}

module.exports = router