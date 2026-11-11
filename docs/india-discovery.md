# India destination discovery and hotel inventory

## Existing application structure

FastBooking is a React/Vite client in `Frontend/` and an Express/Mongoose API in
`Backend/`. The existing `Property` model is the stay/hotel listing model; this
feature extends it rather than introducing a duplicate hotel collection.
Existing `Booking` records keep their original property-name fields and can
also reference the new optional `propertyId`. The existing authentication,
favorites, payment, and booking routes remain in place.

The curated destination catalog is in
[`Backend/data/indiaDestinations.js`](../Backend/data/indiaDestinations.js) and
covers destinations in all 28 states and 8 union territories plus requested
international locations and aliases. It is a curated seed, not a complete list
of every settlement worldwide. Configure Google Places for live worldwide
autocomplete beyond the seed. Destination coordinates are approximate
reference points.

## Local setup

Requirements: Node.js 20+, npm, and MongoDB (local or hosted).

```powershell
Copy-Item Backend\.env.example Backend\.env
Copy-Item Frontend\.env.example Frontend\.env
```

Set `MONGO_URI` and a unique long `JWT_SECRET` in `Backend\.env`. To enable live
global autocomplete, configure `GOOGLE_PLACES_API_KEY` on the backend only and
enable Google Places API/billing for that key. To enable admin image upload,
configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
`CLOUDINARY_API_SECRET`. These secrets must never be placed in frontend
variables. Real Razorpay credentials are required only to accept live payments. Gemini is optional;
without `GEMINI_API_KEY`, hotel recommendations fall back to ordinary database
ranking. Keep both `.env` files private and out of source control.

```powershell
Set-Location Backend
npm install
npm run seed:destinations
# Optional development-only sample inventory; do not run in production.
npm run seed:demo-hotels
npm run dev
```

In another terminal:

```powershell
Set-Location Frontend
npm install
npm run dev
```

The API defaults to `http://localhost:4545`; Vite defaults to
`http://localhost:5173`. Configure `Frontend/.env` `VITE_API_URL` if the API is
hosted elsewhere. No new runtime package is needed.

## Destination and listing data

- `npm run seed:destinations` inserts missing curated destination records and
  leaves existing destination records untouched. Re-run it after catalog
  additions; configure Google Places to search outside the curated set.
- `npm run seed:demo-hotels` inserts clearly labeled synthetic demo listings
  for search-interface testing. Their names and descriptions say they are
  demos, the UI labels them, and booking endpoints reject them. Never use these
  values as advertised or verified supply.
- Owners can submit listings at `/list-property` after an administrator assigns
  the `OWNER` role. Submissions are pending approval; edits return the listing
  to pending review.
- An administrator can create or review listings and approve/reject them from
  `/admin`, and manage destinations from `/admin/destinations`.
- The importer below is only a data transport tool. It does not authenticate a
  supplier or establish that a record is accurate. Import only inventory that
  your organization is authorized to use and has checked against its provider.

### Importing authorized inventory

Prepare a UTF-8 JSON array and run:

```powershell
Set-Location Backend
npm run import:verified-hotels -- .\path\to\authorized-listings.json
```

Each record requires `name`, `city`, `state`, `price`, `totalRooms`,
`availableRooms`, `sourceProvider`, and a stable `externalListingId`. Optional
fields include `location`, `streetAddress`, `country` (must be India),
`currency`, `propertyType`, `description`, `images` (HTTP(S) URLs), `amenities`,
`latitude`, `longitude`, `maxGuestsPerRoom`, `rating`, `ratingCount`, and
`ratingSource`, plus `facilities`, `roomTypes`, `category`, check-in/out times,
and `workTripFriendly`. Coordinates must be supplied together. Ratings should only be
included when their source and count are genuine and documented. Each
provider/listing ID pair is upserted, so re-running a provider feed updates its
records rather than creating duplicate records.

Before importing, verify provider permissions, data freshness, pricing and
inventory semantics, image rights, rating provenance, and the supplier's terms.
Availability is only as current as the feed; the application does not claim
real-time provider availability unless a live authorized integration supplies
it. For production integrations, schedule provider syncs and honor rate limits,
deletion/update events, and the provider's source-of-truth rules.
The JSON importer validates record shape and retains provider identifiers, but
does not independently verify providers or mark imported records verified.

Administrators can create/edit listings in `/admin`, import authorized JSON
arrays of up to 500 records, export hotel records as JSON, and upload images
when Cloudinary is configured. The protected admin endpoints are
`POST /admin/hotels/import`, `GET /admin/hotels/export`, and
`POST /admin/hotels/images` (multipart field `image`, maximum 5 MB).
Admin-created/imported records are not marked verified.

## Search and booking APIs

All paths below are relative to `/api/v1`.

