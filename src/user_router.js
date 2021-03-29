const express = require("express");
const User_Router = express.Router();
require("./mongodb_connection");
const User = require("./user_model");
const authenticate = require("./authentication");
const bcrypt = require("bcrypt");



User_Router.get("/", async (req, res) => {
    res.render('index');
});


// Sign up / create new user route
User_Router.post('/users', async (req, res) => {
    console.log(req.body);
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
        password: req.body.password
    });
  //  console.log(newUser);

    try {

       
        await newUser.save();
        const new_token = await newUser.generateJWT();
      //  localStorage.setItem('token', new_token);
      res.cookie('access_token', new_token, {
        maxAge: 3600 * 100,
        httpOnly: true
    });


        res.status(201).render('dashboard', {
            "message": "the following user has been added to db",
            // user: newUser, 
            // token: new_token 
        });

    } catch (e) {
        res.status(500).send({ "error": "Server error" });

    }

});
// login user
User_Router.post('/users/login', async (req, res) => {
    try {

        const user = await User.findByCreds(req.body.email, req.body.password);
        const new_token = await user.generateJWT();
       res.cookie('access_token', new_token, {
           maxAge: 3600 * 100,
           httpOnly: true
       });
        res.status(200).render('dashboard', {
            user: user, 
            // token: new_token 
        });

    } catch (e) {
        res.status(500).send({ "error": "Server error" });
    }

});

// get all users
User_Router.get("/users", async (req, res) => {
    try {
        const users = await User.find({});
        const doc_count = await User.count();
        res.status(200).send({ users, count: doc_count });

    } catch (e) {
        res.status(500).send({ "error": "Server error" });
    }
});

// ROUTES THAT REQUIRE AUTHENTICATION read, update, delete profiles using  their jwt and verifying it.



// get the user details of an authenticated user
User_Router.get("/users/profile", authenticate, async (req, res) => {
    res.send({message: "authentication successful", user: req.user});
});

// deleting the authenticated user profile
User_Router.get("/users/profile/delete", authenticate, async(req, res) => {
   
    try{
        await User.findByIdAndDelete({_id: req.user._id}); // finds the user using req.user_id and deletes the user
        
        // res.status(200).send({"message":"deletion successful the following user has been deleted", user: user_to_be_deleted});
        res.status(200).redirect("/");
      

    } catch (e){
        res.status(500).send({"message":"server error, deletion faild"});
    }
   

});

// send the user data to a form in order for the user to update it on the client side
User_Router.get("/users/profile/updateForm", authenticate, async (req, res) => {
    res.render("updateForm", { user: req.user});
});

// update user data
User_Router.post('/users/profile/update', authenticate, async(req, res) => {
    const hashedPassword =  await bcrypt.hash(req.body.password, 8);
    console.log(Object.keys(req.body));
    const updated_data = {
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
        password: hashedPassword
    }
    console.log(updated_data);
    try{
        const user_to_be_updated = await User.findByIdAndUpdate({_id: req.user._id}, updated_data);
        await user_to_be_updated.save();
        console.log(user_to_be_updated);
      //  await user_to_be_updated.save();
        res.status(200).render('dashboard', {"message": "updated user info"});

    } catch(e) {
        res.status(500).send({"message":"server error, failed to update data"});
    }
});

// logout route that deletes all of the tokens in the JWTtoken array
User_Router.post("/users/profile/logout", authenticate, async (req, res) => {
    try{
        req.user.JWTtokens = [];
        await req.user.save();
        res.status(200).redirect("/");

    } catch (e){
        res.status(500).send({"message":"server error, failed to logout"});
    }
    

});


module.exports = User_Router;