import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { Server, type ServerOptions } from 'socket.io';
import type { ViteDevServer } from 'vite';
import { Game, type Number4D } from './src/lib/game';
import { RoomInfo, type Role } from './src/lib/constants';

const socketio = {
	name: 'socket.io server',
	configureServer(server: ViteDevServer) {
		const io = new Server(server.httpServer as Partial<ServerOptions> | undefined);

		class Room {
			public game = new Game();
			public player_1 = '';
			public player_2 = '';
			public spectators: string[] = [];
		}

		const rooms: { [id: string]: Room } = {};
		const roomSuffix = 'room';

		io.on('connection', (socket) => {
			socket.on('getRooms', () => {
				socket.join('getRooms');
				socket.emit(
					'getRooms',
					Object.keys(rooms).map((roomID) => {
						let room = rooms[roomID];
						let count = 0;
						if (room.player_1 != '') count++;
						if (room.player_2 != '') count++;
						count += room.spectators.length;

						return new RoomInfo(roomID, count);
					}),
				);
			});

			socket.on('init', (roomID: string) => {
				socket.join(roomSuffix + roomID);

				if (!Object.keys(rooms).includes(roomID)) {
					rooms[roomID] = new Room();
				}

				let room = rooms[roomID];
				let game = room.game;
				let role: Role;

				if (room.player_1 == '') {
					room.player_1 = socket.id;
					role = 'Player 1';
				} else if (room.player_2 == '') {
					room.player_2 = socket.id;
					role = 'Player 2';
				} else {
					room.spectators.push(socket.id);
					role = 'Spectator';
				}

				io.to('getRooms').emit('getRooms', Object.keys(rooms));
				socket.emit(
					'init',
					role,
					game.result,
					game.config,
					game.players,
					game.currentPlayer,
					game.board
				);
			});

			socket.on('playTurn', (roomId: string, stonePosition: Number4D) => {
				try {
					let room = rooms[roomId];
					let game = room.game;

					if (
						(room.player_1 == socket.id && game.currentPlayer.index == 0) ||
						(room.player_2 == socket.id && game.currentPlayer.index == 1)
					) {
						let result = game.playTurn(stonePosition);
						io.to(roomSuffix + roomId).emit('playTurn', game.currentPlayer, game.board, result);
					}
				} catch (e) {
					socket.emit('error', e);
				}
			});

			socket.on('disconnect', () => {
				Object.keys(rooms)
					.filter(
						(roomID) =>
							rooms[roomID].player_1 == socket.id ||
							rooms[roomID].player_2 == socket.id ||
							rooms[roomID].spectators.includes(socket.id)
					)
					.forEach((roomID) => {
						let room = rooms[roomID];
						if (room.player_1 == socket.id) room.player_1 = '';
						else if (room.player_2 == socket.id) room.player_2 = '';
						else room.spectators = room.spectators.filter((id) => id != socket.id);

						if (room.player_1 == '' && room.player_2 == '' && room.spectators.length == 0)
							delete rooms[roomID];
					});
			});
		});
	}
};

export default defineConfig({
	plugins: [sveltekit(), socketio],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
