// planecounts and times must already be numbers
function get_airstrike_cooldown(plane1time, plane1count, plane2time, plane2count, plane3time, plane3count, reloadstat, reloadbuff, beacon, cooldown_reduction){
	let plane_count = plane1count + plane2count + plane3count;
	if (plane_count <= 0){
		return -1.0;
	}
	plane1time = plane1count != 0 ? +plane1time : 0.0;
	plane2time = plane2count != 0 ? +plane2time : 0.0;
	plane3time = plane3count != 0 ? +plane3time : 0.0;
	let weighted_cooldown_average = (plane1time * plane1count + plane2time * plane2count + plane3time * plane3count ) / plane_count;
	let adjusted_reload = (1 + reloadstat / 100.0 * (1 + reloadbuff / 100.0));
	let cooldown = Math.pow(adjusted_reload, -0.5) * 3.111269837 * weighted_cooldown_average;
	if (beacon){
		cooldown_reduction = +cooldown_reduction + 4.00;
	}
	cooldown = 0.1 + cooldown * (1 - cooldown_reduction / 100.00);
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
	let cooldown_reduction = $("#cooldownreductiontextfield").prop("value");
	let beacon = $("#beaconbox").is(":checked");
	let cooldown = get_airstrike_cooldown(plane1time, +plane1count, plane2time, +plane2count, plane3time, +plane3count, +reloadstat, +reloadbuff, beacon, +cooldown_reduction);
	if (cooldown > 0.0){
		$("#finalcooldown").prop("innerHTML", cooldown + "s");
	} else {
		$("#finalcooldown").prop("innerHTML", "Some Error Occurred :(");
	}
}

function update_textfields(idnumber){
	let $cdtextfield = $('#plane' + idnumber + 'cdtextfield');
	let $cddropdown = $('#plane' + idnumber + 'cddropdown');
	let dropdownvalue = $cddropdown.prop('value');
	$cdtextfield.prop('value', dropdownvalue);
	let $counttextfield = $('#plane' + idnumber + 'counttextfield');
	let $countstorage = $('#plane' + idnumber + 'countstorage');
	let currcountvalue = +$counttextfield.prop('value');
	let storedcountvalue = +$countstorage.prop('value');
	if (dropdownvalue === "Don't Use Slot"){
		$cdtextfield.attr('disabled', true);
		$counttextfield.attr('disabled', true);
		$countstorage.prop('value', currcountvalue);
		$counttextfield.prop('value', 0);
	} else if (storedcountvalue > 0){
		$cdtextfield.attr('disabled', false);
		$counttextfield.attr('disabled', false);
		$counttextfield.prop('value', storedcountvalue);
		$countstorage.prop('value', 0);
	}
}

// Load This After JQuery
$(function(){
	$('#plane1cddropdown').html($('#planeselect').html());
	$('#plane1cddropdown > option[name=hellcat]').prop("selected", true);
	$('#plane2cddropdown').html($('#planeselect').html());
	$('#plane2cddropdown > option[name=helldiver]').prop("selected", true);
	$('#plane3cddropdown').html($('#planeselect').html());
	$('#plane3cddropdown > option[name=ryusei]').prop("selected", true);
	update_textfields(1);
	update_textfields(2);
	update_textfields(3);
	calculate_reload();
});
