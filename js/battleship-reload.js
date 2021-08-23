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
    const tempRLD = document.getElementById("cdred2enablecb").checked;
    const cdredshowhideCL = document.getElementById("cdredshowhide").classList;
    if (tempRLD){
        cdredshowhideCL.remove("hidden");
    } else {
        cdredshowhideCL.add("hidden");
    }
    const currValue = document.getElementById("maingun1cddropdown").value;
    document.getElementById("maingun1cdtextfield").value = currValue;
    // standard CSS/JS uses checked here
    // event tho it's a selectbox
    const option = document.querySelector("#maingun1cddropdown option:checked")
    const name = option.name;
    const imgname = option.dataset.imgname;
    const img = document.getElementById("maingun1image");
    img.src = "images/equips/gun/bb/" + imgname;
    img.alt = name;
}

function calculate_bbcooldown() {
    const reloadstat = document.getElementById("bbreloadstattextfield").value;
    const reloadbuff = document.getElementById("bbreloadbufftextfield").value;
    const weaponcd = document.getElementById("maingun1cdtextfield").value;
    const cooldown_reduction = document.getElementById("cdreduction1textfield").value;
    const initial_cd_reduction = document.getElementById("cdreduction2textfield").value;
    const has_timed_reload_buff = document.getElementById("cdred2enablecb").checked;
    const has_boomer_fcr = document.getElementById("boomerfcrbox").checked;
    const timed_reload_percent_buff = document.getElementById("cdred2percenttxtfield").value;
    const timed_reload_buff_duration = document.getElementById("cdred2timetxtfield").value;
    const cooldown = get_bbcooldown(+weaponcd, +reloadstat, +reloadbuff, has_timed_reload_buff, +timed_reload_percent_buff, +timed_reload_buff_duration, +cooldown_reduction, +initial_cd_reduction, has_boomer_fcr);
    if (cooldown[0] > 0.0){
        document.getElementById("finalbbcooldown").innerHTML = cooldown.shift() + "s";
        document.getElementById("initbbcooldown").innerHTML = cooldown[0] + "s";
        document.getElementById("finalbbshottimers").innerHTML = cooldown.join(", ") + "";
    } else {
        document.getElementById("finalbbcooldown").innerHTML = "Some Error Occurred :(";
        document.getElementById("initbbcooldown").innerHTML = "";
        document.getElementById("finalbbshottimers").innerHTML = "";
    }
}

function ready() {
    update_guntextfields();
    calculate_bbcooldown();
    document.querySelectorAll("#maingun1cddropdown option").forEach((elem) => {
        const src = elem.dataset.imgname;
        if (src){
            elem.style.background = 'url("images/equips/gun/bb/' + src + '") no-repeat -200% -200%';
        }
    });
}

if (document.readyState === 'loading'){
    document.addEventListener("DOMContentLoaded", ready);
} else {
    ready();
}
