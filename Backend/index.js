const dotenv = require('dotenv');
const path = require('path');
const databaseConnect = require('./config/db');
dotenv.config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured before starting the backend');
}

const app = require('./app');

databaseConnect();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});