import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MapPin,
  Sparkles,
  Star,
  Trash2,
  Hotel,
  ArrowRight,
  Search,
} from "lucide-react";

const FAVORITES_KEY = "fastBookingFavorites";

const favoriteProperties = [
  {
    id: 1,
    name: "Luxury Downtown Hotel",
    location: "New York, USA",
    rating: 4.8,
    price: 250,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
    description:
      "Skyline views, premium amenities, and breakfast included.",
  },
  {
    id: 2,
    name: "Cozy Boutique Hotel",
    location: "New York, USA",
    rating: 4.6,
    price: 180,
    image:
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop",
    description:
      "Intimate stay with local charm and wellness perks.",
  },
  {
    id: 5,
    name: "Beachfront Resort",
    location: "Miami, USA",
    rating: 4.9,
    price: 350,
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
    description:
      "Oceanfront luxury with spa access and private beach entry.",
  },
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop";

const AccountFavorites = () => {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD FAVORITES
  // =====================================================

  useEffect(() => {
    const loadFavorites = () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem(FAVORITES_KEY) || "[]"
        );

        if (!Array.isArray(saved)) {
          setFavorites([]);
          return;
        }

        /*
          Supports both formats:

          [1, 2, 5]

          and:

          [{ id: 1 }, { id: 2 }]
        */

        const favoriteIds = saved
          .map((item) => {
            if (item && typeof item === "object") {
              return item.id || item._id;
            }

            return item;
          })
          .filter(Boolean);

        const matched = favoriteProperties.filter((property) =>
          favoriteIds.some(
            (id) => String(id) === String(property.id)
          )
        );

        setFavorites(matched);
      } catch (error) {
        console.error("Failed to load favorites:", error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();

    const handleStorageChange = (event) => {
      if (event.key === FAVORITES_KEY) {
        loadFavorites();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  // =====================================================
  // REMOVE FAVORITE
  // =====================================================

  const removeFavorite = (propertyId) => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(FAVORITES_KEY) || "[]"
      );

      const updated = saved.filter((item) => {
        const id =
          item && typeof item === "object"
            ? item.id || item._id
            : item;

        return String(id) !== String(propertyId);
      });

      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(updated)
      );

      setFavorites((previous) =>
        previous.filter(
          (property) =>
            String(property.id) !== String(propertyId)
        )
      );
    } catch (error) {
      console.error("Unable to remove favorite:", error);
    }
  };

  // =====================================================
  // VIEW STAY
  // =====================================================

  const handleViewStay = (property) => {
    navigate("/book-place", {
      state: {
        location: property.location,
        property: property.name,
        price: property.price,
      },
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#FFF9EC] px-4 py-10">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#082B5C]" />

            <p className="font-medium text-[#082B5C]">
              Loading favorites...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#F8FBFF] via-white to-[#FFF9EC] px-4 py-8 sm:px-6 lg:px-8">

      {/* Background Decoration */}

      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#082B5C]/5 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-[#E3AE32]/10 blur-3xl" />

      {/* Main Container */}

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Back Button */}

        <Link
          to="/account"
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-[#082B5C] shadow-sm transition hover:border-[#E3AE32] hover:bg-[#FFF9EC]"
        >
          <ArrowLeft size={17} />
          Back to Account
        </Link>

        {/* Header */}

        <div className="mb-8 overflow-hidden rounded-[2rem] bg-[#082B5C] p-6 text-white shadow-xl sm:p-8">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E3AE32]/40 bg-[#E3AE32]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#E3AE32]">
                <Sparkles size={14} />
                FastBooking
              </div>

              <h1 className="text-3xl font-bold sm:text-4xl">
                My Favorites
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Save your favorite hotels and resorts so
                you can quickly return to them whenever
                you're ready to travel.
              </p>

            </div>

            {/* Favorite Count */}

            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">

              <div className="rounded-xl bg-[#C58A18] p-3">
                <Heart
                  size={22}
                  fill="currentColor"
                />
              </div>

              <div>
                <p className="text-xs text-blue-100">
                  Saved Properties
                </p>

                <p className="text-2xl font-bold">
                  {favorites.length}
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* Empty State */}

        {favorites.length === 0 ? (
          <div className="rounded-[2rem] border border-[#E3AE32]/20 bg-white p-8 text-center shadow-sm sm:p-14">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FFF9EC]">
              <Heart
                size={38}
                className="text-[#C58A18]"
              />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-[#082B5C]">
              No favorites yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              You haven't saved any properties yet.
              Explore our hotels and tap the heart icon
              to save your favorite stays.
            </p>

            <Link
              to="/book"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#082B5C] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#C58A18]"
            >
              <Search size={17} />
              Explore Properties
              <ArrowRight size={16} />
            </Link>

          </div>
        ) : (

          <div>

            {/* Summary */}

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-bold text-[#082B5C]">
                  Saved Properties
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {favorites.length} favorite{" "}
                  {favorites.length === 1
                    ? "property"
                    : "properties"}{" "}
                  saved for quick access.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E3AE32]/30 bg-[#FFF9EC] px-4 py-2 text-sm font-semibold text-[#A56F00]">
                <Heart
                  size={15}
                  fill="currentColor"
                />
                {favorites.length} Saved
              </div>

            </div>

            {/* Property Grid */}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

              {favorites.map((property) => (

                <article
                  key={property.id}
                  className="group overflow-hidden rounded-[2rem] border border-[#E3AE32]/20 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#E3AE32]/60 hover:shadow-xl"
                >

                  {/* Image */}

                  <div className="relative h-56 overflow-hidden">

                    <img
                      src={property.image}
                      alt={property.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.src =
                          FALLBACK_IMAGE;
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#082B5C]/70 via-transparent to-transparent" />

                    {/* Remove Favorite */}

                    <button
                      type="button"
                      onClick={() =>
                        removeFavorite(property.id)
                      }
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-md backdrop-blur transition hover:scale-110 hover:bg-red-500 hover:text-white"
                      title="Remove from favorites"
                      aria-label={`Remove ${property.name} from favorites`}
                    >
                      <Heart
                        size={18}
                        fill="currentColor"
                      />
                    </button>

                    {/* Rating */}

                    <div className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#A56F00] shadow-md">

                      <Star
                        size={14}
                        fill="currentColor"
                      />

                      {property.rating}

                    </div>

                    {/* Price */}

                    <div className="absolute bottom-4 right-4 rounded-full bg-[#082B5C] px-3 py-1.5 text-xs font-bold text-white shadow-md">

                      ${property.price}

                      <span className="font-normal text-blue-100">
                        {" "}
                        / night
                      </span>

                    </div>

                  </div>

                  {/* Card Content */}

                  <div className="p-5">

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <h3 className="truncate text-xl font-bold text-[#082B5C]">
                          {property.name}
                        </h3>

                        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">

                          <MapPin
                            size={15}
                            className="shrink-0 text-[#C58A18]"
                          />

                          {property.location}

                        </p>

                      </div>

                      <div className="rounded-xl bg-[#FFF9EC] p-2.5">
                        <Hotel
                          size={18}
                          className="text-[#C58A18]"
                        />
                      </div>

                    </div>

                    <p className="mt-4 min-h-[48px] text-sm leading-6 text-slate-500">
                      {property.description}
                    </p>

                    {/* Bottom */}

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">

                      <div className="flex items-center gap-2 text-sm font-semibold text-[#C58A18]">

                        <Sparkles size={15} />

                        <span>
                          Premium Stay
                        </span>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleViewStay(property)
                        }
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#082B5C] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#C58A18]"
                      >
                        View Stay
                        <ArrowRight size={14} />
                      </button>

                    </div>

                    {/* Remove */}

                    <button
                      type="button"
                      onClick={() =>
                        removeFavorite(property.id)
                      }
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                      Remove from Favorites
                    </button>

                  </div>
                </article>

              ))}

            </div>
          </div>
        )}

        {/* Bottom CTA */}

        {favorites.length > 0 && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-[#E3AE32]/20 bg-white p-5 shadow-sm sm:flex-row">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-[#FFF9EC] p-3">
                <Sparkles
                  size={20}
                  className="text-[#C58A18]"
                />
              </div>

              <div>
                <p className="font-semibold text-[#082B5C]">
                  Looking for more stays?
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Discover more hotels and add them to
                  your favorites.
                </p>
              </div>

            </div>

            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-full bg-[#082B5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#C58A18]"
            >
              Explore Hotels
              <ArrowRight size={16} />
            </Link>

          </div>
        )}

      </div>
    </section>
  );
};

export default AccountFavorites;