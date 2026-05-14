# Backend-Frontend Integration Guide

## Setup Instructions

### Prerequisites
- Node.js and npm installed
- MongoDB running locally or connection string available
- Port 4545 (backend) and 5173 (frontend by default) available

### Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd Backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - File: `.env`
   - Update the following variables:
     ```
     MONGO_URI=mongodb://localhost:27017/booking
     PORT=4545
     JWT_SECRET=your_jwt_secret_key_change_this_in_production
     SMTP_USER=your_email@gmail.com
     SMTP_PASS=your_app_password
     NODE_ENV=development
     ```

4. **Start Backend Server**
   ```bash
   npm run dev
   ```
   - Backend will run on `http://localhost:4545`

### Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd Frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - File: `.env`
   - Already configured to use: `VITE_API_URL=http://localhost:4545`

4. **Start Frontend Development Server**
   ```bash
   npm run dev
   ```
   - Frontend will typically run on `http://localhost:5173`

## API Endpoints

### Authentication Routes (`/api/v1/auth`)
- `POST /register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "mobile": "1234567890"
  }
  ```
- `POST /login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### User Routes (`/api/v1/user`)
- `GET /profile` - Get user profile (requires auth)

### Booking Routes (`/api/v1/bookings`)
- `POST /create` - Create a new booking (requires auth)
  ```json
  {
    "property": "Hotel Name",
    "checkInDate": "2024-12-25",
    "checkOutDate": "2024-12-27",
    "numberOfGuests": 2,
    "numberOfRooms": 1,
    "pricePerNight": 100,
    "specialRequests": "Non-smoking room"
  }
  ```
- `GET /my-bookings` - Get user's bookings (requires auth)
- `GET /:bookingId` - Get booking details (requires auth)
- `PUT /:bookingId` - Update booking (requires auth)
- `POST /:bookingId/cancel` - Cancel booking (requires auth)
- `GET /admin/all-bookings` - Get all bookings (admin only)

## Testing the Integration

### 1. Test Backend
```bash
# Check if backend is running
curl http://localhost:4545/api/v1/auth/register
```

### 2. Register a User
```bash
curl -X POST http://localhost:4545/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "mobile": "1234567890"
  }'
```

Response will include JWT token and user data.

### 3. Create a Booking
```bash
curl -X POST http://localhost:4545/api/v1/bookings/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "property": "Sea View Resort",
    "checkInDate": "2024-12-25",
    "checkOutDate": "2024-12-27",
    "numberOfGuests": 2,
    "numberOfRooms": 1,
    "pricePerNight": 150
  }'
```

### 4. Frontend Testing
- Navigate to `http://localhost:5173`
- Test registration and login flows
- Create bookings using the booking form
- View bookings in the bookings list

## File Structure

### Backend
```
Backend/
├── models/
│   ├── User.js
│   ├── Booking.js
│   └── Payment.js
├── controllers/
│   ├── AuthController.js
│   ├── BookingController.js
│   └── UserController.js
├── routes/
│   ├── AuthRoutes.js
│   ├── BookingRoutes.js
│   └── UserRoutes.js
├── middlewares/
│   └── Authenticate.js
├── config/
│   ├── db.js
│   ├── JWT.js
│   └── email.js
├── app.js
├── index.js
└── .env
```

### Frontend
```
Frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── BookingForm.jsx
│   │   └── BookingsList.jsx
│   ├── services/
│   │   ├── apiClient.js (Axios config with interceptors)
│   │   ├── authApi.js
│   │   └── bookingService.js
│   ├── authSlice.js (Redux auth state)
│   ├── bookingSlice.js (Redux booking state)
│   ├── store.js (Redux store)
│   ├── App.jsx
│   └── main.jsx
├── .env
└── package.json
```

## Key Features Implemented

### Backend
✅ User authentication with JWT
✅ Password hashing with bcrypt
✅ Booking management (CRUD operations)
✅ User role-based access (ADMIN/CUSTOMER)
✅ CORS enabled for frontend communication
✅ MongoDB database integration

### Frontend
✅ Redux state management for auth and bookings
✅ Axios with JWT interceptors
✅ Login and Register components
✅ Booking form and list components
✅ Toast notifications
✅ Error handling

## Environment Variables

### Backend (.env)
- `MONGO_URI` - MongoDB connection string
- `PORT` - Server port (default: 4545)
- `JWT_SECRET` - JWT signing secret
- `SMTP_USER` - Email for notifications
- `SMTP_PASS` - Email password/app password
- `NODE_ENV` - Environment (development/production)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:4545)

## Troubleshooting

### Backend won't start
1. Check if MongoDB is running
2. Verify MONGO_URI in .env is correct
3. Check if port 4545 is already in use

### Frontend can't connect to backend
1. Verify backend is running on http://localhost:4545
2. Check .env file has correct VITE_API_URL
3. Check browser console for CORS errors

### MongoDB connection error
1. Ensure MongoDB service is running
2. Verify connection string format
3. Check network connectivity

## Next Steps

- Implement payment processing with Razorpay
- Add email notifications
- Implement property listing functionality
- Add search and filtering
- Implement reviews and ratings
- Add image uploads
