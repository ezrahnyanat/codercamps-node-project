const express = require('express')
const router = express.Router()
const passport = require('passport')
const localStrategy = require('passport-local').Strategy

const User = require('../models/user')

router.get('/signup', (req, res) => {
    res.render('signup')
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/signup', (req, res) => {
    const name = req.body.name
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password
    const password2 = req.body.password2

    req.checkBody('name', 'Name is required').notEmpty()
    req.checkBody('email', 'Email is required').notEmpty()
    req.checkBody('email', 'Email is not valid').isEmail()
    req.checkBody('username', 'Username is required').notEmpty()
    req.checkBody('password', 'Password is required').notEmpty()
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password)

    
    var errors = req.validationErrors()

    if(errors) {
        res.render('signup', {
            errors: errors
        })
    } else {
        const newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        })

        User.createUser(newUser, (err, user) => {
            if (err) throw err
            console.log(user)
        })

        req.flash('success_msg', 'Thanks for signing up! You can now login')

        res.redirect('/users/login')
    }
})

passport.use(new localStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, (err, user) => {
            if(err) throw err
            if(!user) {
                return done(null, false, {message: 'unknown user'})
            }
        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err
            if(isMatch) {
                return done(null, user)
            } else {
                return done(null, false, {message: 'invalid password'})
            }
        })
        })
    }));

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    User.getUserById(id, (err, user) => {
        done(err, user)
    })
})

router.post('/login', 
    passport.authenticate('local', {successRedirect: '/', failureRedirect: '/users/login', failureFlash: true}), 
    (req, res) => {
        res.redirect('/')
    })

router.get('logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'You have logged out!')
    res.redirect('users/login')
})

module.exports = router