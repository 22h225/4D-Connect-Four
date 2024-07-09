<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { PerspectiveCamera, Vector2 } from 'three';
	import { clamp } from 'three/src/math/MathUtils.js';
	import {
		BOX_EMPTY_COLOR,
		BOX_NOT_EMTPTY_COLOR,
		BOX_WON_COLOR,
		BOX_OPACITY,
		BOX_WON_OPACITY,
		STONE_SIZE,
		STONE_COLOR_1,
		STONE_COLOR_2,
		STONE_SELECTING_OPACITY,
		FRAME_THICKNESS,
		FRAME_COLOR,
		CAMERA_POSITON_RATE
	} from '$lib/constants';
	import { x, y, z, w, result, config, currentPlayer, board, role } from './store';

	let xLength = 0;
	let yLength = 0;
	let zLength = 0;
	let wLength = 0;
	$: if ($config) [xLength, yLength, zLength, wLength] = $config.boardShape;

	let camera: PerspectiveCamera | undefined;
	$: isSelectingPositionEmpty = !$board?.[$x]?.[$y]?.[$z]?.[$w];

	export function onKeydown(e: KeyboardEvent) {
		console.log(e.key)
		if (!$result?.finished) {
			if (camera) {
				let c = new Vector2(camera.position.x, camera.position.z).normalize().angle() / Math.PI;
				let aPressed = Number(e.key == 'a');
				let dPressed = Number(e.key == 'd');
				let wPressed = Number(e.key == 'w');
				let sPressed = Number(e.key == 's');

				if (0.25 <= c && c < 0.75) {
					x.update((n) => clamp(n - aPressed + dPressed, 0, xLength - 1));
					z.update((n) => clamp(n - wPressed + sPressed, 0, zLength - 1));
				} else if (0.75 <= c && c < 1.25) {
					z.update((n) => clamp(n - aPressed + dPressed, 0, zLength - 1));
					x.update((n) => clamp(n + wPressed - sPressed, 0, xLength - 1));
				} else if (1.25 <= c && c < 1.75) {
					x.update((n) => clamp(n + aPressed - dPressed, 0, xLength - 1));
					z.update((n) => clamp(n + wPressed - sPressed, 0, zLength - 1));
				} else {
					z.update((n) => clamp(n + aPressed - dPressed, 0, zLength - 1));
					x.update((n) => clamp(n - wPressed + sPressed, 0, xLength - 1));
				}
			}

			w.update((n) => clamp(n + Number(e.key == 'e') - Number(e.key == 'q'), 0, wLength - 1));
			y.update((n) =>
				clamp(n + Number(e.key == ' ') - Number(e.key == 'Shift'), 0, yLength - 1)
			);
		}
	}
</script>

<svelte:window on:keydown={onKeydown} />

<!-- Cube -->
<T.Group>
	{#if !$result?.finished}
		<!-- Selecting -->
		<T.Sprite position={[$x - (xLength - 1) / 2, $y - (yLength - 1) / 2, $z - (zLength - 1) / 2]}>
			<T.RingGeometry
				args={[($w / wLength / 2) * STONE_SIZE, (($w + 1) / wLength / 2) * STONE_SIZE, 32]}
			/>
			<T.SpriteMaterial
				color={$role == 'Player 1' || ($role == null && $currentPlayer?.index == 0)
					? STONE_COLOR_1
					: STONE_COLOR_2}
				opacity={STONE_SELECTING_OPACITY}
				transparent={true}
			/>
		</T.Sprite>
		<T.Mesh
			renderOrder={1}
			position={[$x - (xLength - 1) / 2, $y - (yLength - 1) / 2, $z - (zLength - 1) / 2]}
		>
			<T.BoxGeometry args={[1 - FRAME_THICKNESS, 1 - FRAME_THICKNESS, 1 - FRAME_THICKNESS]} />
			<T.MeshBasicMaterial
				color={isSelectingPositionEmpty ? BOX_EMPTY_COLOR : BOX_NOT_EMTPTY_COLOR}
				opacity={BOX_OPACITY}
				transparent={true}
				depthWrite={false}
			/>
		</T.Mesh>
	{:else}
		<!-- Won -->
		{#if $result.stones}
			{#each $result.stones
				.map((stone) => stone.position)
				.filter((p, i, ps) => ps.filter((q, j) => p[0] == q[0] && p[1] == q[1] && p[2] == q[2] && i < j).length == 0) as position}
				<T.Mesh
					renderOrder={1}
					position={[
						position[0] - (xLength - 1) / 2,
						position[1] - (yLength - 1) / 2,
						position[2] - (zLength - 1) / 2
					]}
				>
					<T.BoxGeometry args={[1 - FRAME_THICKNESS, 1 - FRAME_THICKNESS, 1 - FRAME_THICKNESS]} />
					<T.MeshBasicMaterial
						color={BOX_WON_COLOR}
						opacity={BOX_WON_OPACITY}
						transparent={true}
						depthWrite={false}
					/>
				</T.Mesh>
			{/each}
		{/if}
	{/if}

	<!-- Stone -->
	{#if $board}
		{#each $board.flat(3) as stone}
			{#if stone}
				{@const [x, y, z, w] = stone.position}
				<T.Sprite
					renderOrder={2}
					position={[x - (xLength - 1) / 2, y - (yLength - 1) / 2, z - (zLength - 1) / 2]}
				>
					<T.RingGeometry
						args={[(w / wLength / 2) * STONE_SIZE, ((w + 1) / wLength / 2) * STONE_SIZE, 32]}
					/>
					<T.SpriteMaterial color={stone.player.index == 0 ? STONE_COLOR_1 : STONE_COLOR_2} />
				</T.Sprite>
			{/if}
		{/each}
	{/if}

	<!-- Frame -->
	{#each { length: yLength + 1 } as _, y}
		{#each { length: zLength + 1 } as _, z}
			<T.Mesh renderOrder={3} position.y={y - yLength / 2} position.z={z - zLength / 2}>
				<T.BoxGeometry args={[xLength, FRAME_THICKNESS, FRAME_THICKNESS]} />
				<T.MeshStandardMaterial color={FRAME_COLOR} />
			</T.Mesh>
		{/each}
	{/each}
	{#each { length: zLength + 1 } as _, z}
		{#each { length: xLength + 1 } as _, x}
			<T.Mesh renderOrder={3} position.x={x - xLength / 2} position.z={z - zLength / 2}>
				<T.BoxGeometry args={[FRAME_THICKNESS, yLength, FRAME_THICKNESS]} />
				<T.MeshStandardMaterial color={FRAME_COLOR} />
			</T.Mesh>
		{/each}
	{/each}
	{#each { length: xLength + 1 } as _, x}
		{#each { length: yLength + 1 } as _, y}
			<T.Mesh renderOrder={3} position.x={x - xLength / 2} position.y={y - yLength / 2}>
				<T.BoxGeometry args={[FRAME_THICKNESS, FRAME_THICKNESS, zLength]} />
				<T.MeshStandardMaterial color={FRAME_COLOR} />
			</T.Mesh>
		{/each}
	{/each}
</T.Group>

<T.PerspectiveCamera
	bind:ref={camera}
	makeDefault
	position={[
		xLength * CAMERA_POSITON_RATE[0],
		yLength * CAMERA_POSITON_RATE[1],
		zLength * CAMERA_POSITON_RATE[2]
	]}
	on:create={({ ref }) => {
		ref.lookAt(0, 0, 0);
	}}
>
	<OrbitControls enablePan={false} />
</T.PerspectiveCamera>
