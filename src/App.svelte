<!-- TODO: Refactor all code so it is more readable -->
<script>
	import { range, rangedLerp, loopingRangedLerp, loopingValue } from './js/utility.js';

	import "./css/main.css";
	import { Clock } from "./js/clock";

	let clock = new Clock();

	setInterval(() => {
		clock.syncTime();
		clock.updateAlarm();
		clock = clock;
	}, 10);

	let stripClockWidth = 200;
</script>

<!-- |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| -->

<!-- TODO: Add more comments describing what happens and organize it so it is more legible -->
<!-- TODO: Set each clock in three separate columns -->
<!-- NOTE: Consider removing the seconds indicators since they are relatively irrevelant and makes it less legible -->
<main>
	<div id="clock-container">
		<!-- "Normal" analog style clock -->
		<div id="analog-clock" style="height:25%;">
			<svg viewBox='-50 -50 100 100' width='100%' height='100%'>
				<!-- Clock markers, alternating larger and smaller every 5th marker -->
				{#each range(0, 60, 1) as marker}
				<line class='marker-{marker % 5 == 0 ? "large" : "small"}'
				y1='{45 - (marker % 5 == 0 ? 10 : 5)}'
				y2='45'
				transform='rotate({6 * marker})' />
				{/each}

				<!-- Clock numbers -->
				{#each range(1, 13, 1) as clockNumber}
					<g transform='rotate({-180+30*clockNumber})'>
						<text 
							class="clock-number"
							transform='rotate({180-30*clockNumber},0,29)' 
							text-anchor='middle' 
							y='32'>
							{clockNumber}
						</text>
					</g>
				{/each}
				
				<!-- Hour hand -->
				<line class='hour-hand'
				y1='-5'
				y2='35'
				transform='rotate({180 + 30 * clock.hour_precise})' />
				
				<!-- Minute hand -->
				<line class='minute-hand'
				y1='-7'
				y2='45'
				transform='rotate({180 + 6 * clock.minute_precise})' />
				
				<!-- Second hand -->
				<line class='second-hand'
				y1='-10'
				y2='45'
				transform='rotate({180 + 6 * clock.second_precise})' />
				
				<!-- Outside circle -->
				<circle class='clock-outside'
					cx='0'
					cy='0'
					r='45' />
				</svg>
			</div>
			
			<!-- 00:00:00 style clock -->
			<h1 id="digital-clock">{clock.timeAsString}</h1>
			
			<!-- Strip style clock, second, minute and hour is represented by a moving strip each -->
			<div id="strip-clock">
				<svg viewBox='-{(stripClockWidth+4)/2} 0 {stripClockWidth+4} 54' width='100%' height='100%'>
					<!-- Second moving markers, alternating large and small every 5th marker -->
					{#each range(0, 60, 1) as marker}
					{#if loopingValue(marker+30 - clock.second_precise, 0, 60) < 45 && loopingValue(marker+30 - clock.second_precise, 0, 60) > 15}
					<line class='marker-{marker % 5 == 0 ? "large" : "small"} {clock.alarmIsActive && (marker == clock.alarmSecond ? "alarm-marker" : "")}'
							y1='{marker % 5 == 0 ? 6 : 7}'
							y2='10'
							x1='{loopingRangedLerp((marker+30-clock.second_precise) % 60, 0, 60, -stripClockWidth, stripClockWidth)}'
							x2='{loopingRangedLerp((marker+30-clock.second_precise) % 60, 0, 60, -stripClockWidth, stripClockWidth)}'/>
						{#if marker % 5 == 0}
							<text 
								class="clock-strip-number"
								text-anchor='middle' 
								y='5'
								x='{loopingRangedLerp((marker+30-clock.second_precise) % 60, 0, 60, -stripClockWidth, stripClockWidth)}'>
								<!-- For some reason the markers are inversed decrease to the right instead of increasing -->
								{marker}
						</text>
						{/if}
					{/if}
				{/each}
				<!-- Triangle showing where current second is placed -->
				<polygon points="0,6 -1,2 1,2" class="pointer" />
				<!-- Border surrounding second strip -->
				<polygon points="-{stripClockWidth/2},2 -{stripClockWidth/2},10 {stripClockWidth/2},10 {stripClockWidth/2},2" class="border" />

				<!-- Minute moving markers, alternating large and small every 5th marker -->
				{#each range(0, 60, 1) as marker}
					{#if loopingValue(marker+30 - clock.minute_precise, 0, 60) < 45 && loopingValue(marker+30 - clock.minute_precise, 0, 60) > 15}
						<line class='marker-{marker % 5 == 0 ? "large" : "small"} {clock.alarmIsActive && (marker == clock.alarmMinute ? "alarm-marker" : "")}'
							y1='{marker % 5 == 0 ? 16 : 17}'
							y2='20'
							x1='{loopingRangedLerp((marker+30-clock.minute_precise) % 60, 0, 60, -stripClockWidth, stripClockWidth)}'
							x2='{loopingRangedLerp((marker+30-clock.minute_precise) % 60, 0, 60, -stripClockWidth, stripClockWidth)}' />
						{#if marker % 5 == 0}
							<text 
								class="clock-strip-number"
								text-anchor='middle' 
								y='15'
								x='{loopingRangedLerp((marker+30-clock.minute_precise) % 60, 0, 60, -stripClockWidth, stripClockWidth)}'>
								<!-- For some reason the markers are inversed decrease to the right instead of increasing -->
								{marker}
						</text>
						{/if}
					{/if}
				{/each}
				<!-- Triangle showing where current minute is placed -->
				<polygon points="0,16 -1,12 1,12" class="pointer" />
				<!-- Border surrounding minute strip -->
				<polygon points="-{stripClockWidth/2},12 -{stripClockWidth/2},20 {stripClockWidth/2},20 {stripClockWidth/2},12" class="border" />

				<!-- Hour moving markers -->
				{#each range(0, 24*2, 1) as marker}
					{#if loopingValue(marker+24 - clock.hour_precise*2, 0, 24*2) < 36 && loopingValue(marker+24 - clock.hour_precise*2, 0, 24*2) > 12}
						<line class='marker-{marker % 2 == 0 ? "large" : "small"} {clock.alarmIsActive && (marker == clock.alarmHour ? "alarm-marker" : "")}'
							y1='{marker % 2 == 0 ? 26 : 27}'
							y2='30'
							x1='{loopingRangedLerp((marker+24-clock.hour_precise*2) % (24*2), 0, 24*2, -stripClockWidth, stripClockWidth)}'
							x2='{loopingRangedLerp((marker+24-clock.hour_precise*2) % (24*2), 0, 24*2, -stripClockWidth, stripClockWidth)}' />
						{#if marker % 2 == 0}
							<text 
								class="clock-strip-number"
								text-anchor='middle' 
								y='25'
								x='{loopingRangedLerp((marker+24-clock.hour_precise*2) % (24*2), 0, 24*2, -stripClockWidth, stripClockWidth)}'>
								<!-- For some reason the markers are inversed decrease to the right instead of increasing -->
								{marker/2}
						</text>
						{/if}
					{/if}
				{/each}
				<!-- Triangle showing where current hour is placed -->
				<polygon points="0,26 -1,22 1,22" class="pointer" />
				<!-- Border surrounding hour strip -->
				<polygon points="-{stripClockWidth/2},22 -{stripClockWidth/2},30 {stripClockWidth/2},30 {stripClockWidth/2},22" class="border" />
			</svg>
		</div>

		{#if clock.alarmIsTriggered}
			<div class="overlay">
				<div id="clock-alarm-triggered-popup">
					<h1>Alarm Triggered!</h1>
					<button on:click="{() => {clock.alarmIsTriggered = false}}">
						Reset Alarm</button>
					<button on:click="{() => {clock.alarmIsTriggered = false; clock.alarmIsActive = false}}">Close</button>
				</div>
			</div>
		{/if}
		
		<button id="clock-toggle-alarm-active" on:click={() => {clock.toggleAlarm()}}
			class="{clock.alarmIsActive ? 'clock-alarm-active' : 'clock-alarm-inactive'}">
			Toggle Alarm</button>
		<input type="time" bind:value={clock.alarmTimeAsString}>
	</div>
</main>