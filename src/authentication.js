const jwt = require("jsonwebtoken");
const User = require("./user_model");

// this middleware will be used for authenticating and validating tokens from the header
const authenticate = async (req, res, next) => {
    try {
        //console.log(req.cookies['access_token']);
        const retrieved_token =  req.cookies['access_token']; // req.header('Authorization').replace("Bearer ", ""); //  // // getting the token from the header in request
       // console.log("token", retrieved_token);
        const decoded = jwt.verify(retrieved_token, 'SecretToken'); // verifying the signature of the retrieved token using the public key secret 
        //\console.log(decoded);
        const user = await User.findOne({ // find the user associated with the token using token _id which matches the user _id and the actual token
            _id: decoded._id,
            'JWTtokens.token': retrieved_token
        });
        if (!user) {
            throw new Error("failed to authenticate user");
        } else {
            req.user = user;
           // req.token = retrieved_token;
            next();
        }
        
    } catch (e) {
        res.status(401).send({ "message": "Please authenticate" });
    }
}

module.exports = authenticate;