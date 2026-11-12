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
- Public hotel search excludes demo listings by default. `includeDemo=true` is
  honored only when the backend runs with `NODE_ENV=development`.
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

The backend permits the configured Vercel origin and, in development only,
HTTP loopback origins (`localhost`, `127.0.0.1`, or `::1`) on Vite's port.
This accommodates Vite selecting a different port when 5173 is occupied.
Production does not allow loopback origins, even if they are accidentally
included in `CLIENT_URL`. CORS credentials are enabled without a wildcard
origin, and preflight requests allow the API methods and headers used by the
JWT bearer-token and idempotent booking flows.

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

## Hotel inventory and development samples

The Jaipur record in `Backend/scripts/seedDemoHotels.js` is explicitly a
synthetic demo listing, not a verified hotel. Production search excludes it,
so a zero-result Jaipur search does not establish a city-matching failure; it
usually means the production database has no approved, active, non-demo Jaipur
records matching the selected filters. No real listing data is bundled or
fabricated by the frontend.

In local development, set `NODE_ENV=development` in `Backend/.env` and run
`npm run seed:demo-hotels` from `Backend` to add clearly labeled samples. The
seed is idempotent and refuses to run in other environments. Development
search and homepage sections may request those samples; they are marked
`DEMO · NOT A REAL HOTEL`, and the backend prevents demo bookings. Production
listings must be added by an administrator or imported from an authorized
source, then approved and activated in the existing admin hotel manager.

The homepage loads featured, popular, and recently added hotels from
`GET /hotels?country=India`; it does not use seeded or hardcoded hotel-card data.
`GET /hotels` also supports the same paginated filters as the search route.
Hotel cards open `/hotels/:id` (the legacy `/hotel/:id` URL remains supported),
which reloads the listing by MongoDB `_id` and
lets the customer select dates, guest count, rooms, and an embedded room type.
Before checkout, the page calls `GET /hotels/:id/availability`. Checkout puts
the hotel ID and selected details in the `/payment` URL so refresh, browser
history, and direct links can restore the request. It reloads the current
database record with `GET /hotels/:id`; it never fabricates a hotel or resolves
a booking by hotel name.

Checkout calls authenticated `POST /bookings/eligibility` before enabling
payment. The response includes `eligibility.eligible` and structured
`eligibility.reasons`; lookup/transport failures are shown separately and can be
retried. `POST /payments/create-order` repeats hotel, room, date, capacity,
billing-address, and inventory validation, then creates a temporary
`PaymentIntent` that holds inventory for 15 minutes. Its amount is calculated
from current database prices; no `Booking` document is created before payment.
Razorpay order creation is idempotent and can reuse the active reservation.
After the backend verifies the Razorpay signature and confirms the captured
amount, it creates the `Booking` as `CONFIRMED` and `SUCCESS`. If inventory
cannot be honored after capture, the backend initiates a refund and records the
reservation outcome instead of confirming an unavailable stay. Existing
pending bookings created before this change remain readable and can complete
their legacy payment flow. The public `POST /bookings/create` route now returns
409; no simulated payment-success route is exposed.

This application currently models room inventory as a count on a hotel listing;
it has no separate physical Room collection. Where a hotel has embedded
`roomTypes`, checkout requires that subdocument's MongoDB `_id` as `roomTypeId`,
checks both hotel-level and selected room-type inventory/capacity, and charges
the room-type price. Listings with no `roomTypes` continue using hotel-level
inventory.

The admin hotel form uses the existing `/admin/hotels` routes and supports
listing details, address and postal code, coordinates, images, amenities,
embedded room types and inventory, policies, check-in/out times, activation,
and approval. Image uploads require the backend's Cloudinary configuration;
the admin upload endpoint accepts JPEG, PNG, WebP, or GIF files up to 5 MB each.
Existing listings are not replaced by this feature. The public hotel review
endpoint is `GET /reviews/property/:propertyId`; its ratings and reviews are
database-backed, not synthesized.

There is no tax or discount policy configured in the existing application.
Checkout displays the database-calculated room-rate total and does not invent
additional charges or discounts.
The homepage discovery banner and `/deals` route therefore do not advertise
unsupported discounts; `/deals` shows current approved hotel listings and their
database-listed rates. Nearby searches also exclude demo listings.

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
| `paymentIntentId` | Set from payment order response | Set from payment order response |

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
5. **Create payment order and temporary inventory hold:**
   `POST {{baseUrl}}/payments/create-order`, bearer token `{{token}}`,
   header `Idempotency-Key: {{$guid}}`, body:
   ```json
   {
     "propertyId": "{{hotelId}}",
     "roomTypeId": "{{roomTypeId}}",
     "checkInDate": "2026-12-01",
     "checkOutDate": "2026-12-03",
     "numberOfGuests": 2,
     "numberOfRooms": 1,
     "paymentMethod": "RAZORPAY",
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
   amount. Save the returned `paymentIntentId`; the order amount is calculated
   by the backend. `POST /bookings/create` should return 409 and create no
   booking record.
6. **Verify and confirm:** Complete a real Razorpay Test Mode checkout from the
   frontend. The frontend submits `paymentIntentId` and the gateway-returned
   `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to
   `POST {{baseUrl}}/payments/verify`. Do not handcraft a success response or
   signature. A booking is returned only after successful verification and
   must have `bookingStatus: "CONFIRMED"` and `paymentStatus: "SUCCESS"`.
7. **Admin:** use an ADMIN JWT for `GET {{baseUrl}}/admin/dashboard` and
   `GET {{baseUrl}}/admin/bookings`. Create or update listings through
   `/admin/hotels`; upload hotel image files with multipart form data to
   `/admin/hotels/images` using the `image` or `images` field.

Run the same sequence locally and against the deployed URL. In the production
browser's Network tab, verify every API request uses the HTTPS backend domain
and that no request targets `localhost`. The deployed page was inspected during
this fix and its requests currently target `http://localhost:4545/api/v1`;
configure `VITE_API_URL` in Vercel Production and redeploy before expecting
production hotel search or checkout to work. A production API request without
an API URL is rejected by the current frontend client rather than silently
falling back to localhost.