| Method and path | Access | Purpose |
|---|---|---|
| `GET /destinations?search=Mumbai%2C%20India&limit=10` | Public | Case-insensitive destination/autocomplete lookup; names, state/country, aliases, and configured Places results |
| `GET /hotels/search?city=Mumbai&checkIn=2030-01-10&checkOut=2030-01-12&guests=2&rooms=1&minPrice=1000&maxPrice=8000&amenities=wifi,parking&propertyType=Hotel&minRating=4&sortBy=rating&page=1&limit=12` | Public | Paginated property search; each optional filter can be omitted |
| `GET /hotels/search` | Public | Search active, approved listings without a destination filter |
| `POST /ai/recommendations` | Public | Rank database search results; falls back to database ranking when Gemini is unavailable |
| `POST /bookings/create` | Authenticated | Create a booking using server-side listing price and locked inventory checks |
| `GET /properties/owner` | Owner | List the signed-in owner's properties |
| `POST /properties/owner` | Owner | Submit a listing for approval |
| `PUT /properties/owner/:id` | Owner | Edit own listing; re-enters approval review |
| `PATCH /properties/owner/:id/status` | Owner | Activate/deactivate own approved listing |
| `DELETE /properties/owner/:id` | Owner | Delete listing, or deactivate when booking history exists |
| `GET /destinations/admin` | Admin | Paginated destination management |
| `POST /destinations`, `PUT /destinations/:id` | Admin | Create/update a destination |
| `PATCH /destinations/:id/status`, `DELETE /destinations/:id` | Admin | Deactivate/reactivate or delete a destination |
| `GET /admin/hotels` | Admin | Search and filter listings, including `approvalStatus=pending` |
| `POST /admin/hotels/import`, `GET /admin/hotels/export` | Admin | Import/export listing JSON |
| `POST /admin/hotels/images` | Admin | Upload a JPEG/PNG/WebP/GIF image through configured Cloudinary |
| `PATCH /admin/hotels/:id/approval` | Admin | Approve/reject a listing |
| `PATCH /admin/users/:id/role` | Admin | Promote/demote a non-admin account between `CUSTOMER` and `OWNER` |

Search query parameters: `destination` (or `city`), `hotelName`, `state`,
`country`, `checkIn`, `checkOut`, `guests`, `rooms`, `minPrice`, `maxPrice`
(or `budget` for the maximum nightly amount), `amenities` (comma-separated),
`propertyType` (or `type`), `minRating`, `workTrip`, `sortBy` (`price`,
`price_desc`, `rating`, or `popularity`), `page`, `limit` (maximum 30), and
`includeDemo`. `currency` may be supplied with a budget; its value must be a
three-letter currency code. Without currency selection, the general search
continues its existing numeric-price behavior. The AI recommendation form
labels its budget in INR and filters to INR listings (plus legacy listings with
no stored currency); it never converts amounts. Dates must be supplied together and must describe a valid
non-past range. Guests, rooms, dates, and budget are validated. With no matches,
the search response contains an empty result page; the UI suggests relaxing
filters. Admin endpoints require the existing authenticated `ADMIN` role.

Booking creation verifies that the listing is active, approved and non-demo,
validates guest/room capacity, rejects stale client prices, and serializes
availability checks using a per-listing lock. Pending, confirmed, and
checked-in reservations consume inventory for overlapping dates; cancelled
reservations do not. Admin status changes that make a booking inventory-active
also perform a locked availability check. Existing legacy bookings without
`propertyId` remain included by matching their property name.
Status updates use compare-and-set behavior to avoid racing a cancellation.
Successful payment callbacks do not resurrect cancelled bookings; if a payment
arrives after cancellation, the payment is recorded and support must arrange any
refund through the payment provider.

## Read-only inventory diagnosis

The recommendation request with `budget: 2` compares the stored numeric nightly
price to `2`; it does not mean ₹2,000 and the backend does not convert it. New
and owner-created properties default to INR, but this diagnosis does not assume
every existing record has the same currency. For a read-only local inventory
summary, run:

```powershell
Set-Location Backend
npm run inventory:inspect
```

The script reports record counts, price ranges grouped by stored currency,
field types, destination groups, and a limited sample of Delhi-related listings.
It does not modify records. Run it only in a trusted local terminal because
the sample includes listing names, locations, and stored amenities. Confirm
that `Backend/.env` points to the intended development or staging database
before running it; never paste credentials or raw output containing private
owner data into a public issue.

For a manual read-only check in `mongosh`:

```powershell
mongosh $env:MONGO_URI --eval 'db.properties.countDocuments({})'
mongosh $env:MONGO_URI --eval 'db.properties.aggregate([{ $match: { $or: [{ city: /delhi/i }, { state: /^delhi$/i }, { location: /delhi/i }] } }, { $project: { name: 1, city: 1, state: 1, location: 1, price: 1, currency: 1, amenities: 1, active: 1, approvalStatus: 1, availableRooms: 1, totalRooms: 1, maxGuestsPerRoom: 1, isDemo: 1 } }, { $limit: 20 }]).toArray()'
```

