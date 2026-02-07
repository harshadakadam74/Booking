const express = require('express');
const app = express();
const cors = require('cors');
 
app.use(express.json());
app.use(cors());

const Auth_Route = require('./routes/AuthRoutes')
app.use('/api/v1/auth', Auth_Route);

const User_Route = require('./routes/UserRoutes')
app.use('/api/v1/user', User_Route);


//routes



module.exports = app;