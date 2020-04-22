const router = require("express").Router();
const bcrypt = require('bcryptjs');

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
    .then(([found]) => {
        // if we find the user, than also check that the passwords match
        //console.log(found[0], 'found');
        if(found && bcrypt.compareSync(password, found.password)) {
            //check if passwords match, async
            req.session.loggedIn = true;
            res.status(200).json({
                message: 'Welcome'
            })
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

router.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(error => {
        if(error){
            res.status(500).json({
                errorMessage: 'you can checkout any time you like but you can never leave'
            });
        } else {
            res.status(204).end();
        };
    }); 
    } else {
        res.status(204).end();
    }; 
}); 
    

module.exports = router;
