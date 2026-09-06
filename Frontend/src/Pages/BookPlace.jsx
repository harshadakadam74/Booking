import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Heart,
  MapPin,
  Sparkles,
  Star,
  SlidersHorizontal,
  Utensils,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  Flame,
  CookingPot,
  Bath,
} from "lucide-react";

/* =========================================================
   PROPERTY DATA
========================================================= */

const baseProperties = [
  {
    id: 1,
    name: "Luxury Downtown Hotel",
    location: "New York, USA",
    rating: 4.8,
    reviews: 1250,
    price: 250,
    originalPrice: 320,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant", "pool", "gym"],
    type: "Hotel",
    description:
      "Modern luxury hotel in the heart of downtown with beautiful skyline views.",
    highlight: "Free cancellation and breakfast included",
    perks: [
      "Free cancellation",
      "Breakfast included",
      "Airport shuttle",
    ],
  },
  {
    id: 2,
    name: "Cozy Boutique Hotel",
    location: "New York, USA",
    rating: 4.6,
    reviews: 890,
    price: 180,
    originalPrice: 230,
    image:
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop",
    amenities: ["wifi", "restaurant", "spa"],
    type: "Hotel",
    description:
      "Charming boutique hotel with personalized service and local charm.",
    highlight: "Best for romantic weekend escapes",
    perks: ["Late checkout", "Wellness access", "City guide"],
  },
  {
    id: 3,
    name: "City Center Apartment",
    location: "New York, USA",
    rating: 4.4,
    reviews: 650,
    price: 150,
    originalPrice: 190,
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "kitchen"],
    type: "Apartment",
    description:
      "Spacious apartment with boutique interiors and a fully equipped kitchen.",
    highlight: "Great for longer stays and families",
    perks: ["Laundry access", "Full kitchen", "Self check-in"],
  },
  {
    id: 4,
    name: "Executive Suite",
    location: "New York, USA",
    rating: 4.7,
    reviews: 420,
    price: 300,
    originalPrice: 380,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant", "gym", "spa"],
    type: "Hotel",
    description:
      "Executive suite with premium amenities and a business-friendly setup.",
    highlight: "Ideal for business trips and premium comfort",
    perks: ["Workspace", "Concierge", "Priority check-in"],
  },
  {
    id: 5,
    name: "Beachfront Resort",
    location: "Miami, USA",
    rating: 4.9,
    reviews: 2100,
    price: 350,
    originalPrice: 450,
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant", "pool", "beach"],
    type: "Resort",
    description:
      "Luxurious beachfront resort with ocean views and full-service amenities.",
    highlight: "Top-rated escape with oceanfront lounging",
    perks: ["Beach access", "Spa pass", "Ocean views"],
  },
  {
    id: 6,
    name: "Mountain View Cabin",
    location: "Aspen, USA",
    rating: 4.5,
    reviews: 380,
    price: 220,
    originalPrice: 280,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "kitchen", "fireplace"],
    type: "Cabin",
    description:
      "Cozy mountain cabin with stunning views and fireplace evenings.",
    highlight: "Perfect for ski weekends and nature retreats",
    perks: ["Fireplace", "Mountain views", "Pet friendly"],
  },
  {
    id: 7,
    name: "Deccan Pearl Hotel",
    location: "Hyderabad, India",
    rating: 4.7,
    reviews: 845,
    price: 95,
    originalPrice: 125,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant", "pool", "gym"],
    type: "Hotel",
    description:
      "Contemporary stay near Hyderabad's historic landmarks and business districts.",
    highlight: "Central location with breakfast included",
    perks: ["Breakfast included", "Airport transfer", "City guide"],
  },
  {
    id: 8,
    name: "Lake View Residency",
    location: "Bhopal, India",
    rating: 4.5,
    reviews: 412,
    price: 68,
    originalPrice: 90,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant"],
    type: "Hotel",
    description:
      "Relaxed lakeside accommodation with easy access to Bhopal's cultural sights.",
    highlight: "Peaceful stay by Upper Lake",
    perks: ["Lake views", "Breakfast included", "Free parking"],
  },
  {
    id: 9,
    name: "Marine Drive Grand",
    location: "Mumbai, India",
    rating: 4.8,
    reviews: 1640,
    price: 180,
    originalPrice: 230,
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant", "pool", "gym", "spa"],
    type: "Hotel",
    description:
      "Stylish city hotel with quick access to Marine Drive, dining, and shopping.",
    highlight: "Premium rooms in South Mumbai",
    perks: ["Sea views", "Rooftop pool", "24-hour concierge"],
  },
  {
    id: 10,
    name: "Sabarmati Heritage Hotel",
    location: "Ahmedabad, India",
    rating: 4.6,
    reviews: 635,
    price: 78,
    originalPrice: 105,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant", "gym"],
    type: "Hotel",
    description:
      "Comfortable heritage-inspired hotel close to Ahmedabad's old city and riverfront.",
    highlight: "A convenient base for heritage walks",
    perks: ["Breakfast included", "Local tours", "Business center"],
  },
  {
    id: 11,
    name: "The Pink City Palace",
    location: "Jaipur, India",
    rating: 4.8,
    reviews: 1280,
    price: 115,
    originalPrice: 150,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant", "pool", "spa"],
    type: "Hotel",
    description:
      "Elegant Jaipur retreat with traditional design and modern comforts.",
    highlight: "Royal hospitality near the city palace",
    perks: ["Heritage rooms", "Pool access", "Cultural performances"],
  },
  {
    id: 12,
    name: "Taj View Retreat",
    location: "Agra, India",
    rating: 4.7,
    reviews: 972,
    price: 88,
    originalPrice: 120,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant", "pool"],
    type: "Hotel",
    description:
      "A welcoming stay near the Taj Mahal with comfortable rooms and local dining.",
    highlight: "Ideal for Taj Mahal sunrise visits",
    perks: ["Taj transfers", "Breakfast included", "Tour desk"],
  },
  {
    id: 13,
    name: "Ganges Riverside Inn",
    location: "Varanasi, India",
    rating: 4.5,
    reviews: 704,
    price: 62,
    originalPrice: 84,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
    amenities: ["wifi", "restaurant"],
    type: "Hotel",
    description:
      "A calm riverside base for exploring Varanasi's ghats and ancient lanes.",
    highlight: "Close to the evening Ganga Aarti",
    perks: ["River views", "Boat tour booking", "Breakfast included"],
  },
  {
    id: 14,
    name: "Awadh Courtyard Hotel",
    location: "Lucknow, India",
    rating: 4.6,
    reviews: 528,
    price: 74,
    originalPrice: 98,
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant", "gym"],
    type: "Hotel",
    description:
      "Polished city stay near Lucknow's historic monuments and famous food streets.",
    highlight: "Comfortable rooms in the heart of Awadh",
    perks: ["Local cuisine", "Airport transfer", "Free parking"],
  },
  {
    id: 15,
    name: "Capital Heights Hotel",
    location: "New Delhi, India",
    rating: 4.8,
    reviews: 1895,
    price: 130,
    originalPrice: 175,
    image:
      "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant", "pool", "gym", "spa"],
    type: "Hotel",
    description:
      "Modern capital-city hotel with easy metro access and premium amenities.",
    highlight: "Well connected for business and sightseeing",
    perks: ["Metro access", "Breakfast included", "Business lounge"],
  },
  {
    id: 16,
    name: "Bengal Heritage House",
    location: "Kolkata, India",
    rating: 4.6,
    reviews: 681,
    price: 72,
    originalPrice: 96,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant"],
    type: "Hotel",
    description:
      "Warm heritage-inspired accommodation close to Kolkata's arts and food districts.",
    highlight: "A cultured stay in central Kolkata",
    perks: ["Breakfast included", "Cultural walks", "Airport transfer"],
  },
  {
    id: 17,
    name: "Charminar Suites",
    location: "Hyderabad, India",
    rating: 4.4,
    reviews: 376,
    price: 72,
    originalPrice: 98,
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant"],
    type: "Hotel",
    description:
      "A friendly city stay close to Hyderabad's bazaars, food, and historic sights.",
    highlight: "Great value near the old city",
    perks: ["Breakfast included", "Local food tours", "Free parking"],
  },
  {
    id: 18,
    name: "Van Vihar Lakeside Hotel",
    location: "Bhopal, India",
    rating: 4.3,
    reviews: 294,
    price: 58,
    originalPrice: 78,
    image:
      "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant", "pool"],
    type: "Hotel",
    description:
      "An easygoing retreat surrounded by Bhopal's lakes, parks, and museums.",
    highlight: "Relaxed rooms with outdoor space",
    perks: ["Pool access", "Breakfast included", "Family rooms"],
  },
  {
    id: 19,
    name: "Bandra Harbour Hotel",
    location: "Mumbai, India",
    rating: 4.5,
    reviews: 1187,
    price: 145,
    originalPrice: 190,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant", "gym"],
    type: "Hotel",
    description:
      "A modern Mumbai base near Bandra's cafes, nightlife, and waterfront walks.",
    highlight: "Smart rooms in a lively neighborhood",
    perks: ["Workspace", "Airport transfer", "Late checkout"],
  },
  {
    id: 20,
    name: "Riverfront Residency",
    location: "Ahmedabad, India",
    rating: 4.4,
    reviews: 448,
    price: 64,
    originalPrice: 86,
    image:
      "https://images.unsplash.com/photo-1566618500496-5c5f9a5c8d5a?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant"],
    type: "Hotel",
    description:
      "A practical stay near the Sabarmati Riverfront and Ahmedabad's business areas.",
    highlight: "Comfortable rooms for city breaks",
    perks: ["Riverfront access", "Breakfast included", "Free parking"],
  },
  {
    id: 21,
    name: "Amber Fort View Hotel",
    location: "Jaipur, India",
    rating: 4.5,
    reviews: 746,
    price: 92,
    originalPrice: 124,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant", "pool"],
    type: "Hotel",
    description:
      "A colorful Jaipur hotel with spacious rooms and views toward the Aravalli hills.",
    highlight: "A memorable base for fort visits",
    perks: ["Rooftop dining", "Pool access", "Heritage tours"],
  },
  {
    id: 22,
    name: "Yamuna Garden Hotel",
    location: "Agra, India",
    rating: 4.4,
    reviews: 516,
    price: 65,
    originalPrice: 88,
    image:
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant"],
    type: "Hotel",
    description:
      "A comfortable Agra stay with a quiet garden, local cuisine, and sightseeing support.",
    highlight: "Value stay for monument explorers",
    perks: ["Garden seating", "Taj transfers", "Breakfast included"],
  },
  {
    id: 23,
    name: "Assi Ghat Courtyard",
    location: "Varanasi, India",
    rating: 4.3,
    reviews: 389,
    price: 55,
    originalPrice: 74,
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop",
    amenities: ["wifi", "restaurant"],
    type: "Hotel",
    description:
      "A welcoming courtyard hotel within walking distance of Assi Ghat and riverside life.",
    highlight: "Authentic neighborhood experience",
    perks: ["Ghat walks", "Boat tour booking", "Vegetarian dining"],
  },
  {
    id: 24,
    name: "Hazratganj Central Hotel",
    location: "Lucknow, India",
    rating: 4.4,
    reviews: 463,
    price: 66,
    originalPrice: 89,
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant"],
    type: "Hotel",
    description:
      "A central Lucknow hotel surrounded by shopping, historic architecture, and food.",
    highlight: "Walkable location in Hazratganj",
    perks: ["Breakfast included", "Local dining guide", "Free parking"],
  },
  {
    id: 25,
    name: "India Gate Business Hotel",
    location: "New Delhi, India",
    rating: 4.5,
    reviews: 1098,
    price: 105,
    originalPrice: 140,
    image:
      "https://images.unsplash.com/photo-1566618500496-5c5f9a5c8d5a?w=800&h=600&fit=crop",
    amenities: ["wifi", "parking", "restaurant", "gym"],
    type: "Hotel",
    description:
      "A business-friendly Delhi hotel with reliable amenities and quick city access.",
    highlight: "Convenient for work and sightseeing",
    perks: ["Business center", "Metro access", "Breakfast included"],
  },
  {
    id: 26,
    name: "Park Street Boutique Hotel",
    location: "Kolkata, India",
    rating: 4.4,
    reviews: 573,
    price: 69,
    originalPrice: 92,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
    amenities: ["wifi", "restaurant", "gym"],
    type: "Hotel",
    description:
      "A characterful Kolkata hotel near Park Street dining, music, and cultural landmarks.",
    highlight: "Lively central location",
    perks: ["Breakfast included", "City walks", "Late checkout"],
  },
];

