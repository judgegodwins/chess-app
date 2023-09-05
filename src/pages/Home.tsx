import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Stack,
  Typography,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { PlayArrow, Keyboard } from "@mui/icons-material";
import UserEdu from "../svg/useredu.svg";
import { AuthDialog } from "../components/AuthDialog";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
// import { setGameInit } from "../slices/gameSlice";
import { checkRoom, createRoom } from "../services";
import { LoadingButton } from "@mui/lab";

const CustomContainer = styled("div")(({ theme }) => ({
  width: "100%",
  minHeight: "100vh",
  display: "inline-flex",
  justifyContent: "space-evenly",
  alignItems: "center",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 1rem",
  },
}));

export default function Home() {
  const [unameDialogOpen, setUnameDialogOpen] = useState(false);
  const [gameId, setGameId] = useState<string>("");
  const [joining, setJoining] = useState(false);

  const auth = useAppSelector(({ auth }) => auth);
  const navigate = useNavigate();

  const actionLine = useCallback(() => {
    switch (auth.status) {
      case "unverified":
        return setUnameDialogOpen(true);
      case "verifying":
      default:
        return;
    }
  }, [auth.status]);

  // useEffect(() => {
  //   if (!localStorage.getItem("token")) return;
  //   dispatch(verifyToken());
  // }, [dispatch]);

  return (
    <CustomContainer>
      <AuthDialog
        open={unameDialogOpen}
        handleClose={() => setUnameDialogOpen(false)}
        onComplete={(data) => {
          setUnameDialogOpen(false);
        }}
      />
      <Box>
        <Typography variant="h4" gutterBottom>
          Play chess with your friends.
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Start a new game and share the link with a friend to join the game
        </Typography>
        <Stack
          direction="row"
          mt={4}
          sx={(theme) => ({
            [theme.breakpoints.down("sm")]: {
              flexDirection: "column",
            },
            [theme.breakpoints.down("md")]: {
              mb: 2,
            },
          })}
        >
          <Button
            disabled={auth.status === "verifying"}
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={() => {
              if (auth.status === "verified") {
                createRoom().then((data) => {
                  navigate(`/live/${data.id}`);
                });
              } else {
                actionLine();
              }
            }}
          >
            New game
          </Button>
          <Stack
            direction="row"
            sx={(theme) => ({
              ml: 3,
              [theme.breakpoints.down("sm")]: {
                ml: 0,
                my: 2,
              },
            })}
          >
            <TextField
              id="game-id"
              disabled={auth.status === "verifying"}
              label="Game ID"
              variant="outlined"
              onChange={(e) => setGameId(e.target.value)}
              sx={{
                flexGrow: 1,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Keyboard />
                  </InputAdornment>
                ),
              }}
            />
            {gameId && (
              <LoadingButton
                loading={joining}
                variant="text"
                sx={{ ml: 1 }}
                disabled={gameId.length < 1}
                onClick={() => {
                  setJoining(true);
                  if (auth.status === "verified") {
                    checkRoom(gameId)
                      .then((data) => {
                        setJoining(false);
                        navigate(`/live/${data.id}`);
                      })
                      .catch((err) => {
                        console.log("err verifying room", err);
                        setJoining(false);
                      });
                  } else {
                    actionLine();
                    setJoining(false);
                  }
                }}
              >
                Join
              </LoadingButton>
            )}
          </Stack>
        </Stack>
      </Box>
      <Box>
        <img src={UserEdu} alt="description" />
      </Box>
    </CustomContainer>
  );
}
