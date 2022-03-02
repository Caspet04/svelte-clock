<script>
	import "./css/main.css";
	import "./css/background.css";

	import { bubbles } from './background.js';
	import { fly } from 'svelte/transition';
	import { spring } from 'svelte/motion';
	import { range } from './js/utility.js';
	import { Clock } from "./js/clock";
	import { timezones } from './timezones.js';

	let clocks = [
		new Clock(),
		new Clock(),
		new Clock()
	];

	let timeString = [
		"0", "0", ":", "0", "0", ":", "0", "0"
	]

	let selectedTimezone = [
		null, null, null
	];

    let clockConfigOverlayHidden = true;
	let alarmTriggerOverlayHidden = true; 
	
	// NOTE: Consider moving to another file
	const stripSizes = [3, 10, 6, 10, 6, 10];
	const stripHoleSize = 4;
	const stripHolePadding = 0.5;
	const stripHoleGap = 2;
	const stripSidePadding = 1;
	const stripHeightPadding = 1;
	const stripWidth = stripHoleSize*6 + stripHolePadding*3 + stripHoleGap*2 + stripSidePadding*2;

	// NOTE: It's really difficult to use a list of springs for some reason, and I can't be bothered to mess with it anymore
	let stripYOffset = [0, 0, 0, 0, 0, 0];
	let stripYSpring0 = spring(0, {damping: 0.4, stiffness: 0.2});
	let stripYSpring1 = spring(0, {damping: 0.4, stiffness: 0.2});
	let stripYSpring2 = spring(0, {damping: 0.4, stiffness: 0.2});
	let stripYSpring3 = spring(0, {damping: 0.4, stiffness: 0.2});
	let stripYSpring4 = spring(0, {damping: 0.4, stiffness: 0.2});
	let stripYSpring5 = spring(0, {damping: 0.4, stiffness: 0.2});

	setInterval(() => {
		for (let i = 0; i < 3; i++) {
			if (selectedTimezone[i] != null) {
				clocks[i].timezone = selectedTimezone[i];
			}
			clocks[i].syncTime();
			clocks[i].updateAlarm();
			clocks[i] = clocks[i];
		}
		
		for (let i = 0; i < 8; i++) {
			timeString[i] = clocks[1].timeAsString[i];
		}
		
		stripYSpring0.set(clocks[2].getDigit(0));
		stripYSpring1.set(clocks[2].getDigit(1));
		stripYSpring2.set(clocks[2].getDigit(2));
		stripYSpring3.set(clocks[2].getDigit(3));
		stripYSpring4.set(clocks[2].getDigit(4));
		stripYSpring5.set(clocks[2].getDigit(5));

		stripYOffset[0] = $stripYSpring0;
		stripYOffset[1] = $stripYSpring1;
		stripYOffset[2] = $stripYSpring2;
		stripYOffset[3] = $stripYSpring3;
		stripYOffset[4] = $stripYSpring4;
		stripYOffset[5] = $stripYSpring5;
	}, 1);

	$: {
		let temp = true;
		for (let i = 0; i < 3; i++) {
			if (clocks[i].alarmIsTriggered) {
				temp = false;
			}
		}

		alarmTriggerOverlayHidden = temp;
	}
	
	$: outerWidth = 0
	$: innerWidth = 0
	$: outerHeight = 0
	$: innerHeight = 0

	clocks[0].alarmText = innerWidth > 800 ? "Left Alarm"  : "Top Alarm";
	clocks[1].alarmText = "Center Alarm";
	clocks[2].alarmText = innerWidth > 800 ? "Right Alarm" : "Bottom Alarm";
</script>

<!-- This binds the window dimensions to variables -->
<svelte:window bind:innerWidth bind:outerWidth bind:innerHeight bind:outerHeight />

