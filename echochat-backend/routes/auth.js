const express = require("express")
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require("../models/User");
// added a new line 

const JWT_Secret = "ChatApplicationSecretKey"
router.post('/sign-up',
    [
        check('name').not().isEmpty().withMessage('Name can not be empty'),
        check('password', 'Your password must be at least 5 characters').isLength({ min: 5 }),
        check('email', 'Your email is not valid').isEmail().normalizeEmail(),
    ]
    , async function (req, res) {

        //handling the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(errors.array());
        }

        // checking the existing values
        const { name, email, password } = req.body
        const existingUser = await User.findOne({ $or: [{ name: name }, { email: email }] });
        if (existingUser) {
            const conflictMessage = existingUser.email === email
                ? "Email already exists. Choose a different one."
                : "Name already exists. Choose a different one.";
            return res.status(409).json({
                status: 'fail',
                message: conflictMessage
            });
        }

        // hashing the password 
        let salt = bcrypt.genSaltSync(13);
        let secPass = bcrypt.hashSync(password, salt);

        // creating the user 
        const user = await User.create({
            name: name,
            email: email,
            password: secPass
        })

        // sending the reponse
        res.status(200).json({
            message: "The user has been created successfully"
        })

    });

// login 

router.post('/login',
    [
        check('password', 'Your password must be at least 5 characters').isLength({ min: 5 }),
        check('email', 'Your email is not valid').isEmail()
    ]
    , async function (req, res) {

        try {


            //handling the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json(errors.array());
            }

            // checking the existing values
            const { email, password } = req.body

            let user = await User.findOne({ email: email }).select("-date");
            if (!user) {
                return res.status(400).json({ error: "Invalid credentials" })
            }

            let passwordCompare = await bcrypt.compare(password, user.password)
            if (!passwordCompare) {
                return res.status(400).json({ error: "Invalid credentials" })
            }  

            const Data = {
                id: user.id
            }
            const token = jwt.sign(Data, JWT_Secret)
            // sending the reponse
            res.status(200).json({
                message: "The user Logged in successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                token: token
            })
        } catch (error) {

            res.status(500).send(error.message)
        }

    });


module.exports = router 