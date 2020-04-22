const router = require("express").Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');  // npm i jsonwebtoken
const secrets = require('../api/secrets.js');
const Users = require("../users/users-model.js");

router.post('/register', (req, res) => {
    let user = req.body; // username, password
    //rounds are 2 to the N times
    const rounds = process.env.HASH_ROUNDS || 8;

    // hash the creds.password
    const hash = bcrypt.hashSync(user.password, rounds);
    // update the creds to use the hash
    user.password = hash;

    Users.add(user)
    .then(saved => {
        res.status(201).json(saved);
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            errorMessage: error.message
        });
    });
});

router.post('/login', (req, res) => {
    let { username, password } = req.body; 
    
    //search for user by using the username
    Users.findBy({ username })
    .then(([user]) => {
        // if we find the user, than also check that the passwords match
        //console.log(found[0], 'found');
        if(user && bcrypt.compareSync(password, user.password)) {
            //produce a token
            const token = generateToken(user);
            //send the token to client
            res.status(200).json({
                message: 'Welcome', token
            });
        } else {
            res.status(401).json({
                message: 'You cannot pass'
            });
        };
       
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            errorMessage: error.message
        });
    });
});

function generateToken(user){
    // payload is the data
    const payload = {
        userId: user.id,
        username: user.username,
        password: user.password
    }
    const secret = secrets.jwtSecret;
    const options = {
        expiresIn: '2d'
    }

   return jwt.sign(payload, secret, options);
}

    

module.exports = router;
