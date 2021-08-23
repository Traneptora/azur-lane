function get_bbspeed(weapon_cooldown, reload_stat, reload_percent_buff){
    return Math.sqrt(1.0 + reload_stat / 100.0 * (1 + reload_percent_buff / 100.0)) * Math.SQRT1_2 / weapon_cooldown; 
}

function get_bbcooldown(weapon_cooldown, reload_stat, reload_percent_buff, has_timed_reload_buff, timed_reload_percent_buff, timed_reload_buff_duration, cooldown_reduction_percent, init_cooldown_reduction_percent, has_boomer_fcr){
    let cooldown;
    let init_cooldown;
    init_cooldown = 1.0 / get_bbspeed(weapon_cooldown, reload_stat, reload_percent_buff);
    if (!has_timed_reload_buff || timed_reload_buff_duration <= 0 || timed_reload_percent_buff <= 0){
        cooldown = init_cooldown;
    } else {
        let speed_with_timed_buff = get_bbspeed(weapon_cooldown, reload_stat, reload_percent_buff + timed_reload_percent_buff);
        let completion_with_buff = speed_with_timed_buff * timed_reload_buff_duration; 
        if (completion_with_buff >= 1.0){
            cooldown = 1.0 / speed_with_timed_buff;
        } else {
            let speed_without_timed_buff = get_bbspeed(weapon_cooldown, reload_stat, reload_percent_buff);
            cooldown = (1.0 - completion_with_buff) / speed_without_timed_buff + timed_reload_buff_duration;
        }
    }
    let cd_reduction = +cooldown_reduction_percent;
    let init_cd_reduction = +init_cooldown_reduction_percent;
    init_cd_reduction += cd_reduction;
    if (has_boomer_fcr){
        init_cd_reduction += 15.0;
    }
    init_cooldown = init_cooldown * (1.0 - init_cd_reduction / 100.0);
    cooldown = cooldown * (1.0 - cd_reduction / 100.0);
    init_cooldown += 1.5;

    if (cooldown > 0.0 && cooldown < 300.0 && init_cooldown > 0.0 && init_cooldown < 300.00){
        let timer = init_cooldown;
        let ret = [Math.round(cooldown * 100.00) / 100.00];
        while (timer < 300.00){
            ret.push(Math.round(timer * 100.00) / 100.00);
            timer += cooldown;
        }
        return ret;
    } else {
        return [-1.0];
    }
}

function update_guntextfields() {
    const tempRLD = document.getElementById('cdred2enablecb').checked;
    document.getElementById('cdredshowhide').style.display = tempRLD ? 'flex' : 'none';
    $('#maingun1cdtextfield').prop('value', $('#maingun1cddropdown').prop('value'));
    let $option = $('#maingun1cddropdown option:selected');
    let name = $option.prop('name');
    let imgname = $option.data('imgname');
    let $img = $('#maingun1image');
    $img.prop('src', 'images/equips/gun/bb/' + imgname);
    $img.prop('alt', name);
}

function calculate_bbcooldown() {
    let reloadstat = $("#bbreloadstattextfield").prop('value');
    let reloadbuff = $("#bbreloadbufftextfield").prop('value');
    let weaponcd = $("#maingun1cdtextfield").prop('value');
    let cooldown_reduction = $("#cdreduction1textfield").prop("value");
    let initial_cd_reduction = $("#cdreduction2textfield").prop("value");
    let has_timed_reload_buff = $('#cdred2enablecb').is(':checked');
    let has_boomer_fcr = $("#boomerfcrbox").is(":checked");
    let timed_reload_percent_buff = $('#cdred2percenttxtfield').prop('value');
    let timed_reload_buff_duration = $('#cdred2timetxtfield').prop('value');
    let cooldown = get_bbcooldown(+weaponcd, +reloadstat, +reloadbuff, has_timed_reload_buff, +timed_reload_percent_buff, +timed_reload_buff_duration, +cooldown_reduction, +initial_cd_reduction, has_boomer_fcr);
    if (cooldown[0] > 0.0){
        $("#finalbbcooldown").prop("innerHTML", cooldown.shift() + "s");
        $("#initbbcooldown").prop("innerHTML", cooldown[0] + "s");
        $("#finalbbshottimers").prop("innerHTML", cooldown.join(", ") + "");
    } else {
        $("#finalbbcooldown").prop("innerHTML", "Some Error Occurred :(");
        $("#initbbcooldown").prop("innerHTML", "");
        $("#finalbbshottimers").prop("innerHTML", "");
    }
}

// Load This After JQuery
$(function(){
    update_guntextfields();
    calculate_bbcooldown();
    $('#maingun1cddropdown option').each((index, element) => {
        let src = $(element).data('imgname');
        if (src){
            $(element).css('background', 'url("images/equips/gun/bb/' + src + '") no-repeat -200% -200%');
        }
    });
});
