import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { verifyToken } from "../slices/authSlice";

export default function Verify() {

  const dispatch = useAppDispatch();

  const auth = useAppSelector(({ auth }) => auth);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) return;

    dispatch(verifyToken());
  }, [dispatch]);                                                                                                                                                                         

  return (
    auth.status === 'verifying' ? <div>Verifying...</div> : <Outlet />
  );
}