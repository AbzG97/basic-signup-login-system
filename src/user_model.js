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

// finds the user using email and password
userSchema.statics.findByCreds = async (email, password) => {
    const user = await User.findOne({email: email}); // find by email
    if(!user) {
        throw new Error("failed login");
    } else {
        const match_password = await bcrypt.compare(password, user.password); // compare the password parameter by the user model password
        if(!match_password){
            throw new Error("failed login");
        } else {
            return user;
        }
    }
}

// mongoose method for the user model that generates a jwt tokens for users when signin up and logging in
userSchema.methods.generateJWT = async function() {
    const user = this;
    const generate_token = jwt.sign({_id: user._id.toString()}, 'SecretToken', { expiresIn: '1h' }); // generate new token using jwt library
    user.JWTtokens = user.JWTtokens.concat({token : generate_token}); // adds the object to tokens array
    await user.save();
    return generate_token;
    
}


const User = mongoose.model("User", userSchema, 'users');


module.exports = User;