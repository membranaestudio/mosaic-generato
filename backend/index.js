"use strict"

require('dotenv').config()
const express = require('express')
const app = express()
const process = require('process')
const cors = require('cors')
const createRoutes = require('./routes')

// Middleware for console log the image requests
app.use(function (req, res, next) {
    console.log(`${req.method} ${req.url}`)
    next()
})

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

function server() {
    createRoutes(app)
    app.listen(process.env.PORT, () => console.log(`Servidor activo en el puerto ${process.env.PORT}`))
}

server()