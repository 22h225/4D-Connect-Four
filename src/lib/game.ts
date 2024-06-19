// Constants for possible directions in 4D space
const VALUES = [0, 1, -1];
const DIRECTIONS = VALUES.map((dx) =>
	VALUES.map((dy) => VALUES.map((dz) => VALUES.map((dw) => [dx, dy, dz, dw])))
)
	.flat(3)
	.slice(1);


// Type definitions for a 4-dimensional number array
export type Number4D = [number, number, number, number];

// Type definitions for a game result
export type Result = {
	finished: boolean;
	winner: Player | undefined;
	stones: Stone[] | undefined;
};

// Interface for game configuration
export interface Config {
	kCount: number;
	boardShape: Number4D;
}

// Default game configuration
export const configDefault: Config = {
	kCount: 4,
	boardShape: [4, 4, 4, 4]
};

// Custom error classes for specific game errors
export class BoardRangeError extends Error {
	static {
		this.prototype.name = 'BoardRangeError';
	}
}

export class PositionOverlapError extends Error {
	static {
		this.prototype.name = 'PositionOverlapError';
	}
}

export class FinishedGameError extends Error {
	static {
		this.prototype.name = 'FinishedGameError';
	}
}

// Class representing a player
export class Player {
	constructor(
		public index: 0 | 1,
		public name: string
	) {}
}

// Class representing a stone placed by a player
export class Stone {
	constructor(
		public player: Player,
		public position: Number4D
	) {}
}

// Main game class
export class Game {
	players: [Player, Player];
	currentPlayer: Player;
	board: (Stone | null)[][][][] = [];
	result: Result = {
		finished: false,
		winner: undefined,
		stones: undefined
	};

	// Initialize the game with the given configuration or default configuration
	constructor(public config = configDefault) {
		this.players = [new Player(0, 'Player 1'), new Player(1, 'Player 2')];
		this.currentPlayer = this.players[0];

		// Initialize the 4D board with null (no stones placed)
		for (let x = 0; x < this.config.boardShape[0]; x++) {
			this.board[x] = [];

			for (let y = 0; y < this.config.boardShape[1]; y++) {
				this.board[x][y] = [];

				for (let z = 0; z < this.config.boardShape[2]; z++) {
					this.board[x][y][z] = [];

					for (let w = 0; w < this.config.boardShape[3]; w++) {
						this.board[x][y][z][w] = null;
					}
				}
			}
		}
	}

	// Handle a player's turn
	playTurn(stonePosition: Number4D): Result {
		let stone = this.placeStone(this.currentPlayer, stonePosition);
		let result = this.judge(this.currentPlayer, stone);

		// Switch to the other player if the game is not finished
		if (!result.finished) this.currentPlayer = this.players[this.currentPlayer.index ^ 1];
		return result;
	}

	// Place a stone on the board
	placeStone(player: Player, position: Number4D): Stone {
		let [x, y, z, w] = position;
		let cell = this.board?.[x]?.[y]?.[z]?.[w];

		// Check for various errors
		if (cell === undefined) throw new BoardRangeError();
		else if (cell !== null) throw new PositionOverlapError();
		else if (this.result.finished) throw new FinishedGameError();
		else {
			let stone = new Stone(player, position);
			this.board[x][y][z][w] = stone;
			return stone;
		}
	}

	// Judge the game state after a stone is placed
	judge(player: Player, stone: Stone): Result {
		let [x, y, z, w] = stone.position;
		let stones: Stone[] = [stone];

		// Check all possible directions for a winning line
		for (let direction of DIRECTIONS) {
			let count = 1;

			for (let m = 1; m < this.config.kCount; m++) {
				let mx = x + m * direction[0];
				let my = y + m * direction[1];
				let mz = z + m * direction[2];
				let mw = w + m * direction[3];

				if (this.board[mx]?.[my]?.[mz]?.[mw]?.player !== stone.player) break;
				count++;
			}

			// If a winning line is found
			if (count === this.config.kCount) {
				for (let n = 1; n < this.config.kCount; n++) {
					let nx = x + n * direction[0];
					let ny = y + n * direction[1];
					let nz = z + n * direction[2];
					let nw = w + n * direction[3];

					let nstone = this.board[nx][ny][nz][nw];
					if (nstone) stones.push(nstone);
				}
				break;
			}
		}

		// Check if the game is won
		if (stones.length === this.config.kCount) {
			this.result = {
				finished: true,
				winner: player,
				stones: stones
			};
			return this.result;
		}

		// Check if the game is a draw
		else if (this.board.flat(3).filter((cell) => cell === null).length == 0) {
			this.result = {
				finished: true,
				winner: undefined,
				stones: undefined
			};
			return this.result;
		}

		// Continue the game if no win or draw
		else return this.result;
	}
}
