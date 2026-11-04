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
covers all 28 states and 8 union territories. It is intentionally a starter
dataset, not a hotel inventory, and can be extended with administrative
destination CRUD. Destination coordinates are approximate reference points.

## Local setup

Requirements: Node.js 20+, npm, and MongoDB (local or hosted).

```powershell
Copy-Item Backend\.env.example Backend\.env
Copy-Item Frontend\.env.example Frontend\.env
```

Set `MONGO_URI` and a unique long `JWT_SECRET` in `Backend\.env`. Real Razorpay
credentials are required only to accept live payments. Gemini is optional;
without `GEMINI_API_KEY`, hotel recommendations fall back to ordinary database
ranking. Keep both `.env` files private and out of source control.

```powershell
Set-Location Backend
npm install
npm run seed:destinations
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
  leaves existing destination records untouched.
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
`ratingSource`. Coordinates must be supplied together. Ratings should only be
included when their source and count are genuine and documented. Each
provider/listing ID pair is upserted, so re-running a provider feed updates its
records rather than creating duplicate records.

Before importing, verify provider permissions, data freshness, pricing and
inventory semantics, image rights, rating provenance, and the supplier's terms.
Availability is only as current as the feed; the application does not claim
real-time provider availability unless a live authorized integration supplies
it. For production integrations, schedule provider syncs and honor rate limits,
deletion/update events, and the provider's source-of-truth rules.

## Search and booking APIs

All paths below are relative to `/api/v1`.

| Method and path | Access | Purpose |
|---|---|---|
| `GET /destinations?search=bangalore&limit=10` | Public | Case-insensitive destination/autocomplete lookup, aliases included |
| `GET /hotels/search?destination=Jaipur&checkIn=2030-01-10&checkOut=2030-01-12&guests=2&rooms=1&budget=8000&amenities=wifi,parking&propertyType=Hotel&minRating=4&page=1&limit=12` | Public | Paginated property search; each optional filter can be omitted |
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
| `PATCH /admin/hotels/:id/approval` | Admin | Approve/reject a listing |
| `PATCH /admin/users/:id/role` | Admin | Promote/demote a non-admin account between `CUSTOMER` and `OWNER` |

Search query parameters: `destination`, `checkIn`, `checkOut`, `guests`,
`rooms`, `budget` (maximum nightly amount), `amenities` (comma-separated),
`propertyType` (or `type`), `minRating`, `page`, `limit` (maximum 30), and
`includeDemo`. Dates must be supplied together and must describe a valid
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

## Verification

Backend tests include destination coverage and aliases, search input/filter
normalization, room-capacity calculations, invalid booking dates, and owner
role middleware:

```powershell
Set-Location Backend
npm test
```

Run client lint and production build:

```powershell
Set-Location Frontend
npm run lint
npm run build
```

For production, deploy the backend and frontend separately, use managed MongoDB
with backups and network restrictions, set environment variables in the hosting
provider's secret manager, use HTTPS and production Razorpay credentials, and
point `VITE_API_URL` to the backend. Run destination seeds as a controlled
deployment operation. Do not seed demo listings in production. Restrict
administrative credentials, monitor provider imports and inventory freshness,
and verify payment/webhook configuration independently before accepting
payments. A deployed destination catalog does not mean hotels or live
availability exist for every destination.
