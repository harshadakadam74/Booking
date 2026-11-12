# Production API setup

## What this repository confirms

- The Express API mounts bookings at `/api/v1/bookings`, and
  `POST /api/v1/bookings/create` is an existing route.
- Hotel APIs are mounted at `/api/v1/hotels` and `/api/v1/properties`.
- `GET /api/v1/hotels` and `GET /api/v1/hotels/` list approved, active,
  non-demo database listings with pagination and filters. `sortBy=newest`
  orders by database creation time.
- `GET /api/v1/hotels/:id` looks up a hotel by its MongoDB `_id`; malformed IDs
  return 400, missing records return 404, and database failures return 500.
- `GET /api/v1/hotels/:id/availability` checks a hotel's current status, room,
  dates, guest capacity, inventory, and server-calculated price.
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

The homepage loads featured, popular, and recently added hotels from
`GET /hotels?country=India`; it does not use seeded or hardcoded hotel-card data.
`GET /hotels` also supports the same paginated filters as the search route.
Hotel cards open `/hotel/:id`, which reloads the listing by MongoDB `_id` and
lets the customer select dates, guest count, rooms, and an embedded room type.
Before checkout, the page calls `GET /hotels/:id/availability`. Checkout puts
the hotel ID and selected details in the `/payment` URL so refresh, browser
history, and direct links can restore the request. It reloads the current
database record with `GET /hotels/:id`; it never fabricates a hotel or resolves
a booking by hotel name.

Checkout calls authenticated `POST /bookings/eligibility` before enabling
payment. The response includes `eligibility.eligible` and structured
`eligibility.reasons`; lookup/transport failures are shown separately and can be
retried. Booking creation repeats its own validation, validates the billing
address, locks hotel inventory, calculates the amount from the database, and
creates a pending booking. Payment orders are created from that server amount,
re-used for retries, and payment completion is accepted only after Razorpay
signature and captured-payment details are checked by the backend. The success
page requires a backend booking with both `bookingStatus: "CONFIRMED"` and
`paymentStatus: "SUCCESS"`. No simulated payment-success route is exposed.
Booking requests carry an idempotency key.

This application currently models room inventory as a count on a hotel listing;
it has no separate physical Room collection. Where a hotel has embedded
`roomTypes`, checkout requires that subdocument's MongoDB `_id` as `roomTypeId`,
checks both hotel-level and selected room-type inventory/capacity, and charges
the room-type price. Listings with no `roomTypes` continue using hotel-level
inventory.

There is no tax or discount policy configured in the existing application.
Checkout displays the database-calculated room-rate total and does not invent
additional charges or discounts.

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
2. **Hotels:** `GET {{baseUrl}}/hotels` (or `/hotels/`) lists active, approved,
   non-demo hotels without a destination. Use `page`, `limit`, `country`,
   `propertyType`, `minPrice`, `maxPrice`, or `sortBy` to filter and paginate.
   `sortBy=newest` shows recently added listings. For a destination search use
   `GET {{baseUrl}}/hotels/search?destination=Pune&checkIn=2026-12-01&checkOut=2026-12-03&guests=2&rooms=1`.
   Replace the dates with future dates. Copy `hotelId` from a returned hotel's
   `_id` and `roomTypeId` from that same hotel's `roomTypes[]._id`.
   Then request `GET {{baseUrl}}/hotels/{{hotelId}}`. Expect HTTP 200 and a
   `property` object with the matching `_id`. A malformed `id` must return 400;
   a valid but deleted ID must return 404. A database failure returns 500.
   Check availability with
   `GET {{baseUrl}}/hotels/{{hotelId}}/availability?checkIn=2026-12-01&checkOut=2026-12-03&guests=2&rooms=1&roomTypeId={{roomTypeId}}`.
   Continue only if the response's `eligibility.eligible` is `true`.
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
   A malformed hotel ID returns 400 and a deleted hotel returns 404.
5. **Create booking:** `POST {{baseUrl}}/bookings/create`, bearer token
   `{{token}}`, header `Idempotency-Key: {{$guid}}`, and the eligibility JSON
   plus a billing address, for example:
   ```json
   {
     "propertyId": "{{hotelId}}",
     "roomTypeId": "{{roomTypeId}}",
     "checkInDate": "2026-12-01",
     "checkOutDate": "2026-12-03",
     "numberOfGuests": 2,
     "numberOfRooms": 1,
     "billingAddress": {
       "address": "12 Example Road",
       "city": "Nanded",
       "state": "Maharashtra",
       "zipCode": "431600",
       "country": "IN"
     }
   }
   ```
   Use future dates and a valid current hotel/room. Omit `roomTypeId` only for
   listings that have no embedded room types. Do not send an authoritative
   amount. Save `booking._id` as `bookingId`; its status must be `PENDING`.
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
and that no request targets `localhost`. The deployed page was inspected during
this fix and its requests currently target `http://localhost:4545/api/v1`;
configure `VITE_API_URL` in Vercel Production and redeploy before expecting
production hotel search or checkout to work. A production API request without
an API URL is rejected by the current frontend client rather than silently
falling back to localhost.
