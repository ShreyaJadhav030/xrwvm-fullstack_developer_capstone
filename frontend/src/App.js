import React from "react";
import { Routes, Route } from "react-router-dom";

import LoginPanel from "./components/Login/Login";
import Register from "./components/Register/Register";
// You can import other components like Home, About, Contact here too

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPanel />} />
      <Route path="/register" element={<Register />} />
      {/* Add more routes below as needed */}
      {/* Example: <Route path="/" element={<Home />} /> */}
    </Routes>
  );
}

export default App;
