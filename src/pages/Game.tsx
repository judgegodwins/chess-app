import {
  Avatar,
  Box,
  Stack,
  Typography,
  Backdrop,
  CircularProgress,
  Chip,
  List,
  Button,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import AlertDialog from "../components/AlertDialog";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { newEvent } from "../helpers/websocket/utils";
import WebsocketHandler from "../helpers/websocket/handler";
import { RoomPayload } from "../helpers/websocket/events";
import { setRoom } from "../slices/gameSlice";
import { ContentCopy } from "@mui/icons-material";
import ConfirmDialog from "../components/ConfirmDialog";
import { Client } from "../types/responses";

export default function Game() {
  const auth = useAppSelector(({ auth }) => auth);
  const game = useAppSelector(({ game }) => game);

  const chess = useMemo(() => new Chess(game.room?.game_state), []);
  // const gameInit = useAppSelector(({ game }) => game.gameInit);
  const [eOpen, setEOpen] = useState<{
    head: string;
    explanation: string
  } | null>(null);

  const [joined, setJoined] = useState(false);
  const [allset, setAllset] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const [requestingPlayers, setRequestingPlayers] = useState<Client[]>([]);

  console.log("location", params);

  const ws = useMemo(() => {
    // console.log(auth.token);
    return new WebsocketHandler(
      `${process.env.REACT_APP_WS_URL}?token=${auth.token}`
    );
  }, [auth.token]);

  useEffect(() => {
    if (auth.status !== "verified") {
      console.log('auth.status', auth.status);
      setEOpen({
        head: "Failed to initialize game",
        explanation: "Something went wrong. We could not start the game."
      });
      return;
    }

    ws.connect();

    ws.connection.onopen = () => {
      ws.sendEvent("join_room", {
        room_id: params.id,
      });

      ws.on("joined_room", (data: RoomPayload) => {
        console.log("joined", data);
        dispatch(setRoom(data));
        setJoined(true);
      });

      ws.on("requested_join", (data: Client) => {
        setRequestingPlayers((prev) => [...prev, data]);
      });

      ws.on("start_game", (data: Client) => {
        setRequestingPlayers([]);
        setAllset(true)
        setJoined(true)
      });

      ws.on('conn_elsewhere', () => {
        setEOpen({
          head: "Connected elsewhere",
          explanation: "You've been disconnected from the game on this tab because you have joined the game from another tab."
        });
      })
    };

    return function close() {
      ws.destroy();
    };
  }, [ws, auth.status, params.id, dispatch]);

  // useEffect(() => {
  //   if (auth.status !== "verified") {
  //     setEOpen(true);
  //   }
  // }, [auth.status]);

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
        title={eOpen.head}
        contentText={eOpen.explanation}
        open={Boolean(eOpen)}
        handleClose={() => {
          navigate("/");
        }}
      />
    );
  }

  return joined ? (
    <>
      <AlertDialog
        title="Someone requested to join"
        contentText={`The user${requestingPlayers.length > 1 ? 's' : ''} below has requested to join as your opponent. You can only select one opponent`}
        alertOnly
        extraContent={
          <List sx={{ width: "100%" }}>
            {requestingPlayers.map((player) => (
              <ListItem
                key={player.id}
                secondaryAction={<Button onClick={() => {
                  ws.sendEvent("accept_join_request", {
                    room_id: game.room?.id,
                    player_id: player.socket_id,
                  });
                }}>Accept</Button>}
                disablePadding
              >
                <ListItemText primary={player.username} />
              </ListItem>
            ))}
          </List>
        }
        open={requestingPlayers.length > 0}
      />
      {allset ? (
        <Box sx={{ p: 2, height: "100vh", width: "100%", position: "fixed" }}>
          <Stack
            justifyContent="center"
            alignItems="center"
            sx={{ width: "100%", height: "100%" }}
          >
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
      ) : (
        <Backdrop
          sx={{ color: "#fff", Index: (theme) => theme.zIndex.drawer + 1 }}
          open={true}
        >
          <AlertDialog
            open={true}
            title="Waiting for other player"
            contentText="Please wait for a player to join the room. You can share the link below with a friend to join:"
            extraContent={
              <Chip
                icon={<ContentCopy />}
                label={window.location.href}
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard
                      .writeText(window.location.href)
                      .catch(console.log);
                  }
                }}
              />
            }
            alertOnly
          />
        </Backdrop>
      )}
    </>
  ) : (
    <Backdrop
      sx={{ color: "#fff", Index: (theme) => theme.zIndex.drawer + 1 }}
      open={true}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
