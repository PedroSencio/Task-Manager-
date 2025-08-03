import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import HomePageUser from './pages/HomePageUser';
import Configuracoes from './pages/Configuracoes';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<HomePageUser />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/:userName" element={<HomePageUser />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