The recommendation pipeline logs normalized destination, budget and currency,
guest/room/amenity constraints, whether dates are present, match count, duration,
and Gemini ranking outcome in development mode only. It never logs API keys,
tokens, user identity, or full listing documents. Database failures return an
actionable service-unavailable message rather than an empty-match response.

To exercise the recommendation API locally, start the backend, then use
PowerShell:

```powershell
$body = '{"destination":"Delhi","budget":3000,"currency":"INR","guests":2,"rooms":1,"amenities":["wifi"],"preferences":["Quiet","near transit"]}'
Invoke-RestMethod -Uri "http://localhost:4545/api/v1/ai/recommendations" -Method Post -ContentType "application/json" -Body $body
```

Try budget values `2000`, `3000`, and `5000` without changing the currency.
With `budget: 2`, only listings priced at 2 INR/night or less (and legacy
listings with no currency field) qualify. Try no amenity filter and then
`["wifi","parking"]`; every requested amenity is required, with case and
surrounding whitespace ignored. `Delhi`, `delhi`, and ` DELHI ` normalize to
the same destination. Omit both stay dates for general recommendations; when
both are supplied, room availability is checked for those dates. A zero-result
response has `recommendations: []` plus explanatory alternatives; a successful
response has recommendations backed by database listing IDs and an `ai`
availability indicator. Gemini failure with eligible records returns
database-ranked recommendations instead.

## Verification

The automated backend tests cover destination coverage, requested international
destinations and aliases, case/whitespace normalization, city names with a
country suffix, strict destination query constraints, explicit currency and
budget semantics, multiple required amenities, malformed
budget/date/guest input, legacy booking compatibility, room inventory helpers,
owner/admin authorization, and missing Gemini configuration.

```powershell
npm test --prefix Backend
```

Run client lint and production build:

```powershell
npm run lint --prefix Frontend
npm run build --prefix Frontend
```

Manual regression checks still require configured MongoDB and a browser: search
Delhi with `2000`, `3000`, and `5000`; try lowercase and uppercase destination
text; remove amenities and dates separately; test an intentionally tiny budget;
follow a recommendation's “Search stays in this area” action and verify the
existing booking page receives guest/room counts and only dates actually
selected. Also exercise registration/login, hotel search, booking
creation/cancellation, favorites, admin review, and payment in a non-production
environment. No live database inventory, provider feed, or payment workflow is
claimed as tested by the automated unit suite.

Manual API checks after setting up MongoDB and starting the backend:

```powershell
Invoke-RestMethod "http://localhost:4545/api/v1/destinations?search=Mumbai%2C%20India"
Invoke-RestMethod "http://localhost:4545/api/v1/hotels/search?city=Mumbai&checkIn=2026-11-11&checkOut=2026-11-18&guests=4&rooms=1"
Invoke-RestMethod "http://localhost:4545/api/v1/hotels/search?city=London"
```

Repeat destination lookup with `mumbai`, `Mumbai`, and `MUMBAI`; then test
Pune, Nanded, Hyderabad, Delhi, Goa, Dubai, and London. Seeded demo hotels are
available for Mumbai, Pune, Nanded, Hyderabad, Delhi, Goa, Dubai, and London.
They have a conspicuous demo label and booking is disabled. A destination with
no authorized or admin-entered inventory correctly returns an empty hotel
result; seeding a destination never invents hotel supply.

For production, deploy the backend and frontend separately, use managed MongoDB
with backups and network restrictions, set environment variables in the hosting
provider's secret manager, use HTTPS and production Razorpay credentials, and
point `VITE_API_URL` to the backend. Run destination seeds as a controlled
deployment operation. Do not seed demo listings in production. Restrict
administrative credentials, monitor provider imports and inventory freshness,
and verify payment/webhook configuration independently before accepting
payments. A deployed destination catalog does not mean hotels or live
availability exist for every destination.

### Vercel frontend and hosted backend

1. Deploy `Backend/` to a Node.js host (for example Render, Railway, or Fly.io)
   with `Backend` as the service root and `node index.js` as the start command.
   Configure `MONGO_URI`, `JWT_SECRET`, `PORT` (if required by the host),
   `CLIENT_URL`, and any payment/AI/provider keys in that host's secret manager.
   Configure `GOOGLE_PLACES_API_KEY` and Cloudinary keys only if those services
   are enabled. Do not commit `.env` files.
2. Configure MongoDB network access for the backend host and use a production
   database with backups. Run `npm run seed:destinations` from a controlled
   backend deployment/release task. Do not run `seed:demo-hotels` in production.
3. Import the existing `Frontend/` directory into Vercel with `Frontend` as the
   project root, build command `npm run build`, and output directory `dist`.
   Set `VITE_API_URL` to the public HTTPS backend origin, without a trailing
   path. Vite variables are public; never put Google, Cloudinary, MongoDB, JWT,
   or payment secrets in `VITE_*` variables.
4. Set the backend's `CLIENT_URL` to the deployed frontend origin, verify its
   CORS policy for that origin, and test destination search, hotel listing,
   authentication, booking, payments, image upload, and admin routes on the
   deployed environment before launch.
