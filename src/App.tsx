import './App.css';

import React, { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

import { Home } from './sections/Home';
import { Welcome } from './sections/Welcome';

const routes = [
  {
    path: "/",
    sidebar:  () => <div>playground...</div>,
    component: <Home />
  },
  {
    path: "/welcome",
    sidebar: () => <div>welcome...</div>,
    component: <Welcome />
  },
];

export default function App() {
  return (
    <div className="flex h-screen bg-gray-100 font-roboto">
      {/* <div className="flex"> */}

        {/* Sidebar
        <div className="-translate-x-full ease-in fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-purple-700 lg:translate-x-0 lg:static lg:inset-0">

          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center">
              <span className="w-5 h-5">
                <svg fill="#ffffff" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 488.94 541.2">
                  <g>
                    <path d="m80.42,197.14c13.82,11.25,30.56,22.25,50.78,32.11,14.87-28.67,72.09-100.71,233.32-79.68l-14.4-55.35c-200.24-17.18-257.81,77.11-269.7,102.92Z"/>
                    <path d="m44.53,167.77c22.44-40.73,99.17-124.23,290.19-105.83L310.19,1.59S109.9-21.63,8.9,109.47c3.62,10.55,13.31,33.34,35.63,58.29Z"/>
                    <path d="m407.7,291.25c-32.14,3.35-62.02,4.95-89.63,4.95C123.09,296.2,36.78,219.6,0,164.95v251.98s15.77,162.98,488.94,115.66l-81.24-241.33Z"/>
                  </g>
                </svg>
              </span>
              <span className="text-white text-2xl mx-2 font-semibold">Playground</span>
            </div>
          </div>
        </div>
        */}

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">

          <div className="flex-1 overflow-y-auto bg-gray-100">
            <div className="container mx-auto p-8">

              <img src="https://github.com/colyseus/colyseus/blob/master/media/header.png?raw=1" alt="" className="w-48 m-auto mt-6" />

              <Routes>
                {routes.map((route, index) => (
                  <Route
                    key={index}
                    path={route.path}
                    element={route.component}
                  />
                ))}
              </Routes>
            </div>
          </div>

        </div>

      {/* </div> */}

    </div>
  );
};
