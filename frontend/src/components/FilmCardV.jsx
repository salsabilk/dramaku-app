import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function FilmCardV({ id, src, title }) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleClick = () => {
    navigate('/detail/' + id);
  };
  // console.log(id);
  return (
    <>
      <div className="inline-block px-3">
        <div onClick={handleClick} className="relative w-40 h-60 max-w-xs overflow-hidden rounded-lg shadow-md bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out">
          <img
            src={src}
            className="object-cover w-full h-full"
            alt=""
          />
          <h4 className="w-full absolute font-semibold inset-x-0 bottom-0 bg-black bg-opacity-50 text-center text-white">
            {title}
          </h4>
        </div>
      </div>
    </>
  );
}

export default FilmCardV;
