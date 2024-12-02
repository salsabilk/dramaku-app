import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

import "./scroll.css";
import FilmCardV from "./FilmCardV";

// import required modules
import { FreeMode, Pagination } from "swiper/modules";

export default function App({ dramas, title }) {
  return (
    <>
      <div className="px-4 md:px-20 xl:px-40 grid mt-4">
        <div className="overflow-x-auto w-full bg-white rounded-lg shadow-md w-2 p-2">
          <h1 className="flex py-5 lg:px-20 md:px-10 px-5 lg:mx-40 md:mx-20 mx-5 font-bold text-4xl text-gray-800">
            {title}
          </h1>
          <div className="flex overflow-x-auto hide-scroll-bar">
            <div className="flex flex-nowrap py-2 lg:ml-40 md:ml-20 ml-10">
              {dramas.map((drama) => (
                <FilmCardV
                  id={drama.id}
                  src={drama.poster}
                  title={drama.title}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
