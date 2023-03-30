import { Navigate, useRoutes, useNavigate } from "react-router-dom";
import Game from "./pages/Game";

// import { useAppSelector } from "hooks/reduxHooks";
import Home from "./pages/Home";

export default function Router() {
  // const loggedIn = useAppSelector(({ auth }) => auth.loggedIn);

  return useRoutes([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/live/:id",
      element: <Game />,
    },
    // {
    //   path: "/",
    //   children: [
    //     { path: "/", element: <Navigate to="/home" /> },
    //   ],
    // },
  ]);
}
