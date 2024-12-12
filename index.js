const express = require('express')
const mongoose = require('mongoose')  //to import mongoose after intalling it from npm
const app = express();
//const port =4000;
//NPM module used to hash passwords
const bcrypt = require('bcrypt')
//initialize dotenv
const env = require('dotenv');
env.config()
const port = process.env.PORT    //process is a global variable in node.js

//middleware //to convert your code to json data
app.use(express.json());

//connect to the database (mongo db)
const db = async() => {
try {
   // await mongoose.connect("mongodb://localhost:27017/AYAFBackend");
    await mongoose.connect(process.env.DATABASE_STRING);
    console.log("Database connected successfully");
    
} catch (error) {
    console.log("error connecting to database");
    
}
}
db();
//create a schema for the database(mongo db)
const userSchema = new mongoose.Schema({    //define the mongoose schema for 'user' collection
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true        //unique identifier for the user
    },
    password: {
        type: String,
        required: true
    }
})
const User = mongoose.model('User', userSchema)   //callback function for the schema using a model



app.get('/', (req, res)=> {   // the / indicates routing, then followed by the callback function
    res.send('Welcome to my Homepage');
})
//For the mongoose signup 
app.post('/signup' ,async(req, res) => {     //defining a POST route for the user signup
try {
    //destructure the request body to get the details of the user
    const {userName, email, password} = req.body;   //req.body is a request method in express
    
    //checks if a user with the same email already exists in the database
    const existingUser = await User.findOne({email:email});
    
    //await is used to tell the function to wait for other tasks/requests
    //In Mongoose, the findOne() method is used to retrieve
    // a single document from a MongoDB collection that matches a specified condition.
    // It is commonly used when you want to find one record, rather than multiple records,
    // based on a query.

    if (existingUser) {
        return res.status(400).json({msg: 'Email already exists, kindly login'})
        
    }
    //HASHING PASSWORD
    const hashPassword = await bcrypt.hash(password, 10)  //10 represents the saltRounds,
    //i.e the number of rounds that the password can be hashed, and the standard is 10-12

    //create a new user document with the provided data using destructuring
    const newUser = new User({
        userName: userName,
        email: email,
        password: hashPassword
    })
    await newUser.save();
    return res.status(200).json({msg: 'User ssaved successfully'})


} catch (error) {
    console.log(error)
    return res.status(500).json({msg: "internal server error"})
    
}
})
//LOGIN
app.post('/login', async(req, res) => {
    try {
      const{email,password} = req.body;
      
      const user = await User.findOne({email:email});

      if(!user){
        return res.status(400).json({msg: "invalid email credentials"})
      }
      //compare the password the user is trying to use to login with the password already stored in the db
      const isMatch = await bcrypt.compare(password, user.password)

      if(!isMatch){
        return res.status(400).json({msg: "invalid password credentials"})
      }
    //   const datainfo = {
    //     email: user.email,
    //     password: user.password
     // }
return res.status(200).json({msg: "logged in successfully"})
    } catch (error) {
       // console.log(error);
        
        return res.status(500).json({msg: "internal server error"})
    }

})


//go to dev.to and write about 5 request methods in express
//go online and find the mongo db syntax to create, find, update
app.listen(port, ()=>{
    console.log(`server is running at http://localhost:${port}`);
    
})