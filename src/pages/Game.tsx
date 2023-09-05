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
  Card,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Chess, Move, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import AlertDialog from "../components/AlertDialog";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import WebsocketHandler from "../helpers/websocket/handler";
import { RoomPayload } from "../helpers/websocket/events";
import { clearRoom, setRoom } from "../slices/gameSlice";
import { ContentCopy } from "@mui/icons-material";
import { Client } from "../types/responses";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { AuthDialog } from "../components/AuthDialog";

const defaultError = {
  head: "Failed to initialize game",
  explanation: "Something went wrong. We could not start the game.",
};

export default function Game() {
  const auth = useAppSelector(({ auth }) => auth);
  const game = useAppSelector(({ game }) => game);

  const chess = useMemo(() => new Chess(), []);

  const [fen, setFen] = useState(chess.fen());
  const [over, setOver] = useState("");

  const [eOpen, setEOpen] = useState<{
    head: string;
    explanation: string;
  } | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const [requestingPlayers, setRequestingPlayers] = useState<Client[]>([]);
  const [playerDisconnected, setPlayerDisconnected] = useState<boolean>(false);
  const [connected, setConnected] = useState(false);
  const [unameDialogOpen, setUnameDialogOpen] = useState(false);

  const ws = useMemo(() => {
    // console.log(auth.token);
    return new WebsocketHandler(
      `${process.env.REACT_APP_WS_URL}?token=${auth.token}`
    );
  }, [auth.token]);

  console.log("GAME", game);
  const isAwaitingOpp = game.room && game.room.player1 && !game.room.player2;
  const allSet =
    game.room &&
    game.room.player1 &&
    game.room.player2 &&
    game.room.active === "yes";

  const orientation: BoardOrientation =
    game.room?.player1 === auth.id ? "white" : "black";

  const makeAMove = useCallback(
    (move: { from: string; to: string; promotion?: string | undefined }) => {
      try {
        const result = chess.move(move); // update Chess instance
        setFen(chess.fen()); // update fen state to trigger a re-render

        if (chess.isGameOver()) {
          // check if move led to "game over"
          if (chess.isCheckmate()) {
            // if reason for game over is a checkmate
            // Set message to checkmate.
            setOver(
              `Checkmate! ${chess.turn() === "w" ? "black" : "white"} wins!`
            );
            // The winner is determined by checking for which side made the last move
          } else if (chess.isDraw()) {
            // if it is a draw
            setOver("Draw"); // set message to "Draw"
          } else {
            setOver("Game over");
          }
        }

        return result;
      } catch (e) {
        return null;
      } // null if the move was illegal, the move object if the move was legal
    },
    [chess]
  );

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    if (!game.room) return false;
    // orientation is either 'white' or 'black'. game.turn() returns 'w' or 'b'
    if (chess.turn() !== orientation[0]) return false; // <- 1 prohibit player from moving piece of other player

    if (!allSet) return false; // <- 2 disallow a move if the opponent has not joined

    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
      // promotion: "q", // promote to queen where possible
    };

    const move = makeAMove(moveData);

    // illegal move
    if (move === null) return false;

    ws.sendEvent("piece_move", {
      move,
      room_id: game.room.id,
      fen: chess.fen(),
    });

    return true;
  }

  useEffect(() => {
    ws.connect();

    return function close() {
      ws.destroy();
      dispatch(clearRoom());
      chess.reset();
    };
  }, [ws, dispatch, chess]);

  useEffect(() => {
    if (auth.status !== "verified") {
      setUnameDialogOpen(true);
      return;
    }

    if (!ws.connection) return;

    ws.on("open", () => {
      console.log("-------------connection open----------------");
      // on connection open, try to join or re-join (in case of a disconnection) room
      setConnected(true);
      ws.sendEvent(
        "join_room",
        {
          room_id: params.id,
        },
        (err) => {
          setEOpen(defaultError);
        }
      );
    });

    ws.on("request_join", (data: Client) => {
      setRequestingPlayers((prev) => [...prev, data]);
    });

    ws.on("start_game", (data: RoomPayload) => {
      setRequestingPlayers([]);
      dispatch(setRoom(data));
    });

    ws.on("piece_move", (data: { room_id: string; move: Move }) => {
      makeAMove(data.move);
    });

    ws.on("conn_elsewhere", () => {
      setEOpen({
        head: "Connected elsewhere",
        explanation:
          "You've been disconnected from the game on this tab because you have joined the game from another tab.",
      });
      ws.destroy();
    });

    ws.on("close", () => {
      setConnected(false);
    });
  }, [ws, ws.connection, auth.status, auth.id, params.id, dispatch, makeAMove]);

  useEffect(() => {
    ws.on("joined_room", (room: RoomPayload) => {
      dispatch(setRoom(room));

      if (room.active === "yes") {
        try {
          chess.load(room.game_state);
          setFen(room.game_state);
        } catch (e) {
          setEOpen(defaultError);
        }
      }
    });
  }, [ws, chess, dispatch]);

  useEffect(() => {
    if (!ws.connection) return;

    ws.on("user_disconnect", (data: { user_id: string }) => {
      if ([game.room?.player1, game.room?.player2].includes(data.user_id)) {
        setPlayerDisconnected(true);
      }
    });

    ws.on("user_connect", (data: { user_id: string }) => {
      if ([game.room?.player1, game.room?.player2].includes(data.user_id)) {
        setPlayerDisconnected(false);
      }
    });

    ws.on("closing_room", (data: { room_id: string }) => {
      console.log("CLOSING ROOM:", data);
    });
  }, [game.room, ws]);

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

  if (unameDialogOpen) {
    return (
      <AuthDialog
        open={unameDialogOpen}
        handleClose={() => setUnameDialogOpen(false)}
        onComplete={(data) => {
          ws.connect()
          setUnameDialogOpen(false);
        }}
      />
    );
  }

  if (isAwaitingOpp) {
    return (
      <Backdrop
        sx={{ color: "#fff", Index: (theme) => theme.zIndex.drawer + 1 }}
        open
      >
        {requestingPlayers.length > 0 ? (
          <AlertDialog
            title="Someone requested to join"
            contentText={`The user${
              requestingPlayers.length > 1 ? "s" : ""
            } below has requested to join as your opponent. You can only select one opponent`}
            alertOnly
            extraContent={
              <List sx={{ width: "100%" }}>
                {requestingPlayers.map((player) => (
                  <ListItem
                    key={player.id}
                    secondaryAction={
                      <Button
                        onClick={() => {
                          console.log("Player ------------", player);
                          ws.sendEvent(
                            "accept_join_request",
                            {
                              room_id: game.room?.id,
                              client_id: player.client_id,
                              player_id: player.id,
                            },
                            (err) => {
                              alert(err.message);
                            }
                          );
                        }}
                      >
                        Accept
                      </Button>
                    }
                    disablePadding
                  >
                    <ListItemText primary={player.username} />
                  </ListItem>
                ))}
              </List>
            }
            open={requestingPlayers.length > 0}
          />
        ) : (
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
        )}
      </Backdrop>
    );
  }

  return allSet ? (
    <Box sx={{ p: 2, height: "100vh", width: "100%", position: "fixed" }}>
      {/* <Backdrop
        sx={{ color: "#fff", Index: (theme) => theme.zIndex.drawer + 1 }}
        open={playerDisconnected}
      >
        <CircularProgress color="inherit" />
        <Typography textAlign="center" color="#fff">
          Your opponent has been disconnected. Please wait for them to rejoin.
        </Typography>
      </Backdrop> */}
      <AlertDialog
        open={Boolean(over)}
        title={over}
        contentText={over}
        handleClose={() => {
          ws.sendEvent("close_room", {
            room_id: game.room?.id,
          });
          navigate("/");
        }}
      />

      <Stack
        justifyContent="center"
        alignItems="center"
        sx={{ width: "100%", height: "100%" }}
      >
        <Card sx={{ width: "fit-content", p: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            sx={{ width: "100%", mb: 1 }}
          >
            <Avatar />
            <Stack sx={{ ml: 1 }}>
              <Typography variant="h6">
                {game.room?.player1 !== auth.id
                  ? game.room?.player1_username
                  : game.room?.player2_username}
              </Typography>
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
              <Backdrop
                sx={{
                  color: "#fff",
                  Index: 9999,
                  zIndex: 9999,
                }}
                open={!connected || playerDisconnected}
              >
                <Stack alignItems="center" gap={1}>
                  <CircularProgress color="inherit" />
                  <Typography textAlign="center">
                    {!connected &&
                      "You've been disconnected. Retrying connection..."}
                    {connected &&
                      playerDisconnected &&
                      "Your opponent has been disconnected. Please wait for them to re-join."}
                  </Typography>
                </Stack>
              </Backdrop>

              <Chessboard
                position={fen}
                onPieceDrop={onDrop}
                boardOrientation={orientation}
                customBoardStyle={{
                  zIndex: 100,
                }}
              />
            </Box>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            sx={{ width: "100%", mt: 1 }}
          >
            <Avatar />
            <Stack sx={{ ml: 1 }}>
              <Typography variant="h6">
                {game.room?.player1 === auth.id
                  ? game.room?.player1_username
                  : game.room?.player2_username}
              </Typography>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Box>
  ) : (
    <Backdrop
      sx={{ color: "#fff", Index: (theme) => theme.zIndex.drawer + 1 }}
      open={true}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
