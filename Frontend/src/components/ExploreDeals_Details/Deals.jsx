import React, { useEffect, useState } from "react";
import {
  Star,
  MapPin,
  Clock,
  Flame,
  ArrowRight,
} from "lucide-react";

const Deals = ({ onBookDeal }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo deals data
    const mockDeals = [
      {
        id: 1,
        name: "Luxury Beach Resort",
        location: "Cancun, Mexico",
        rating: 4.8,
        reviews: 2100,
        price: 180,
        originalPrice: 250,
        image:
          "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=800",
        discount: 28,
        timeLeft: "2 days left",
      },
      {
        id: 2,
        name: "City Center Hotel",
        location: "Paris, France",
        rating: 4.6,
        reviews: 1800,
        price: 120,
        originalPrice: 160,
        image:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
        discount: 25,
        timeLeft: "5 days left",
      },
      {
        id: 3,
        name: "Mountain Lodge",
        location: "Swiss Alps",
        rating: 4.9,
        reviews: 950,
        price: 200,
        originalPrice: 280,
        image:
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800",
        discount: 29,
        timeLeft: "1 day left",
      },
      {
        id: 4,
        name: "Tropical Villa",
        location: "Bali, Indonesia",
        rating: 4.7,
        reviews: 1200,
        price: 150,
        originalPrice: 200,
        image:
          "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&q=80&w=800",
        discount: 25,
        timeLeft: "3 days left",
      },
    ];

    const timer = setTimeout(() => {
      setDeals(mockDeals);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Loading
  if (loading) {
    return (
      <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-md">
        <div className="flex items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#C58A18]" />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-md">

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Flame
            size={20}
            className="text-[#C58A18]"
          />

          <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#C58A18]">
            Exclusive Deals
          </span>
        </div>

        <h2 className="text-3xl font-bold text-[#082B5C]">
          Limited-Time Hotel Offers
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
          Save more on amazing stays with our latest FastBooking deals.
        </p>
      </div>

      {/* Deals Grid */}
      <div className="grid gap-6 md:grid-cols-2">

        {deals.map((deal) => (
          <div
            key={deal.id}
            className="group overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#C58A18] hover:shadow-xl"
          >

            {/* Image */}
            <div className="relative h-52 overflow-hidden">

              <img
                src={deal.image}
                alt={deal.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Discount */}
              <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#082B5C] px-3 py-1.5 text-sm font-bold text-white shadow">
                <Flame
                  size={14}
                  className="text-[#E3AE32]"
                />
                {deal.discount}% OFF
              </div>

              {/* Time */}
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#E3AE32] px-3 py-1.5 text-sm font-bold text-[#082B5C] shadow">
                <Clock size={14} />
                {deal.timeLeft}
              </div>

              {/* Rating */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-[#082B5C]">
                <Star
                  size={15}
                  fill="#C58A18"
                  className="text-[#C58A18]"
                />
                {deal.rating}
              </div>

            </div>

            {/* Content */}
            <div className="p-5">

              <h3 className="text-xl font-bold text-[#082B5C]">
                {deal.name}
              </h3>

              {/* Location */}
              <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin
                  size={16}
                  className="text-[#C58A18]"
                />
                {deal.location}
              </div>

              {/* Reviews */}
              <div className="mt-2 text-sm text-slate-500">
                <span className="font-semibold text-[#082B5C]">
                  {deal.rating}
                </span>{" "}
                · {deal.reviews.toLocaleString()} reviews
              </div>

              {/* Divider */}
              <div className="my-4 h-px bg-blue-100" />

              {/* Price + Button */}
              <div className="flex items-center justify-between gap-4">

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#082B5C]">
                      ${deal.price}
                    </span>

                    <span className="text-sm text-slate-400 line-through">
                      ${deal.originalPrice}
                    </span>
                  </div>

                  <span className="text-xs text-slate-500">
                    per night
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onBookDeal?.(deal)}
                  className="flex items-center gap-2 rounded-xl bg-[#082B5C] px-4 py-3 text-sm font-bold text-white shadow-sm transition duration-300 hover:bg-[#C58A18] hover:shadow-lg"
                >
                  Book Deal
                  <ArrowRight size={16} />
                </button>

              </div>

            </div>
          </div>
        ))}

      </div>

      {/* Bottom Accent */}
      <div className="mt-8 h-px bg-gradient-to-r from-transparent via-[#C58A18] to-transparent" />

    </section>
  );
};

export default Deals;