const amenityOptions = [
  "wifi",
  "parking",
  "restaurant",
  "pool",
  "gym",
  "spa",
  "kitchen",
  "beach",
  "fireplace",
];

/* =========================================================
   COMPONENT
========================================================= */

const BookPlace = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = location.state || {};

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    rating: 0,
    amenities: [],
  });

  const [showFilters, setShowFilters] = useState(false);

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("fastBookingFavorites") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [sortBy, setSortBy] = useState("recommended");
  const [activeDetailsId, setActiveDetailsId] = useState(null);

  /* =========================================================
     SAVE FAVORITES
  ========================================================= */

  useEffect(() => {
    localStorage.setItem(
      "fastBookingFavorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  /* =========================================================
     LOAD PROPERTIES
  ========================================================= */

  useEffect(() => {
    const searchLocation =
      searchParams.location?.trim() || "New York, USA";

    const timer = window.setTimeout(() => {
      const normalizedSearch = searchLocation.toLowerCase();

      const matchedProperties = baseProperties.filter((property) => {
        const propertyLocation = property.location.toLowerCase();

        const city = propertyLocation
          .split(",")[0]
          .trim();

        return (
          propertyLocation.includes(normalizedSearch) ||
          normalizedSearch.includes(city)
        );
      });

      setProperties(matchedProperties);
      setLoading(false);

      /* Save recent search */

      if (searchParams.location) {
        try {
          const stored = JSON.parse(
            localStorage.getItem("fastBookingRecentSearches") ||
              "[]"
          );

          const nextSearches = [
            {
              destination: searchParams.location,
              savedAt: new Date().toISOString(),
            },
            ...stored.filter(
              (item) =>
                item.destination !== searchParams.location
            ),
          ].slice(0, 6);

          localStorage.setItem(
            "fastBookingRecentSearches",
            JSON.stringify(nextSearches)
          );
        } catch (error) {
          console.error(
            "Unable to save recent search:",
            error
          );
        }
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [searchParams.location]);

  /* =========================================================
     FILTER + SORT
  ========================================================= */

  const filteredProperties = useMemo(() => {
    const filtered = [...properties]
      .filter((property) => {
        const priceMatch =
          property.price >= filters.priceRange[0] &&
          property.price <= filters.priceRange[1];

        const ratingMatch =
          property.rating >= filters.rating;

        const amenitiesMatch =
          filters.amenities.length === 0 ||
          filters.amenities.every((amenity) =>
            property.amenities.includes(amenity)
          );

        return (
          priceMatch &&
          ratingMatch &&
          amenitiesMatch
        );
      })
      .sort((a, b) => {
        if (sortBy === "price") {
          return a.price - b.price;
        }

        if (sortBy === "rating") {
          return b.rating - a.rating;
        }

        return b.rating - a.rating;
      });

    return filtered;
  }, [filters, properties, sortBy]);

  /* =========================================================
     AMENITY ICON
  ========================================================= */

  const getAmenityIcon = (amenity) => {
    const iconClass = "h-3.5 w-3.5";

    switch (amenity) {
      case "wifi":
        return <Wifi className={iconClass} />;

      case "parking":
        return <Car className={iconClass} />;

      case "restaurant":
        return <Utensils className={iconClass} />;

      case "pool":
        return <Waves className={iconClass} />;

      case "gym":
        return <Dumbbell className={iconClass} />;

      case "spa":
        return <Bath className={iconClass} />;

      case "kitchen":
        return <CookingPot className={iconClass} />;

      case "beach":
        return <Waves className={iconClass} />;

      case "fireplace":
        return <Flame className={iconClass} />;

      default:
        return null;
    }
  };

  /* =========================================================
     FAVORITE
  ========================================================= */

  const toggleFavorite = (propertyId, event) => {
    event.stopPropagation();

    setFavorites((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  /* =========================================================
     BOOK NOW
  ========================================================= */

  const handleBookNow = (property) => {
    const authToken = localStorage.getItem("authToken");

    const bookingState = {
      property,
      searchParams,
    };

    if (!authToken) {
      navigate("/login", {
        state: {
          from: "/payment",
          ...bookingState,
        },
      });

      return;
    }

    navigate("/payment", {
      state: bookingState,
    });
  };

  /* =========================================================
     AMENITY FILTER
  ========================================================= */

  const toggleAmenity = (amenity) => {
    setFilters((prev) => ({
      ...prev,

      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(
            (item) => item !== amenity
          )
        : [...prev.amenities, amenity],
    }));
  };

  /* =========================================================
     DETAILS
  ========================================================= */

  const toggleDetails = (propertyId, event) => {
    event.stopPropagation();

    setActiveDetailsId((prev) =>
      prev === propertyId ? null : propertyId
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-28">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8 h-52 animate-pulse rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800" />

          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                <div className="h-48 animate-pulse bg-slate-200" />

                <div className="space-y-4 p-6">
                  <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />

                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />

                  <div className="h-12 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-12 pt-28 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* LOGIN / REGISTER NOTICE */}

        {!localStorage.getItem("authToken") && (
          <div className="mb-6 overflow-hidden rounded-3xl border border-yellow-200 bg-gradient-to-r from-yellow-50 via-white to-blue-50 shadow-sm">

            <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-800">
                  <Sparkles size={14} />
                  FastBooking
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  Create your account to book
                </h2>

                <p className="mt-1 max-w-2xl text-sm text-slate-600">
                  Browse available properties freely.
                  Sign in or create an account when
                  you're ready to book.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">

                <button
                  onClick={() =>
                    navigate("/login", {
                      state: {
                        from: "/book-place",
                        searchParams,
                      },
                    })
                  }
                  className="rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-800"
                >
                  Log in
                </button>

                <button
                  onClick={() =>
                    navigate("/register", {
                      state: {
                        from: "/book-place",
                        searchParams,
                      },
                    })
                  }
                  className="rounded-full border-2 border-yellow-500 bg-white px-6 py-3 text-sm font-semibold text-yellow-700 transition hover:bg-yellow-50"
                >
                  Create account
                </button>

              </div>

            </div>
          </div>
        )}

        {/* HERO */}

        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800 p-6 text-white shadow-xl sm:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <button
                onClick={() => navigate("/book")}
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-blue-100 transition hover:text-white"
              >
                <ArrowLeft size={18} />
                Back to Search
              </button>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-300/30 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-200">
                <Sparkles size={14} />
                Premium stays
              </div>

              <h1 className="text-3xl font-bold sm:text-4xl">
                {searchParams.location
                  ? `Stays in ${searchParams.location}`
                  : "Available Properties"}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Discover handpicked stays with flexible
                booking, premium amenities and special
                perks for your trip.
              </p>

            </div>

            <div className="w-fit rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur">

              <p className="text-sm text-blue-100">
                Showing
              </p>

              <p className="text-2xl font-bold">
                {filteredProperties.length}

                <span className="ml-1 text-sm font-medium text-blue-100">
                  stays
                </span>
              </p>

            </div>

          </div>
        </div>

        {/* FILTER BAR */}

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <button
              onClick={() =>
                setShowFilters((prev) => !prev)
              }
              className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <SlidersHorizontal size={17} />

              {showFilters
                ? "Hide filters"
                : "Filters & sorting"}
            </button>

            <div className="flex items-center gap-3">

              <span className="hidden text-sm text-slate-500 sm:block">
                Sort by
              </span>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500"
              >
                <option value="recommended">
                  Recommended
                </option>

                <option value="price">
                  Price: low to high
                </option>

                <option value="rating">
                  Top rated
                </option>
              </select>

            </div>
          </div>

          {/* FILTER PANEL */}

          {showFilters && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-5">

              <div className="grid gap-6 md:grid-cols-3">

                {/* Rating */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Minimum rating
                  </label>

                  <select
                    value={filters.rating}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        rating: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value={0}>
                      Any rating
                    </option>

                    <option value={3}>
                      3+ stars
                    </option>

                    <option value={4}>
                      4+ stars
                    </option>

                    <option value={4.5}>
                      4.5+ stars
                    </option>
                  </select>
                </div>

                {/* Price */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Maximum price: $
                    {filters.priceRange[1]}
                  </label>

                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.priceRange[1]}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: [
                          0,
                          Number(event.target.value),
                        ],
                      }))
                    }
                    className="w-full accent-blue-600"
                  />

                  <div className="mt-1 flex justify-between text-xs text-slate-500">
                    <span>$0</span>
                    <span>$1000+</span>
                  </div>
                </div>

                {/* Amenities */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Amenities
                  </label>

                  <div className="flex flex-wrap gap-2">

                    {amenityOptions.map((amenity) => {
                      const selected =
                        filters.amenities.includes(amenity);

                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() =>
                            toggleAmenity(amenity)
                          }
                          className={`rounded-full px-3 py-2 text-xs font-semibold capitalize transition ${
                            selected
                              ? "bg-blue-700 text-white shadow-sm"
                              : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                          }`}
                        >
                          {amenity}
                        </button>
                      );
                    })}

                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* PROPERTY GRID */}

        {filteredProperties.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">

            {filteredProperties.map((property) => {
              const isFavorite =
                favorites.includes(property.id);

              const isExpanded =
                activeDetailsId === property.id;

              return (
                <div
                  key={property.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* IMAGE */}

                  <div className="relative">

                    <img
                      src={property.image}
                      alt={property.name}
                      className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />

                    {/* TYPE */}

                    <div className="absolute left-4 top-4 rounded-full bg-blue-700 px-3 py-1.5 text-xs font-bold text-white shadow">
                      {property.type}
                    </div>

                    {/* FAVORITE */}

                    <button
                      onClick={(event) =>
                        toggleFavorite(
                          property.id,
                          event
                        )
                      }
                      aria-label="Add to favorites"
                      className={`absolute right-4 top-4 rounded-full p-2.5 shadow-md backdrop-blur transition ${
                        isFavorite
                          ? "bg-red-500 text-white"
                          : "bg-white/90 text-slate-700 hover:bg-white"
                      }`}
                    >
                      <Heart
                        size={18}
                        fill={
                          isFavorite
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                    {/* SAVING */}

                    {property.originalPrice && (
                      <div className="absolute bottom-4 left-4 rounded-full bg-yellow-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow">
                        Save $
                        {(
                          property.originalPrice -
                          property.price
                        ).toLocaleString()}
                      </div>
                    )}

                  </div>

                  {/* CONTENT */}

                  <div className="p-6">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="text-xl font-bold text-slate-900">
                          {property.name}
                        </h3>

                        <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin
                            size={15}
                            className="text-red-500"
                          />
                          {property.location}
                        </div>

                      </div>

                      {/* RATING */}

                      <div className="flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-sm font-bold text-green-700">
                        <Star
                          size={14}
                          className="fill-current"
                        />
                        {property.rating}
                      </div>

                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {property.description}
                    </p>

                    {/* HIGHLIGHT */}

                    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-3">

                      <div className="flex items-start gap-2 text-sm font-semibold text-blue-700">

                        <Sparkles
                          size={17}
                          className="mt-0.5 shrink-0"
                        />

                        <span>
                          {property.highlight}
                        </span>

                      </div>

                    </div>

                    {/* AMENITIES */}

                    <div className="mt-4 flex flex-wrap gap-2">

                      {property.amenities
                        .slice(0, 4)
                        .map((amenity) => (
                          <div
                            key={`${property.id}-${amenity}`}
                            className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                          >
                            {getAmenityIcon(amenity)}

                            <span className="capitalize">
                              {amenity}
                            </span>
                          </div>
                        ))}

                      {property.amenities.length > 4 && (
                        <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
                          +
                          {property.amenities.length -
                            4}{" "}
                          more
                        </span>
                      )}

                    </div>

                    {/* PRICE + ACTIONS */}

                    <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-end sm:justify-between">

                      <div>

                        <div className="flex items-baseline gap-2">

                          <span className="text-2xl font-bold text-blue-700">
                            $
                            {property.price.toLocaleString()}
                          </span>

                          <span className="text-sm text-slate-500">
                            / night
                          </span>

                        </div>

                        {property.originalPrice && (
                          <span className="text-sm text-slate-400 line-through">
                            $
                            {property.originalPrice.toLocaleString()}
                          </span>
                        )}

                        <div className="mt-1 text-xs text-slate-500">
                          {property.reviews.toLocaleString()}{" "}
                          verified reviews
                        </div>

                      </div>

                      <div className="flex gap-2">

                        <button
                          onClick={(event) =>
                            toggleDetails(
                              property.id,
                              event
                            )
                          }
                          className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {isExpanded ? (
                            <span className="inline-flex items-center gap-1">
                              <ChevronUp size={16} />
                              Hide
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <ChevronDown size={16} />
                              Details
                            </span>
                          )}
                        </button>

                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleBookNow(property);
                          }}
                          className="rounded-full bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-blue-800 hover:to-blue-700"
                        >
                          Book Now
                        </button>

                      </div>
                    </div>

                    {/* DETAILS */}

                    {isExpanded && (
                      <div className="mt-5 rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-blue-50 p-4">

                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">

                          <Sparkles
                            size={17}
                            className="text-yellow-600"
                          />

                          What makes this stay special

                        </div>

                        <ul className="mt-3 grid gap-2 sm:grid-cols-2">

                          {property.perks.map((perk) => (
                            <li
                              key={perk}
                              className="rounded-xl bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm"
                            >
                              ✓ {perk}
                            </li>
                          ))}

                        </ul>

                      </div>
                    )}

                  </div>
                </div>
              );
            })}

          </div>
        ) : (

          /* NO RESULTS */

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <MapPin size={28} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No properties found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              We couldn't find a property matching
              your destination and selected filters.
              Try another destination or clear some
              filters.
            </p>

            <button
              onClick={() => {
                setFilters({
                  priceRange: [0, 1000],
                  rating: 0,
                  amenities: [],
                });

                navigate("/book");
              }}
              className="mt-6 rounded-full bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-800"
            >
              Back to Search
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

export default BookPlace;