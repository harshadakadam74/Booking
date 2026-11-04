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
- Node.js (v20 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Backend Setup
```bash
cd Backend
npm install
# Configure .env with existing MongoDB/JWT/payment settings and GEMINI_API_KEY
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
- **[India discovery and inventory](./docs/india-discovery.md)** - Destination catalog, listings, search APIs, owner/admin workflows, tests, and deployment notes

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
- Role-based access control (ADMIN/OWNER/CUSTOMER)

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
RAZORPAY_KEY_ID=rzp_test_replace_me
RAZORPAY_KEY_SECRET=replace_with_razorpay_test_secret
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:4545
```

Copy `Backend/.env.example` to `Backend/.env` and `Frontend/.env.example` to
`Frontend/.env` before starting the applications. Replace `JWT_SECRET` and
the SMTP values with real deployment credentials; never commit either `.env`
file.

### Gemini AI setup

The Gemini SDK is used only by the backend. Set `GEMINI_API_KEY` and, optionally,
`GEMINI_MODEL` (defaults to `gemini-3.6-flash`) in `Backend/.env`. Keep the key
out of frontend environment variables and source control. Restart the backend
after changing these values. Chat, trip planning, and review summaries require
Gemini; hotel recommendations use database-ranked results when Gemini is not
configured or unavailable. Admin booking statistics remain available if only
the AI insights request fails.

The `/ai-assistant` page provides multilingual travel chat, database-backed
hotel recommendations, trip planning, and review summaries on recommended hotel
cards. Hotel recommendations only rank active, approved `Property` documents
from MongoDB; database ranking remains available without Gemini. Review
summaries use up to the latest 50 property-linked reviews.

### AI API

All routes are mounted under `/api/v1/ai` and share an in-memory limit of 30
requests per IP per 15 minutes. Chat, recommendations, trip planning, and review
summaries are public; admin overview requires the existing Bearer JWT and
`ADMIN` role.

| Method and path | Request | Response |
|---|---|---|
| `POST /chat` | `{ "messages": [{ "role": "user", "content": "..." }] }` | `{ "answer": "..." }` |
| `POST /recommendations` | `{ "destination": "Pune", "budget": 5000, "guests": 2, "amenities": ["wifi"], "preferences": ["quiet"] }` | `{ "recommendations": [{ "property": { "_id": "...", "name": "...", "price": 3000 }, "reason": "..." }], "limitations": "..." }` |
| `POST /plan-trip` | `{ "destination": "Pune", "days": 2, "budget": 10000, "interests": ["food"], "language": "English" }` | `{ "itinerary": { "title": "...", "days": [{ "day": 1, "activities": [], "budgetTip": "..." }] }, "notice": "..." }` |
| `GET /reviews/:hotelId/summary` | No body | `{ "hotelId": "...", "reviewCount": 4, "summary": { "overview": "...", "positive": [], "complaints": [] } }` |
| `GET /admin/overview` | Bearer JWT, `ADMIN` only | `{ "metrics": { "totalBookings": 0, "paidRevenue": 0, "monthlyTrends": [] }, "ai": { "available": true, "insights": [], "limitations": "..." } }` |

Recommendation `budget` is a maximum nightly price in the property's stored
units. Hotel search checks stored room capacity and overlapping active
reservations, but provider inventory can be stale; final availability and
pricing are rechecked when a booking is created. Trip plans and review
summaries are AI-generated and should be treated as suggestions, not
independently verified facts.

### Admin login and management

Open `/admin/login` and sign in with the existing account credentials. Only a
user whose database role is `ADMIN` can use `/admin`; customers are redirected
to `/account`. The backend independently applies the existing JWT
authentication and `ADMIN` authorization middleware to every admin API.
Public registration and profile updates cannot assign a role.

To bootstrap the first administrator, first register the account normally,
then use a trusted MongoDB administrative connection to promote that account:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "ADMIN" } }
)
```

Verify the matched account before proceeding. Once signed in, an administrator
can create additional admin accounts in the dashboard. Never expose database
credentials in the frontend.

Admin API routes are mounted under `/api/v1/admin` and require a bearer token
for an `ADMIN` user:

| Method and path | Purpose |
|---|---|
| `GET /dashboard` | Live user, hotel, booking, and recorded paid-revenue metrics, plus recent activity |
| `GET /hotels?page=1&limit=20&search=Pune&status=active` | Search/filter and paginate hotels |
| `POST /hotels` | Create a property using the existing `Property` schema |
| `PUT /hotels/:id` | Update supported property fields |
| `PATCH /hotels/:id/status` | Set `{ "active": true }` or `{ "active": false }` |
| `DELETE /hotels/:id` | Delete only when no booking history exists; otherwise deactivate |
| `GET /bookings?page=1&limit=20&status=PENDING&from=2025-01-01&to=2025-12-31&search=Pune` | Search and filter booking records |
| `PATCH /bookings/:id/status` | Set a valid `bookingStatus`; payment records are unchanged |
| `GET /users?page=1&limit=20&search=admin@example.com` | Search users without returning password fields |
| `POST /users` | Create an admin account (admin-only) |

List responses include their records and `{ "pagination": { "page", "limit",
"total", "pages" } }`. The existing schemas do not support hotel approval
states or user activation, so those controls are intentionally not fabricated.
Booking detail payment fields are read-only; the dashboard never processes
refunds or changes payment status. Hotel location and prices are stored in the
existing schema's fields/units, and room counts are inventory snapshots rather
than date-specific availability guarantees.

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