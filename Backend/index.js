const dotenv = require('dotenv');
const path = require('path');
const databaseConnect = require('./config/db');
dotenv.config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing. Create Backend/.env from Backend/.env.example and set a private JWT_SECRET.');
}

const app = require('./app');

const PORT = process.env.PORT || 4545;

databaseConnect()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`FastBooking API listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`FastBooking could not start: ${error.message}`);
    process.exitCode = 1;
  });