<!-- TODO: Add more comments describing what happens and organize it so it is more legible -->
<main>
	<div id="background-animation">
		{#each bubbles as bubble}
			<span class="bubble" style="--x: {bubble.x}%; --y: {bubble.y}px; --size: {bubble.size}; --rise-speed: {bubble.riseSpeed}s; --sway-speed: {bubble.swaySpeed}s; --animation-offset: {bubble.animationOffset}s" />
		{/each}
	</div>

	{#if !clockConfigOverlayHidden || !alarmTriggerOverlayHidden }
		<div id="overlay">
			{#if !clockConfigOverlayHidden}
				<div id="clock-config-overlay-content">
					<button id="clock-config-overlay-close-button" on:click="{() => { clockConfigOverlayHidden = true; }}">Close</button>
					{#each range(0, 3, 1) as i}
						<div id="clock-{i+1}">
							<h2>
								{ [
									innerWidth > 800 ? "Left Clock" : "Top Clock",
									"Center Clock",
									innerWidth > 800 ? "Right Clock" : "Bottom Clock"
									][i] }
							</h2>
							<div class="clock-controls">
								<span>Timezone: </span>
								<select class="timezone-selector" bind:value={selectedTimezone[i]} name="timezone" id="clock-{i}-timezone">
									{#each timezones as timezone}
										<option value="{timezone.value}">{timezone.label}</option>
									{/each}
								</select>
								<label>Alarm: <input type="checkbox" bind:checked={clocks[i].alarmIsActive}></label>
								<input class="alarm-time" type="time" bind:value={clocks[i].alarmTimeAsString}>
								<span>Alarm Name: </span>
								<input type="text" bind:value={clocks[i].alarmText}>
							</div>
						</div>
					{/each}
				</div>
			{:else if !alarmTriggerOverlayHidden}
				<div id="alarm-trigger-overlay-content">
					{#each range(0, 3, 1) as i}
						{#if clocks[i].alarmIsTriggered }
							<h1 class="alarm-text">{clocks[i].alarmText}</h1>
							<div class="alarm-controls">
								<button on:click={()=>{ clocks[i].reset()  }}>Reset Alarm</button>
								<button on:click={()=>{ clocks[i].snooze() }}>Snooze (5 min)</button>
								<button on:click={()=>{ clocks[i].stop()   }}>Stop Alarm</button>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<div id="panel">
		<ul>
			<li><button on:click="{() => { clockConfigOverlayHidden = false; }}">Config Clocks</button></li>
		</ul>
	</div>
	<div id="clock-container">
		<!-- "Normal" analog style clock -->
		<div class="clock" id="analog">
			<svg viewBox='-50 -50 100 100'>
				<!-- Clock markers, alternating larger and smaller every 5th marker -->
				{#each range(0, 60, 1) as marker}
					<line class='marker-{marker % 5 == 0 ? "large" : "small"}'
						y1='{45 - (marker % 5 == 0 ? 10 : 5)}'
						y2='45'
						transform='rotate({6 * marker})' />
				{/each}
				<!-- Clock numbers, they are rotated to place them in a circle and then the text is rotated back -->
				{#each range(1, 13, 1) as clockNumber}
					<g transform='rotate({-180+30*clockNumber})'>
						<text
							transform='rotate({180-30*clockNumber},0,29)'
							text-anchor='middle'
							y='32'>
							{clockNumber}
						</text>
					</g>
				{/each}
	
				<!-- Hour hand -->
				<line class='hand' id='hour'
					y1='-5'
					y2='35'
					transform='rotate({180 + 30 * clocks[0].hour})' />
	
				<!-- Minute hand -->
				<line class='hand' id='minute'
					y1='-7'
					y2='45'
					transform='rotate({180 + 6 * clocks[0].minute})' />
	
				<!-- Second hand -->
				<line class='hand' id='second'
					y1='-10'
					y2='45'
					transform='rotate({180 + 6 * clocks[0].second})' />
	
				<!-- Outside circle -->
				{#key clocks[0].second}
				<circle class='clock-outside fill-flash'
					cx='0'
					cy='0'
					r='45' />
				{/key}
			</svg>
		</div>
		<div class="clock" id="digital">
			{#key timeString[0]}<span in:fly="{{y: -20}}">{timeString[0]}</span>{/key}
			{#key timeString[1]}<span in:fly="{{y: -20}}">{timeString[1]}</span>{/key}
			:
			{#key timeString[3]}<span in:fly="{{y: -20}}">{timeString[3]}</span>{/key}
			{#key timeString[4]}<span in:fly="{{y: -20}}">{timeString[4]}</span>{/key}
			:
			{#key timeString[6]}<span in:fly="{{y: -20}}">{timeString[6]}</span>{/key}
			{#key timeString[7]}<span in:fly="{{y: -20}}">{timeString[7]}</span>{/key}
		</div>
		<div class="clock" id="strip">
			<svg viewBox='0 {innerWidth > 800 ? (20*stripHoleSize + stripHeightPadding*2)/-2 : -10} {stripWidth+2} {innerWidth > 800 ? 20*stripHoleSize + stripHeightPadding*2 : 20}' width='100%' height='100%'>
				{#each range(0, 6, 1) as i}
					<g transform="translate({1 + stripSidePadding + stripHoleSize*i + Math.floor((i+1)/2)*stripHolePadding + Math.floor(i/2)*stripHoleGap},{-stripHoleSize*stripYOffset[i]-stripHoleSize/2 - stripHeightPadding - 1})">
						<rect
							width="{stripHoleSize}"
							height="{stripHoleSize*stripSizes[i] + stripHeightPadding*2 + 2}"
							rx="1" ry="1"
							fill="gray" />
						{#each range(0, stripSizes[i], 1) as j}
							<rect
								width="{stripHoleSize-0.2}"
								height="{stripHoleSize-0.2}"
								rx="{stripHoleSize-0.2}"
								ry="{stripHoleSize-0.2}"
								y="{stripHoleSize*j + stripHeightPadding*2 + 0.1}"
								x="0.1"
								fill="white" />
							<text
								text-anchor="middle"
								x="{stripHoleSize/2}"
								y="{stripHoleSize * j + stripHeightPadding + stripHoleSize}">{j}</text>
						{/each}
					</g>
				{/each}
				<mask id="numberHoles">
					<rect
						x="0" y="{innerWidth > 800 ? -50 : -10}"
						width="100%" height="100%"
						fill="white"/>
	
					{#each range(0, 6, 1) as i}
						<rect
							x="{1 + stripSidePadding + stripHoleSize*i + Math.floor((i+1)/2)*stripHolePadding + Math.floor(i/2)*stripHoleGap}"
							y="{-stripHoleSize / 2}"
							width="{stripHoleSize}" height="{stripHoleSize}"
							rx="1" ry="1"
							fill="black"/>
					{/each}
				</mask>
				<rect
					x="1" y="{-stripHoleSize/2 - 1}"
					width="{stripWidth}" height="{stripHoleSize + stripHeightPadding*2}"
					rx="2" ry="2"
					mask="url(#numberHoles)" />
			</svg>
		</div>
	</div>
</main>