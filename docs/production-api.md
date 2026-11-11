# Production API setup

## What this repository confirms

- The Express API mounts bookings at `/api/v1/bookings`, and
  `POST /api/v1/bookings/create` is an existing route.
- Hotel APIs are mounted at `/api/v1/hotels` and `/api/v1/properties`.
- The repository has a Vercel static-frontend configuration, but no backend
  hosting configuration or deployed backend domain. Do not substitute a guessed
  production URL.
- The frontend URL reported in production (`localhost:4545`) is the development
  fallback. Vite embeds `VITE_API_URL` at build time; Vercel must have the
  production variable set and the frontend must be redeployed.

## Deploy the backend first

1. Provision a MongoDB database accessible from the backend host. Use its
   connection string as `MONGO_URI`; never put it in a frontend variable.
2. Deploy the existing `Backend` directory as a Node service (for example,
   Render or Railway). Set the service root to `Backend`, install with
   `npm install`, and use `npm start` as the start command. The service listens
   on the host-provided `PORT` and waits for MongoDB before accepting requests.
3. Configure these backend variables in the hosting dashboard:
   - `NODE_ENV=production`
   - `MONGO_URI` — production MongoDB connection string
   - `JWT_SECRET` — long, random private signing key
   - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` — matching gateway credentials;
     keep the secret private
   - `CLIENT_URL=https://booking-l2vm.vercel.app`
     (add any exact additional origins as comma-separated values)
   - `FRONTEND_URL=https://booking-l2vm.vercel.app` for password-reset links
   - `GEMINI_API_KEY`, SMTP, and Cloudinary credentials only if those features
     are enabled
4. Deploy and confirm `https://YOUR-DEPLOYED-BACKEND-DOMAIN/api/v1/health`
   returns HTTP 200 with `{"status":"ok","database":"connected"}`. This
   repository does not contain the deployed domain; use the URL assigned by the
   backend host.

The backend permits the configured Vercel origin and local Vite origins. It
does not use wildcard origins with credentials. JWT bearer tokens remain the
authentication mechanism; Axios also sends credentials for any existing
cookie-based integrations.

## Configure Vercel

In the Vercel project for `booking-l2vm`:

1. Open **Settings → Environment Variables**.
2. Add `VITE_API_URL` with the actual backend URL and version prefix, for example
   `https://YOUR-DEPLOYED-BACKEND-DOMAIN/api/v1`. Do not use the example domain
   literally.
3. Apply it to **Production** (and Preview/Development if needed).
4. Redeploy the frontend. `VITE_API_URL` is a public build-time URL, not a
   secret. Never put MongoDB, JWT, Razorpay secret, Gemini, SMTP, or Cloudinary
   secrets in a `VITE_` variable.

For local development, copy `Frontend/.env.example` to `Frontend/.env`; it
defaults to `http://localhost:4545/api/v1`. Copy `Backend/.env.example` to
`Backend/.env` and use local development credentials.

## Booking and payment behavior

Checkout calls authenticated `POST /bookings/eligibility` before enabling
payment. The response includes `eligibility.eligible` and structured
`eligibility.reasons`. Booking creation repeats its own validation, locks hotel
inventory, calculates the amount from the database, and creates a pending
booking. Payment orders are created from that server amount, re-used for
retries, and payment completion is accepted only after Razorpay signature and
captured-payment details are checked by the backend. Booking requests carry an
idempotency key.

This application currently models room inventory as a count on a hotel listing;
it has no separate physical Room collection. Where a hotel has embedded
`roomTypes`, checkout requires that subdocument's MongoDB `_id` as `roomTypeId`,
checks both hotel-level and selected room-type inventory/capacity, and charges
the room-type price. Listings with no `roomTypes` continue using hotel-level
inventory.

Card number, expiry, and CVV fields are not collected by FastBooking. They are
entered in Razorpay Checkout. The development-only dummy payment route is
disabled outside development.

## Postman smoke tests

Create a Postman environment with:

| Variable | Local value | Production value |
|---|---|---|
| `baseUrl` | `http://localhost:4545/api/v1` | `https://YOUR-DEPLOYED-BACKEND-DOMAIN/api/v1` |
| `token` | Set after login | Set after login |
| `hotelId` | A real approved MongoDB hotel ID | A real approved production hotel ID |
| `roomTypeId` | An embedded room-type `_id` for that hotel | An embedded room-type `_id` for that hotel |
| `bookingId` | Set from booking response | Set from booking response |

1. **Health:** `GET {{baseUrl}}/health`. Expect HTTP 200 and a connected database.
2. **Hotels:** `GET {{baseUrl}}/hotels`; for search use
   `GET {{baseUrl}}/hotels/search?destination=Pune&checkIn=2026-12-01&checkOut=2026-12-03&guests=2&rooms=1`.
   Replace the dates with future dates. Copy `hotelId` from a returned hotel's
   `_id` and `roomTypeId` from that same hotel's `roomTypes[]._id`.
3. **Login:** `POST {{baseUrl}}/auth/login` with the existing login JSON. Save
   the returned JWT as `token`.
4. **Eligibility:** `POST {{baseUrl}}/bookings/eligibility`, bearer token
   `{{token}}`, JSON body:
   ```json
   {
     "propertyId": "{{hotelId}}",
     "roomTypeId": "{{roomTypeId}}",
     "checkInDate": "2026-12-01",
     "checkOutDate": "2026-12-03",
     "numberOfGuests": 2,
     "numberOfRooms": 1
   }
   ```
   Continue only if `eligibility.eligible` is `true`.
5. **Create booking:** `POST {{baseUrl}}/bookings/create`, bearer token
   `{{token}}`, header `Idempotency-Key: {{$guid}}`, and the same JSON plus
   optional guest information. Omit `roomTypeId` only for listings that have
   no embedded room types. Do not send an authoritative amount. Save
   `booking._id` as `bookingId`; its status must be `PENDING`.
6. **Create payment order:** `POST {{baseUrl}}/payments/create-order`,
   bearer token, body `{"bookingId":"{{bookingId}}","paymentMethod":"RAZORPAY"}`.
   The amount in the returned gateway order is calculated from the booking.
7. **Verify and confirm:** Complete a real Razorpay Test Mode checkout from the
   frontend. The frontend submits the gateway-returned
   `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to
   `POST {{baseUrl}}/payments/verify`. Do not handcraft a success response or
   signature. Confirm the returned booking is `CONFIRMED` only after successful
   verification.
8. **Admin:** use an ADMIN JWT for `GET {{baseUrl}}/admin/dashboard` and
   `GET {{baseUrl}}/admin/bookings`.

Run the same sequence locally and against the deployed URL. In the production
browser's Network tab, verify every API request uses the HTTPS backend domain
and that no request targets `localhost`. A production API request without an
API URL is rejected by the frontend client rather than silently falling back
to localhost.
