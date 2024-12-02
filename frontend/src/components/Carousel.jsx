import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./carousel.css";

// import required modules
import { Pagination, Navigation } from "swiper/modules";

export default function App({dramas}) {
  return (
    <>
      <div className="w-full h-half px-4 md:px-20 xl:px-40 grid mt-4">
        <Swiper
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Pagination, Navigation]}
          className=""
        >
          <SwiperSlide>
            <img
              className="w-full img-carousel"
              src="img/banner-film/film2.jpg"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              className="w-full img-carousel"
              src="img/banner-film/film1.jpg"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              className="w-full img-carousel"
              src="img/banner-film/film3.jpg"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              className="w-full img-carousel"
              src="img/banner-film/film4.jpg"
            />
          </SwiperSlide>
        </Swiper>
      </div>
    </>
  );
}
