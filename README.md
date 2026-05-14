# Booking System - Full Stack Application

A complete booking system built with Node.js/Express backend and React/Vite frontend. This project demonstrates full-stack development with user authentication, booking management, and payment integration capabilities.

## 🎯 Project Overview

This is a production-ready booking platform with:
- **Backend**: Express.js API with MongoDB database
- **Frontend**: React with Redux state management
- **Authentication**: JWT-based user authentication
- **Booking Management**: Complete CRUD operations for property bookings
- **Payment Ready**: Razorpay integration support

## 📦 Tech Stack

### Backend
- **Runtime**: Node.js with Express 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) with bcrypt hashing
- **Additional**: CORS, Multer, Nodemailer, Razorpay

### Frontend
- **Framework**: React 18.3
- **Build Tool**: Vite 7.x
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios with interceptors
- **Styling**: Tailwind CSS 4.x
- **Notifications**: React-Toastify
- **Routing**: React Router 6.x

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Backend Setup
```bash
cd Backend
npm install
# Configure .env file with your MongoDB URI and JWT secret
npm run dev
```
Backend runs on `http://localhost:4545`

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

## 📖 Documentation

- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Complete setup and testing guide
- **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - Implementation summary and checklist

## 🏗️ Architecture

### Backend Structure
```
Backend/
├── models/          # Mongoose schemas (User, Booking, Payment)
├── controllers/     # Request handlers (Auth, Booking, User)
├── routes/          # API endpoints
├── middlewares/     # Authentication, error handling
├── services/        # Business logic
├── config/          # Database, JWT, email, payment configs
├── app.js           # Express app setup
└── index.js         # Server entry point
```

### Frontend Structure
```
Frontend/src/
├── services/        # API clients (axios, auth, booking)
├── components/      # Reusable UI components
├── Pages/           # Page components
├── assets/          # Images, fonts
├── store.js         # Redux store configuration
├── authSlice.js     # Redux auth state
├── bookingSlice.js  # Redux booking state
├── main.jsx         # App entry point
└── App.jsx          # Main app component
```

## 🔑 Key Features

### Authentication
- User registration with validation
- Secure login with JWT tokens
- Password reset functionality
- Role-based access control (ADMIN/CUSTOMER)

### Booking Management
- Create new bookings with automatic price calculation
- View all user bookings
- Update booking details (for pending bookings)
- Cancel bookings with refund tracking
- Admin view all bookings

### API Integration
- RESTful API design
- JWT authentication middleware
- CORS enabled for frontend communication
- Comprehensive error handling
- Request/response validation

### Frontend Features
- Redux state management
- Axios interceptors for JWT token handling
- Loading states and error notifications
- Toast notifications for user feedback
- Responsive design with Tailwind CSS

## 📋 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - New user registration
- `POST /login` - User login
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset

### User (`/api/v1/user`)
- `GET /profile` - Get user profile (protected)

### Bookings (`/api/v1/bookings`)
- `POST /create` - Create booking (protected)
- `GET /my-bookings` - Get user's bookings (protected)
- `GET /:bookingId` - Get booking details (protected)
- `PUT /:bookingId` - Update booking (protected)
- `POST /:bookingId/cancel` - Cancel booking (protected)
- `GET /admin/all-bookings` - Get all bookings (admin only)

## 🔐 Security

- Passwords hashed with bcrypt
- JWT token-based authentication
- CORS protection
- Request validation
- Authorization checks on protected routes
- Automatic token refresh on expiry (frontend)

## 🧪 Testing

Follow the testing guide in [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) to:
1. Test backend API endpoints
2. Register and login users
3. Create and manage bookings
4. Verify frontend integration

## 📝 Environment Configuration

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/booking
PORT=4545
JWT_SECRET=your_secret_key_here
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:4545
```

## 🎨 UI Components

- **Login**: User authentication form
- **Register**: New user registration form
- **BookingForm**: Create new bookings
- **BookingsList**: Display user bookings with status
- **Header**: Navigation and user menu
- **Footer**: Footer with links

## 🔄 Data Flow

1. **User Registration/Login**
   - Frontend sends credentials → Backend validates → JWT token generated
   - Token stored in localStorage → Added to all subsequent API requests

2. **Create Booking**
   - User fills form → Redux action dispatched → API call sent
   - Backend saves to MongoDB → Response returned → Redux state updated

3. **View Bookings**
   - Component mounts → Redux action triggers API call
   - Bookings fetched from MongoDB → State updated → Rendered on UI

## 📚 Database Schema

### User Collection
- name, email, mobile, password (hashed)
- role (CUSTOMER/ADMIN), photo
- resetPasswordToken, resetPasswordExpires
- createdAt timestamp

### Booking Collection
- user (FK), property name
- checkInDate, checkOutDate
- numberOfGuests, numberOfRooms
- pricePerNight, totalPrice, numberOfNights
- bookingStatus, paymentStatus
- paymentDetails, specialRequests
- cancellationReason, cancellationDate
- createdAt, updatedAt timestamps

## 🚢 Deployment

### Backend (Heroku/Railway/Render)
1. Push code to repository
2. Set environment variables in deployment platform
3. Deploy using platform's CLI or GitHub integration
4. Update VITE_API_URL in frontend for production

### Frontend (Vercel/Netlify)
1. Connect repository to Vercel/Netlify
2. Set VITE_API_URL to production backend URL
3. Deploy automatically on push

## 🐛 Troubleshooting

**Backend won't start**: Check MongoDB connection and port 4545 availability
**Frontend can't reach API**: Verify VITE_API_URL and backend is running
**Login fails**: Check JWT_SECRET in backend .env
**Bookings not saving**: Verify MongoDB is running and connected

## 📦 Available Scripts

### Backend
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests (not implemented yet)
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Mongoose](https://mongoosejs.com/)
- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Axios](https://axios-http.com/)

## 📄 License

ISC

## 👥 Contributing

This project is maintained by Harshada Kadam. For contributions, please submit pull requests.

## 📞 Support

For setup issues, refer to INTEGRATION_GUIDE.md or SETUP_COMPLETE.md for detailed troubleshooting.

---

**Status**: ✅ Production Ready