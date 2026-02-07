
import React, { useEffect, useRef } from 'react';
import { Flame, Clock, ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from "react-router-dom";
import { PropertyTypes } from '../Data/Property';



const DEALS = [
  {
    id: 101,
    name: "Organic Dragon Fruit (Red)",
    discount: 30,
    price: 8.50,
    originalPrice: 12.00,
    image: "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?auto=format&fit=crop&q=80&w=400&h=400",
    timeLeft: "04:22:15",
    soldCount: 45,
    totalStock: 60
  },
  {
    id: 102,
    name: "Pure Manuka Honey MGO 400+",
    discount: 25,
    price: 34.99,
    originalPrice: 46.50,
    image: "https://images.unsplash.com/photo-1589184411108-724398320987?auto=format&fit=crop&q=80&w=400&h=400",
    timeLeft: "02:10:45",
    soldCount: 12,
    totalStock: 20
  },
  {
    id: 103,
    name: "Extra Virgin Olive Oil (500ml)",
    discount: 40,
    price: 14.20,
    originalPrice: 24.00,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400&h=400",
    timeLeft: "08:45:00",
    soldCount: 88,
    totalStock: 100
  },
  {
    id: 104,
    name: "Japanese Wagyu Ribeye A5",
    discount: 15,
    price: 120.00,
    originalPrice: 145.00,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400&h=400",
    timeLeft: "01:05:30",
    soldCount: 5,
    totalStock: 8
  },
  {
    id: 105,
    name: "Organic Blueberries Bulk",
    discount: 50,
    price: 9.99,
    originalPrice: 19.99,
    image: "https://images.unsplash.com/photo-1497534446932-c946e7316ba1?auto=format&fit=crop&q=80&w=400&h=400",
    timeLeft: "05:30:10",
    soldCount: 150,
    totalStock: 200
  },
   {
    id: 101,
    name: "Organic Dragon Fruit (Red)",
    discount: 30,
    price: 8.50,
    originalPrice: 12.00,
    image: "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?auto=format&fit=crop&q=80&w=400&h=400",
    timeLeft: "04:22:15",
    soldCount: 45,
    totalStock: 60
  },
  {
    id: 102,
    name: "Pure Manuka Honey MGO 400+",
    discount: 25,
    price: 34.99,
    originalPrice: 46.50,
    image: "https://images.unsplash.com/photo-1589184411108-724398320987?auto=format&fit=crop&q=80&w=400&h=400",
    timeLeft: "02:10:45",
    soldCount: 12,
    totalStock: 20
  },
  {
    id: 103,
    name: "Extra Virgin Olive Oil (500ml)",
    discount: 40,
    price: 14.20,
    originalPrice: 24.00,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400&h=400",
    timeLeft: "08:45:00",
    soldCount: 88,
    totalStock: 100
  },
  {
    id: 104,
    name: "Japanese Wagyu Ribeye A5",
    discount: 15,
    price: 120.00,
    originalPrice: 145.00,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400&h=400",
    timeLeft: "01:05:30",
    soldCount: 5,
    totalStock: 8
  },
  {
    id: 105,
    name: "Organic Blueberries Bulk",
    discount: 50,
    price: 9.99,
    originalPrice: 19.99,
    image: "https://images.unsplash.com/photo-1497534446932-c946e7316ba1?auto=format&fit=crop&q=80&w=400&h=400",
    timeLeft: "05:30:10",
    soldCount: 150,
    totalStock: 200
  }
];

 const ProductSlider  = () => {

  const scrollRef = useRef(null);
const location = useLocation();
const isHotDeals = location.pathname === "/hot-deals";

useEffect(() => {
  if (!scrollRef.current) return;

  const container = scrollRef.current;
  const firstCard = container.children[0];
  if (!firstCard) return;

  const gap = 24; // gap-6
  const cardWidth = firstCard.getBoundingClientRect().width + gap;
  let index = 0;

  const autoSlide = setInterval(() => {
    const maxScroll = container.scrollWidth - container.clientWidth;

    container.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });

    index++;

    if (index * cardWidth > maxScroll) {
      index = 0;
      setTimeout(() => {
        container.scrollTo({ left: 0, behavior: "smooth" });
      }, 500);
    }
  }, 3000); // 3s per slide

  return () => clearInterval(autoSlide);
}, []);


  return (
    <div className={`${isHotDeals ? "px-6 max-w-6xl  mx-auto lg:px-20 py-10" : "py-10 overflow-hidden"}`}>
      {/* Refined Header */}
      {/* <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-8">
        <div className="reveal-1">
          <h2 className="text-4xl  font-black text-gray-900 tracking-tight leading-none">
            Hot <span className="text-rose-600 italic">Deals</span>
          </h2>
          <div className="flex items-center rounded-xl gap-3 mt-4 text-[10px] font-black uppercase tracking-widest text-slate-600 tabular-nums">
             <Clock className="h-3 w-3 text-rose-500" />
             Time Remaining: <p className="text-slate-600">04:22:15</p>
          </div>
        </div>

        <div className="flex gap-4">
                <button 
                  onClick={() => scroll('left')}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white  text-slate-600 hover:text-emerald-600 active:scale-90 transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => scroll('right')}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white  text-slate-600 hover:text-emerald-600 active:scale-90 transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                  
                </button>
              </div>
      </div> */}

      {/* Responsive Carousel Grid */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-12 scrollbar-hide snap-x px-2 scroll-smooth"
        
      >
        {PropertyTypes.map((deal,index) => {
          return (
            <div 
              key={index}
              className={`
                group relative shrink-0 snap-start rounded-[2.5rem] bg-white border border-slate-200 p-3
                transition-all duration-500 hover:shadow-xl hover:border-rose-100 hover:-translate-y-1
                w-full 
                md:w-[calc(33.33%-1rem)] 
                lg:w-[calc(25%-1.125rem)]
                flex flex-col
                
              `}
              
              style={{ minHeight: '500px' }}
            >
              <div className="relative aspect-4/4 overflow-hidden rounded-4xl bg-gray-50 shrink-0">
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <div className="rounded-full bg-rose-600 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-white shadow-md">
                    -20% OFF
                  </div>
                </div>
                
                <img 
                  src={deal.image} 
                  alt={deal.title}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />

                {/* <button className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-600 text-white shadow-lg translate-y-20 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-rose-700 active:scale-90">
                  <ShoppingCart className="h-5 w-5" />
                </button> */}
              </div>

              <div className="mt-5 px-3 grow flex flex-col ">
                <div>
                  <div className="flex items-center justify-between w-full gap-1.5 mb-2.5">
                     <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 mb-0.5 fill-orange-400 text-orange-400" />
                    <span className="text-[15px] font-black text-gray-900">4.9</span>
                     </div>
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Limited</span>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 group-hover:text-rose-600 transition-colors tracking-tight leading-tight mb-3">
                    {deal.title}
                  </h3>

                  {/* <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-gray-900 tracking-tighter">${deal.price.toFixed(2)}</span>
                    <span className="text-xs font-bold text-slate-600 line-through tracking-tight">${deal.originalPrice.toFixed(2)}</span>
                  </div> */}
                </div>

                {/* <div className="mt-6 pb-2">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2">
                    <span className="text-rose-600">{deal.totalStock - deal.soldCount} left</span>
                    <span className="text-gray-400">{Math.round(progress)}% sold</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-sate-200">
                    <div 
                      className="h-full bg-rose-600 transition-all duration-1000 ease-out" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div> */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductSlider