import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { verifyToken } from "../slices/authSlice";
import { CircularProgress, Stack, Typography } from "@mui/material";

export default function Verify() {
  const dispatch = useAppDispatch();

  const auth = useAppSelector(({ auth }) => auth);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    dispatch(verifyToken());
  }, [dispatch]);

  return auth.status === "verifying" ? (
    <Stack
      sx={{
        width: "100vw",
        height: "100vh",
      }}
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      <CircularProgress />
      <Typography textAlign="center">
        Please wait while the app loads 🥹. The backend server is deployed on a
        free instance and is probably just waking up.
      </Typography>
    </Stack>
  ) : (
    <Outlet />
  );
}
