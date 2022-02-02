// Taken from <https://svelte.dev/repl/c8651b1ef39140da85cc824cbe16c28d?version=3.9.1>
// NOTE: These implementations would have to be polyfilled for IE support!
function* iter_range(begin,end,step) {
	// Normalize our inputs
	step = step ? step : 1;
	
	if (typeof(end) === 'undefined') {
		end   = begin > 0 ? begin : 0;
		begin = begin < 0 ? begin : 0;
	}
	
	if (begin == end) {
		return;
	}
	
	if (begin > end) {
		step = step * -1;	
	}
	
	for (let x = begin; x < end; x += step) {
		yield x;
	}
}

export function range(begin, end, step) {
	return Array.from(iter_range(begin,end,step));
}

// Based on <https://stackoverflow.com/questions/1969240/mapping-a-range-of-values-to-another>
// Function to lerp a numerical value from one range to another
export function rangedLerp(value, leftMin, leftMax, rightMin, rightMax) {
	// The lengthes of the ranges
	let leftSpan  = leftMax  - leftMin;
	let rightSpan = rightMax - rightMin;

	// Normalize the value to a value between 0 and 1 based on where on leftMin to leftMax it is located
	let valueNormalized = (value - leftMin) / leftSpan;

	// Convert the normalized value to the assigned range
	return rightMin + (rightSpan * valueNormalized);
}