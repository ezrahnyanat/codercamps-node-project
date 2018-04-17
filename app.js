const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const mongo = require('mongodb')
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/0-final-project')
const db = mongoose.connection

const routes = require('./routes/index')
const users = require('./routes/users')

const app = express()

const handlebars = require('express-handlebars').create({defaultLayout: 'main'})
app.set('views', path.join(__dirname, 'views'))
app.engine('handlebars', handlebars.engine)
app.set('view engine', 'handlebars')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        const namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']'
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        }
    }
}))

app.use(flash())

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null
    next()
})

app.use('/', routes)
app.use('/users', users)

app.listen(8080, () => {
    console.log('SERVER IS UP')
})