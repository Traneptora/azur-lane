function get_airstrike_cooldown(plane1time, plane1count, plane2time, plane2count, plane3time, plane3count, reloadstat, reloadbuff, cooldown_reduction){
	let plane_count = plane1count * 1.0 + plane2count * 1.0 + plane3count * 1.0;
	if (plane_count <= 0){
		return -1.0;
	}
	let weighted_cooldown_average = (plane1time * plane1count + plane2time * plane2count + plane3time * plane3count ) / plane_count;
	let adjusted_reload = (1 + reloadstat / 100.0 * (1 + reloadbuff / 100.0));
	let cooldown = Math.pow(adjusted_reload, -0.5) * 3.111269837 * weighted_cooldown_average;
	if (cooldown_reduction){
		cooldown = cooldown * (1.0 - cooldown_reduction);
	}
	cooldown = cooldown + 0.1;
	if (cooldown > 0.0 && cooldown < 300.00){
		return Math.round(cooldown * 100) / 100.00;
	} else {
		return -1.0;
	}
}

function calculate_reload(){
	let reloadstat = $("#reloadstattextfield").prop("value");
	let reloadbuff = $("#reloadbufftextfield").prop("value");
	let plane1time = $("#plane1cdtextfield").prop("value");
	let plane1count = $("#plane1counttextfield").prop("value");
	let plane2time = $("#plane2cdtextfield").prop("value");
	let plane2count = $("#plane2counttextfield").prop("value");
	let plane3time = $("#plane3cdtextfield").prop("value");
	let plane3count = $("#plane3counttextfield").prop("value");
	let beacon = $("#beaconbox").is(":checked");
	let cooldown_reduction = beacon ? 0.00 : 0.04;
	let cooldown = get_airstrike_cooldown(plane1time, plane1count, plane2time, plane2count, plane3time, plane3count, reloadstat, reloadbuff, cooldown_reduction);
	if (cooldown > 0.0){
		$("#finalcooldown").prop("innerHTML", cooldown + "s");
	} else {
		$("#finalcooldown").prop("innerHTML", "Some Error Occurred :(");
	}
}
