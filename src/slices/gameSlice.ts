import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RoomResponse } from "../types/responses";

export interface GameState {
  room?: RoomResponse;
}

const initialState: GameState = {
  room: undefined,
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setRoom: (state, action: PayloadAction<RoomResponse>) => {
      console.log("ACTION PAYLOAD", action.payload)
      state.room = action.payload;
    },
    clearRoom: (state) => {
      state.room = undefined;
    }
  },
});

export const { setRoom, clearRoom } = gameSlice.actions;

export default gameSlice.reducer;
