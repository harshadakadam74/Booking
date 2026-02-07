import React from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import {PropertyTypes } from "../../Data/Property.js";

import { Link } from "react-router-dom";

const PropertyType = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 md:py-14" >
        {/* Browse by Property Type */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold mb-6">
            Browse by property type
          </h2>

          <Swiper className="pb-8"
          
            modules={[Navigation]}
            navigation
            spaceBetween={24}
            slidesPerView={4}
            breakpoints={{
              320: { slidesPerView: 1.2 },
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
                                                                                                                                                                                                                                                                                                               
            }}
            
          >
            {PropertyTypes.map((item, index) => (
              <SwiperSlide key={item.title}>
                <Link
                  to={item.link}
                  className="group animate-cardFade block"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="overflow-hidden rounded-xl mb-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-lg font-semibold group-hover:text-blue-800 transition">
                    {item.title}
                  </h3>
                </Link>
                
              </SwiperSlide>
            ))}
          </Swiper>
          
        </section>
    </div>
  );
};

export default PropertyType;
