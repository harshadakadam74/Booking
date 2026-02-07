const app = require('./app');
const dotenv = require('dotenv');
const databaseConnect = require('./config/db');
dotenv.config({path:".env"})


databaseConnect();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});