export interface APIResponse {
  status: "success" | "error";
  message: string;
}

export interface PaginatedResponse<Data> extends SuccessDataResponse<Data> {
  count?: number;
  next?: {
    page: number;
    limit: number;
  };
  prev?: {
    page: number;
    limit: number;
  };
}

export interface SuccessDataResponse<Data> extends APIResponse {
  data: Data;
}

export interface VerifyTokenResponse {
  id: string;
  username: string;
}

export interface CreateTokenResponse extends VerifyTokenResponse {
  token: string;
}

interface Client {
  id: string;
  client_id: string;
  username: string;
}

export interface RoomResponse {
  id: string;
  player1: string;
  player2: string;
  player1_username: string;
  player2_username: string;
  game_state: string;
  active: "yes" | "no";
}
