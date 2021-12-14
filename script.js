require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

const authController = require('./controllers/auth')
const tokenHandler = require('./middleware/tokenHandler')

app.use(cors())
app.use(express.json())

app.use('/auth', authController)

app.get('/test', tokenHandler, function(req, res) {
    res.send('Ahoj s autorizaci')
})

app.get('/test2', function(req, res) {
    res.send('Ahoj bez autorizace')
})

app.listen(process.env.APPLICATION_PORT, () => { console.log('Aplikace bezi na portu: ', process.env.APPLICATION_PORT) })
