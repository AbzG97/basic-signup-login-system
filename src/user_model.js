const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error('must be a valid email address');
            }
        }
    },
    age: {
        type: Number,
        required: false,
        default: 30,
        trim: true
    },
    password: {
        type: String,
        required: true,
        validate(val){
            if(val.length < 6){
                throw new Error("password must be atleast 6 characters");
            }
        }
    },
    JWTtokens: [{ // array where all of the jwt tokens will be used
        token: {
            type: String,
            required: true
        }
    }]
});

// encrypts the user password before performing a save operation
userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});



const User = mongoose.model("User", userSchema, 'users');


module.exports = User;