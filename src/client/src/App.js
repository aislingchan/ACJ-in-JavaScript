import React, {useEffect, useState} from 'react';
import {ResultsTable} from './resultsTable.js';
import "./App.css";
import axios from 'axios';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import ResultsTablePage from './resultsTablePage.js';
import LoginPage from './loginPage.js';
import JudgingPage from './judgingPage.js';
import TempHome from './tempHome.js';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TempHome />}/>
        <Route path="/results" element={<ResultsTablePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/judging" element={<JudgingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App