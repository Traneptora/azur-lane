function get_bbspeed(weapon_cooldown, reload_stat, reload_percent_buff){
    return Math.sqrt(1.0 + reload_stat / 100.0 * (1 + reload_percent_buff / 100.0)) * Math.SQRT1_2 / weapon_cooldown; 
}

function get_bbcooldown(weapon_cooldown, rld_stat_base, rld_bonus, reload_percent_buff, has_timed_reload_buff, timed_reload_percent_buff, timed_reload_buff_duration, cooldown_reduction_percent, init_cooldown_reduction_percent, has_boomer_fcr){
    let reload_stat = rld_stat_base + rld_bonus;
    let cooldown;
    let init_cooldown;
    init_cooldown = 1.0 / get_bbspeed(weapon_cooldown, reload_stat, reload_percent_buff);
    if (!has_timed_reload_buff || timed_reload_buff_duration <= 0 || timed_reload_percent_buff <= 0){
        cooldown = init_cooldown;
    } else {
        const speed_with_timed_buff = get_bbspeed(weapon_cooldown, reload_stat, reload_percent_buff + timed_reload_percent_buff);
        const completion_with_buff = speed_with_timed_buff * timed_reload_buff_duration; 
        if (completion_with_buff >= 1.0){
            cooldown = 1.0 / speed_with_timed_buff;
        } else {
            const speed_without_timed_buff = get_bbspeed(weapon_cooldown, reload_stat, reload_percent_buff);
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

    if (cooldown > 1.0 && cooldown < 300.0 && init_cooldown > 0.0 && init_cooldown < 300.00){
        let timer = init_cooldown;
        let ret = [Math.round(cooldown * 100.00) / 100.00];
        while (timer < 300.00){
            ret.push(Math.round(timer * 100.00) / 100.00);
            timer += cooldown;
        }
        return ret;
    }

    // Some error occurred :(
    return [-1.0];
}

function update_guntextfields() {
    const tempRLD = document.getElementById("bb-cd-red-3-enable").checked;
    const cdredshowhideCL = document.getElementById("bb-cd-red-3-container").classList;
    if (tempRLD){
        cdredshowhideCL.remove("hidden");
    } else {
        cdredshowhideCL.add("hidden");
    }
    const currValue = document.getElementById("bb-mg-1-dropdown").value;
    document.getElementById("bb-mg-1-txt").value = currValue;
    // standard CSS/JS uses checked here
    // event tho it's a selectbox
    const option = document.querySelector("#bb-mg-1-dropdown option:checked")
    const name = option.name;
    const imgname = option.dataset.imgname;
    const img = document.getElementById("bb-mg-1-img");
    img.src = "images/equips/gun/bb/" + imgname;
    img.alt = name;
}

function calculate_bbcooldown() {
    const rld_stat = document.getElementById("bb-rld-stat-txt").value;
    const rld_bonus = document.getElementById("bb-rld-bonus-txt").value;
    const reloadbuff = document.getElementById("bb-rld-buff-txt").value;
    const weaponcd = document.getElementById("bb-mg-1-txt").value;
    const cooldown_reduction = document.getElementById("bb-cd-red-txt-1").value;
    const initial_cd_reduction = document.getElementById("bb-cd-red-txt-2").value;
    const has_timed_reload_buff = document.getElementById("bb-cd-red-3-enable").checked;
    const has_boomer_fcr = document.getElementById("bb-hpfcr-enable").checked;
    const timed_reload_percent_buff = document.getElementById("bb-cd-red-txt-3-quant").value;
    const timed_reload_buff_duration = document.getElementById("bb-cd-red-txt-3-time").value;
    const cooldown = get_bbcooldown(+weaponcd, +rld_stat, +rld_bonus, +reloadbuff, has_timed_reload_buff, +timed_reload_percent_buff, +timed_reload_buff_duration, +cooldown_reduction, +initial_cd_reduction, has_boomer_fcr);
    if (cooldown[0] > 0.0){
        document.getElementById("bb-result-cooldown").innerHTML = cooldown.shift() + "s";
        document.getElementById("bb-result-init-cooldown").innerHTML = cooldown[0] + "s";
        document.getElementById("bb-result-shot-timers").innerHTML = cooldown.join(", ") + "";
    } else {
        document.getElementById("bb-result-cooldown").innerHTML = "Some Error Occurred :(";
        document.getElementById("bb-result-init-cooldown").innerHTML = "";
        document.getElementById("bb-result-shot-timers").innerHTML = "";
    }
}

var battleship_list = [];
var battleships = {};

function handle_toc(data){
    if (battleship_list.length > 0){
        return;
    }
    for (let ship of data.ships){
        let battleship_name = ship.Name;
        battleship_list.push(battleship_name);
        battleships[battleship_name] = ship;
    }
    battleship_list.sort();
    battleship_list.push("Other");
    for (let battleship_name of battleship_list){
        let option = document.createElement("option");
        option.name = battleship_name;
        option.value = battleship_name;
        option.appendChild(document.createTextNode(battleship_name));
        document.getElementById("shipselect").appendChild(option);
    }
    document.querySelector("#shipselect > option[value=Georgia]").selected = true;
    acquire_loadout();
}

function acquire_loadout(){
    let battleship_name = document.getElementById("shipselect").value;
    if (battleship_name === "Other"){
        let other_obj = {"Name":"Other","Reload":100};
        handle_loadout_data(other_obj);
    } else {
        const url = "/azur-lane/data/" + battleships[battleship_name].battleshipJSON;
        fetch(url).then((response) => {
            return response.json();
        }).then((json) => {
            handle_loadout_data(json);
        });
    }
}

function handle_loadout_data(data){
    const rld_stat_base = +data.Reload;
    document.getElementById("bb-rld-stat-txt").value = rld_stat_base;
    calculate_bbcooldown();
}

function ready() {
    update_guntextfields();
    calculate_bbcooldown();
    fetch("/azur-lane/data/ships/battleships.json").then((r) => {
        return r.json();
    }).then((j) => {
        handle_toc(j);
    });
    document.querySelectorAll("#bb-mg-1-dropdown option").forEach((elem) => {
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
