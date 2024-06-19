<script lang="ts">
	import type { RoomInfo } from '$lib/constants';
	import 'normalize.css';
	import { io } from 'socket.io-client';
	const socket = io();

	socket.emit('getRooms');


	let roomInfoArray: RoomInfo[] = [];
	socket.on('getRooms', (roomInfoArrayRaw) => {
		roomInfoArray = roomInfoArrayRaw;
    console.log(roomInfoArray)
	});

	let value: string = '';
</script>

<main>
	<header>
		<h1>４次元４目並べ</h1>
	</header>

	<div class="button-container">
		<div>
			<h2>Offline</h2>
			<a href="/play">
				<button type="button">Play Offline</button>
			</a>
		</div>
		<div class="online">
			<h2>Online</h2>
			<p>room ID</p>
			<input bind:value type="text" name="room" id="room" autocomplete="off" />
			<a href="/play?room={value}">
				<button type="button">Play Online</button>
			</a>
			<table>
				<tr>
					<th>room ID</th>
					<th>player count</th>
					<th></th>
				</tr>
				{#each roomInfoArray as roomInfo}
					<tr>
						<td>{roomInfo.ID}</td>
						<td>{roomInfo.count}</td>
						<td><a href="/play?room={roomInfo.ID}">join</a></td>
					</tr>
				{/each}
				<tr></tr>
			</table>
		</div>
	</div>
</main>

<style lang="scss">
	:global(:root) {
		background-color: rgb(36, 36, 36);
		color: white;
	}

	:global(body) {
		margin: 0;
	}

	:global(a) {
		color: white;
		text-decoration: none;
	}

	main {
		text-align: center;
	}

	.button-container {
		display: flex;
		justify-content: space-around;

		& > div {
			width: 50%;

			& > a {
				display: block;
				margin: 1rem;
			}
		}
	}

	.online {
		text-align: center;

		table {
			width: 100%;
			padding: 2rem;

      a {
        display: block;
        width: 100%;
      }

			th,
			td {
				border: solid 1px black;
				width: 40%;
			}

			th {
				background-color: rgb(28, 28, 28);
			}
		}
	}
</style>
