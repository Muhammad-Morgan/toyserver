const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
dotenv.config()

const Members = require('./Models/membersModel')
const item = require('./Models/itemModel')

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.URI)
mongoose.connection.once('open', () => console.log('connected to MongoDB'))
app.get('/', (req, res) => {
    res.send('Hi, there...')
})
app.get('/auth', (req, res) => {
    const { token } = req.query
    if (!token) return res.json({
        msg: 'no token...',
        type: 'danger'
    })
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decode) => {
        if (err) return res.json({
            msg: 'not a valid token',
            type: 'danger'
        })
        return res.json({
            type: 'success',
            myToken: token
        })
    })
})
app.post('/register', (req, res) => {
    const {
        name,
        email,
        password,
        myID
    } = req.body
    bcrypt.genSalt(process.env.SALT, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            Members.create({
                name,
                email,
                myID,
                password: hash
            }).then(() => {
                const token = jwt.sign({ myID, name }, process.env.TOKEN_SECRET, { expiresIn: process.env.EXPIRE_TOKEN })
                res.json({
                    token,
                    msg: 'registered successfully !',
                    type: 'success'
                })
            }).catch(err => console.log(err))
        })
    })
})
app.post('/login', (req, res) => {
    const { email, password } = req.body
    Members.findOne({ email }).then((results) => {
        if (!results) return res.json({
            msg: 'no account was found',
            type: 'danger'
        })
        else {
            const { name, myID } = results
            bcrypt.compare(password, results.password).then((resultCondition) => {
                if (resultCondition) {
                    const token = jwt.sign({ name, myID }, process.env.TOKEN_SECRET, { expiresIn: process.env.EXPIRE_TOKEN })
                    res.json({
                        token, msg: 'logged in !',
                        type: 'success'
                    })
                } else {
                    res.json({
                        msg: 'wrong password !',
                        type: 'danger'
                    })
                }
            }).catch(err => console.log(err))
        }
    }).catch(err => console.log(err))
})
app.get('/products', (req, res) => {
    const { category } = req.query
    if (category === 'all') {
        item.find().then((result) => res.json( {newList: result} )).catch(err => console.log(err))
    }
    else {
        item.find().then((result) => {
            const newList = result.filter((item) => item.category === category)
            res.json({ newList })
        }).catch(err => console.log(err))
    }
})
app.listen(5000, () => console.log('Listening on Server 5000'))
