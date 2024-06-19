export type Role = 'Player 1' | 'Player 2' | 'Spectator';
export class RoomInfo {
	constructor(
		public ID: string,
		public count: number
	) {}
}

export const ENVIRONMENT_HDR = 'kloofendal_48d_partly_cloudy_puresky_2k.hdr';
export const BOX_EMPTY_COLOR = 'blue';
export const BOX_NOT_EMTPTY_COLOR = 'red';
export const BOX_WON_COLOR = 'yellow';
export const BOX_OPACITY = 0.2;
export const BOX_WON_OPACITY = 0.4;
export const STONE_SIZE = 0.95;
export const STONE_COLOR_1 = 'black';
export const STONE_COLOR_2 = 'white';
export const STONE_SELECTING_OPACITY = 0.6;
export const FRAME_THICKNESS = 0.015;
export const FRAME_COLOR = 'lightsteelblue';
export const CAMERA_POSITON_RATE = [-0.75, 0.25, -1.75];
