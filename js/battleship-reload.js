function get_speed(weapon_cooldown, reload_stat, reload_percent_buff){
	return Math.sqrt(1.0 + reload_stat / 100.0 * (1 + reload_percent_buff / 100.0)) * Math.SQRT1_2 / weapon_cooldown; 
}

function get_cooldown(weapon_cooldown, reload_stat, reload_percent_buff, timed_reload_percent_buff, timed_reload_buff_duration){
	if (timed_reload_buff_duration <= 0 || timed_reload_percent_buff <= 0){
		return 1.0 / get_speed(weapon_cooldown, reload_stat, reload_percent_buff);
	}
	let speed_with_timed_buff = get_speed(weapon_cooldown, reload_stat, reload_percent_buff + timed_reload_percent_buff);
	let completion_with_buff = speed_with_timed_buff * timed_reload_buff_duration; 
	if (completion_with_buff >= 1.0){
		return 1.0 / speed_with_timed_buff;
	} else {
		let speed_without_timed_buff = get_speed(weapon_cooldown, reload_stat, reload_percent_buff);
		return (1.0 - completion_with_buff) / speed_without_timed_buff + timed_reload_buff_duration;
	}
}

