import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Router from "./routes";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { verifyToken } from "./slices/authSlice";
import { Backdrop } from "@mui/material";

function App() {
  return <Router />;
}

export default App;
