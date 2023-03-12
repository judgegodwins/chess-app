import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface GameState {
  gameInit?: {
    action: "start" | "join" | "";
    actionData?: {
      gameId: string;
    };
  };
}

const initialState: GameState = {
  gameInit: {
    action: ""
  },
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGameInit: (state, action: PayloadAction<GameState["gameInit"]>) => {
      state.gameInit = action.payload;
    },
  },
});

export const { setGameInit } = gameSlice.actions;

export default gameSlice.reducer;
