<script lang="ts">
	import 'normalize.css';
	import { Canvas } from '@threlte/core';
	import { Environment } from '@threlte/extras';
	import { io } from 'socket.io-client';
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
	import { ENVIRONMENT_HDR, type Role } from '$lib/constants';
	import back_arrow_icon from '$lib/images/back-arrow-icon.svg';
	import {
		x,
		y,
		z,
		w,
		result,
		config,
		players,
		currentPlayer,
		board,
		game,
		room,
		role
	} from './store';
	import Scene from './Scene.svelte';

	$x = 0;
	$y = 0;
	$z = 0;
	$w = 0;

	let innerWidth: number, innerHeight: number;

	const socket = io();
	$room = $page.url.searchParams.get('room');

	if ($room) {
		socket.emit('init', $room);

		socket.on(
			'init',
			(
				roleRaw: Role,
				resultRaw: typeof $result,
				configRaw: typeof $config,
				playersRaw: typeof $players,
				currentPlayerRaw: typeof $currentPlayer,
				boardRaw: typeof $board
			) => {
				$role = roleRaw;
				$result = resultRaw;
				$config = configRaw;
				$players = playersRaw;
				$currentPlayer = currentPlayerRaw;
				$board = boardRaw;
			}
		);

		socket.on(
			'playTurn',
			(
				currentPlayerRaw: typeof $currentPlayer,
				boardRaw: typeof $board,
				resultRaw: typeof $result
			) => {
				$currentPlayer = currentPlayerRaw;
				$board = boardRaw;
				if (resultRaw?.finished) $result = resultRaw;
			}
		);
	} else {
		$config = $game.config;
		$players = $game.players;
		$currentPlayer = $game.currentPlayer;
		$board = $game.board;
		$result = $game.result;
	}

	function onKeydown(e: KeyboardEvent) {
		if (!$result?.finished && e.key == 'Control') {
			if ($room) socket.emit('playTurn', $room, [$x, $y, $z, $w]);
			else {
				try {
					let resultRaw = $game.playTurn([$x, $y, $z, $w]);
					if (resultRaw.finished) result.set(resultRaw);

					$players = $game.players;
					$currentPlayer = $game.currentPlayer;
					$board = $game.board;
					$result = $game.result;
				} catch {}
			}
		}
	}

	let scene: Scene;

	function dispatchKeyboardEvent(key: string) {
		onKeydown(new KeyboardEvent('keydown', { key: key }));
		scene.onKeydown(new KeyboardEvent('keydown', { key: key }));
	}
</script>

<div class="touch">
	<table>
		<tr>
			<td></td>
			<td on:click={() => dispatchKeyboardEvent('q')}>
				<Icon icon="fluent:arrow-reply-16-filled" style="font-size: 1.5em;" />
			</td>
			<td on:click={() => dispatchKeyboardEvent(' ')}>
				<Icon icon="fluent:arrow-right-16-filled" style="font-size: 1.5em;" rotate={3} />
			</td>
			<td on:click={() => dispatchKeyboardEvent('e')}>
				<Icon icon="fluent:arrow-reply-16-filled" style="font-size: 1.5em;" hFlip={true} />
			</td>
			<td on:click={() => dispatchKeyboardEvent('w')}>
				<Icon icon="fluent:arrow-undo-16-filled" style="font-size: 1.5em;" rotate={2} />
			</td>
		</tr>
		<tr>
			<td on:click={() => dispatchKeyboardEvent('Control')}>
				<Icon icon="fluent:radio-button-16-filled" style="font-size: 1.5em;" />
			</td>
			<td on:click={() => dispatchKeyboardEvent('a')}>
				<Icon icon="fluent:arrow-right-16-filled" style="font-size: 1.5em;" rotate={2} />
			</td>
			<td on:click={() => dispatchKeyboardEvent('Shift')}>
				<Icon icon="fluent:arrow-right-16-filled" style="font-size: 1.5em;" rotate={1} />
			</td>
			<td on:click={() => dispatchKeyboardEvent('d')}>
				<Icon icon="fluent:arrow-right-16-filled" style="font-size: 1.5em;" />
			</td>
			<td on:click={() => dispatchKeyboardEvent('s')}>
				<Icon icon="fluent:arrow-undo-16-filled" style="font-size: 1.5em;" />
			</td>
		</tr>
	</table>
</div>

<svelte:window on:keydown={onKeydown} bind:innerWidth bind:innerHeight />

<Canvas size={{ width: innerWidth, height: innerHeight }}>
	<Environment files={ENVIRONMENT_HDR} isBackground={true} format="hdr" />
	{#if $config}<Scene bind:this={scene} />{/if}
</Canvas>

<div class="overlay back">
	<a href="/">
		<img src={back_arrow_icon} alt="back arrow icon" />
	</a>
</div>

<div class="overlay status">
	<table>
		<tr><td>{$players?.[0].name}</td><td>黒</td></tr>
		<tr><td>{$players?.[1].name}</td><td>白</td></tr>
		<tr><td>現在のプレイヤー</td><td>{$currentPlayer?.name}</td></tr>
		{#if $role}
			<tr><td>あなたは</td><td>{$role}</td></tr>
		{/if}
	</table>
</div>

<div class="overlay control">
	<table>
		<tr><td>左</td><td>A</td></tr>
		<tr><td>右</td><td>D</td></tr>
		<tr><td>奥</td><td>W</td></tr>
		<tr><td>手前</td><td>S</td></tr>
		<tr><td>広く</td><td>E</td></tr>
		<tr><td>狭く</td><td>Q</td></tr>
		<tr><td>上</td><td>Space</td></tr>
		<tr><td>下</td><td>Shift</td></tr>
		<tr><td>石を置く</td><td>Control</td></tr>
		<tr><td>カメラを回転移動</td><td>左クリック＆ドラッグ</td></tr>
	</table>
</div>

{#if $result?.finished}
	{#if $result.winner}
		<div class="overlay result"><p>{$result.winner.name}の勝ち！</p></div>
	{:else}
		<div class="overlay result"><p>引き分け！</p></div>
	{/if}
{/if}

<style lang="scss">
	@mixin tabletView {
		@media screen and (max-width: 1024px) {
			@content;
		}
	}

	:root {
		color: white;
	}

	.overlay {
		pointer-events: none;
		z-index: 1;
	}

	.touch {
		display: none;

		@include tabletView() {
			display: block;
			position: absolute;
			padding: 1rem;
			bottom: 0;
			right: 0;

			table tr td {
				width: 4rem;
				height: 4rem;
				text-align: center;
				background-color: rgba(25, 25, 25, 0.4);
			}
		}
	}

	.back,
	.status,
	.control {
		position: absolute;
		padding: 1rem;

		table tr td {
			padding: 0 0.5rem 0 0.5rem;
			text-align: center;
		}
	}

	.back {
		top: 0;

		a {
			pointer-events: all;
		}
	}

	.control {
		bottom: 0;
		right: 0;

		@include tabletView() {
			display: none;
		}
	}

	.status {
		top: 0;
		right: 0;
	}

	.result {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translateY(-50%) translateX(-50%);
		-webkit-transform: translateY(-50%) translateX(-50%);
		width: 100%;
		height: 5em;
		background: rgba(255, 255, 0, 0.4);

		p {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translateY(-50%) translateX(-50%);
			-webkit-transform: translateY(-50%) translateX(-50%);
			margin: 0;
			font-size: large;
			font-weight: bold;
			letter-spacing: 0.1em;
		}
	}
</style>
