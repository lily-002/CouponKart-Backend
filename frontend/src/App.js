import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from './layouts/Main';
import NotFound from "./pages/NotFound";
import publicRoutes from "./routes/PublicRoutes";
import protectedRoutes from "./routes/ProtectedRoutes";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { Navigate } from "react-router-dom";

import "./assets/css/remixicon.css";
import "./scss/style.scss";

window.addEventListener("load", function () {
  let skinMode = localStorage.getItem("skin-mode");
  let HTMLTag = document.querySelector("html");

  if (skinMode) {
    HTMLTag.setAttribute("data-skin", skinMode);
  }
});

export default function App() {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/" element={<Main />}>
            {protectedRoutes.map((route, index) => {
              return (
                <Route
                  path={route.path}
                  element={<ProtectedRoutes element={route.element} />}
                  key={index}
                />
              );
            })}
          </Route>
          {publicRoutes.map((route, index) => {
            return (
              <Route
                path={route.path}
                element={route.element}
                key={index}
              />
            );
          })}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  );
}
