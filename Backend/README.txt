FASTBOOKING INDIA DATASET

Contents:
- hotels.json and hotels.csv: 150 sample hotel records
- places.json and places.csv: 109 Indian destinations
- seedFastBooking.js: repeatable seed script using your existing Property model

IMPORTANT DATA NOTICE
All hotel records are clearly labelled DEMO ONLY (isDemo=true, listingSource=demo).
Hotel names, addresses, prices, room counts, amenities and availability are sample values,
not verified real-world hotel offers. Images and contact details are blank intentionally.
Do not accept customer bookings or payments against these records until you replace them
with verified property data, images, policies, room inventory and owner authorization.

Place coordinates are approximate destination/city-centre coordinates, not hotel coordinates.
Place data is standalone JSON/CSV. Your supplied Property model is for hotels; places need
a Destination/Place model or can be loaded directly by your frontend.

INSTALL HOTEL DATA
1. Copy hotels.json to Backend/data/hotels.json
2. Copy seedFastBooking.js to Backend/scripts/seedFastBooking.js
3. Check the model import path ../models/Property matches your project.
4. Check Backend/.env has MONGO_URI or MONGODB_URI.
5. From Backend run: node scripts/seedFastBooking.js
6. Restart backend and verify your actual public hotel-list API.

CSV is for spreadsheet editing. The included seed script reads JSON, not CSV.
