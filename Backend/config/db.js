const mongoose = require('mongoose');

const databaseConnect = async() => {
   try {
    await mongoose.connect(process.env.MONGO_URI, {family: 4});
    console.log('🗄️ Database connected successfully');
   } catch (error) {
    console.log('❌ Database connection failed',error.message);
    process.exit(1);
   }
   
};

module.exports = databaseConnect;