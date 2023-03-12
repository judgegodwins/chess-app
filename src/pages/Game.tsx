import { Avatar, Box, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import AlertDialog from "../components/AlertDialog";
import { useAppSelector } from "../hooks/redux";
import { newEvent } from "../helpers/websocket/utils";
import WebsocketHandler from "../helpers/websocket/handler";

export default function Game() {
  const chess = useMemo(() => new Chess(), []);
  const gameInit = useAppSelector(({ game }) => game.gameInit);
  const [eOpen, setEOpen] = useState(false);

  const [allSet, setAllSet] = useState(false);

  const auth = useAppSelector(({ auth }) => auth);
  const navigate = useNavigate();

  const ws = useMemo(
    () => {
      // console.log(auth.token);
      return new WebsocketHandler(
        `${process.env.REACT_APP_WS_URL}?token=${localStorage.getItem('token')}`
      );
    },
    []
  );

  useEffect(() => {
    ws.connect();

    return function close() {
      ws.connection.close(1000, 'unmounting component');
    }
  }, [ws]);

  useEffect(() => {
    if (
      auth.status !== "verified" ||
      (gameInit?.action === "join" && !gameInit.actionData?.gameId)
    ) {
      setEOpen(true);
    }
  }, [auth.status, gameInit?.action, gameInit?.actionData]);

  // useEffect(() => {
  //   try {
  //     if (ws) {
  //       ws.connection.onopen = () => {
  //         if (gameInit && gameInit.action === "start") {
  //           ws.sendEvent("create_room", {
  //             gameState: chess.fen(),
  //           });
  //         }
  //       };

  //       // setTimeout(() => {
  //       //   ws.connection.close(1000)
  //       // }, 5000)

  //       ws.on("error", console.log);
  //     }
  //     // TODO CHECK FOR WEBSOCKET SUPPORT BEFORE INITING
  //     // TODO HANDLE WEBSOCKET ERROR AND ABRUPT CLOSURE (ADD RETRIES).
  //     // conn.onerror = (e) => {
  //     //   console.log(e.type)
  //     // }

  //   } catch (e) {
  //     setEOpen(true);
  //   }
  // }, [ws, chess, gameInit]);

  if (eOpen) {
    // if any error occurred
    return (
      <AlertDialog
        title="Failed to initialize game"
        contentText="Something went wrong. We could not start the game."
        open={eOpen}
        handleClose={() => {
          navigate("/");
        }}
      />
    );
  }

  return (
    <Box sx={{ p: 2, height: "100vh", width: "100%", position: "fixed" }}>
      <Stack
        justifyContent="center"
        alignItems="center"
        sx={{ width: "100%", height: "100%" }}
      >
        <button onClick={() => setAllSet((prev) => !prev)}>ygy</button>
        <Box sx={{ width: "fit-content" }}>
          <Stack direction="row" sx={{ width: "100%", mb: 1 }}>
            <Avatar />
            <Stack sx={{ ml: 1 }}>
              <Typography variant="subtitle1">Martin</Typography>
            </Stack>
          </Stack>
          <Stack direction="row">
            <Box
              sx={(theme) => ({
                width: "40vw",
                height: "100%",
                [theme.breakpoints.down("md")]: {
                  width: "100vw",
                },
              })}
            >
              <Chessboard />
            </Box>
          </Stack>
          <Stack direction="row" sx={{ width: "100%", mt: 1 }}>
            <Avatar />
            <Stack sx={{ ml: 1 }}>
              <Typography variant="subtitle1">Judge</Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
