// planecounts and times must already be numbers
function get_airstrike_cooldown(plane1time, plane1count, plane2time, plane2count, plane3time, plane3count, reloadstat, reloadbonus, reloadbuff, beacon, cooldown_reduction, init_cooldown_reduction){
    let plane_count = plane1count + plane2count + plane3count;
    if (plane_count <= 0){
        return [-1.0];
    }
    plane1time = plane1count != 0 ? +plane1time : 0.0;
    plane2time = plane2count != 0 ? +plane2time : 0.0;
    plane3time = plane3count != 0 ? +plane3time : 0.0;
    let weighted_cooldown_average = (plane1time * plane1count + plane2time * plane2count + plane3time * plane3count ) / plane_count;
    let adjusted_reload = (1 + (reloadstat + reloadbonus) / 100.0 * (1 + reloadbuff / 100.0));
    let cooldown = Math.pow(adjusted_reload, -0.5) * 3.111269837 * weighted_cooldown_average;
    let init_cooldown = cooldown;
    let cd_reduction = +cooldown_reduction;
    let init_cd_reduction = +init_cooldown_reduction;
    if (beacon){
        cd_reduction = +cd_reduction + 4.00;
    }
    init_cd_reduction += cd_reduction;
    init_cooldown = init_cooldown * (1.0 - init_cd_reduction / 100.0);
    cooldown = cooldown * (1.0 - cd_reduction / 100.0);
    init_cooldown += 1.6;
    cooldown += 0.1;
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

function calculate_reload(){
    let reloadstat = document.getElementById("reloadstattxt").value;
    let reloadbonus = document.getElementById("reloadbonustxt").value;
    let reloadbuff = document.getElementById("reloadbufftextfield").value;
    let plane1time = document.getElementById("plane1cdtextfield").value;
    let plane1count = document.getElementById("plane1counttextfield").value;
    let plane2time = document.getElementById("plane2cdtextfield").value;
    let plane2count = document.getElementById("plane2counttextfield").value;
    let plane3time = document.getElementById("plane3cdtextfield").value;
    let plane3count = document.getElementById("plane3counttextfield").value;
    let cooldown_reduction = document.getElementById("cdreduction1textfield").value;
    let initial_cooldown_reduction = document.getElementById("cdreduction2textfield").value;
    let beacon = document.getElementById("beaconbox").checked;
    let cooldown = get_airstrike_cooldown(plane1time, +plane1count, plane2time, +plane2count, plane3time, +plane3count, +reloadstat, +reloadbonus, +reloadbuff, beacon, +cooldown_reduction, +initial_cooldown_reduction);
    if (cooldown[0] > 0.0){
        document.getElementById("finalcooldown").innerHTML = cooldown.shift() + "s";
        document.getElementById("initcooldown").innerHTML = cooldown[0] + "s";
        document.getElementById("finalstriketimers").innerHTML = cooldown.join(", ") + "";
    } else {
        document.getElementById("finalcooldown").innerHTML = "Some Error Occurred :(";
        document.getElementById("initcooldown").innerHTML = "";
        document.getElementById("finalstriketimers").innerHTML = "";
    }
}

function update_textfields(idnumber){
    let cdtextfield = document.getElementById('plane' + idnumber + 'cdtextfield');
    let cddropdown = document.getElementById('plane' + idnumber + 'cddropdown');
    let dropdownvalue = cddropdown.value;
    cdtextfield.value = dropdownvalue;
    let counttextfield = document.getElementById('plane' + idnumber + 'counttextfield');
    let currcountvalue = +counttextfield.value;
    let storedcountvalue = +counttextfield.dataset.storedValue;
    counttextfield.dataset.storedValue = currcountvalue;
    if (dropdownvalue === "Don't Use Slot"){
        cdtextfield.disabled = true;
        counttextfield.disabled = true;
        counttextfield.value = 0;
    } else if (counttextfield.disabled) {
        // restoring from "Don't use slot"
        cdtextfield.disabled = false;
        counttextfield.disabled = false;
        counttextfield.value = storedcountvalue;
    }
}

var carrier_list = [];
var carriers = {};

function handle_toc(data){
    if (carriers.length > 0){
        return;
    }
    data.carriers.sort((a, b) => a < b ? -1 : 1);
    for (let i in data.carriers){
        let carrier_name = data.carriers[i].Name;
        carrier_list.push(carrier_name);
        carriers[carrier_name] = data.carriers[i];
    }
    carrier_list.sort();
    carrier_list.push("Other");
    for (i in carrier_list){
        carrier_name = carrier_list[i];
        let option = document.createElement('option');
        option.name = carrier_name;
        option.value = carrier_name;
        option.appendChild(document.createTextNode(carrier_name));
        document.getElementById('shipselect').appendChild(option);
    }
    document.querySelector('#shipselect > option[value=Enterprise]').selected = true;
    acquire_loadout();
}

var fighters='' +
    '<option value="F" disabled class="disabled-option">Fighters</option>' +
    '<option name="hellcat" selected value="10.90">F6F Hellcat</option>' +
    '<option value="10.81">F7F Tigercat</option>' +
    '<option value="10.71">N1K3-A Shiden Kai</option>' +
    '<option value="10.61">Sea Hornet</option>' +
    '<option value="10.61">Sea Fury</option>' +
    '<option value="10.60">Seafang</option>' +
    '<option value="10.58">BF-109G Rocket Fighter</option>' +
    '<option value="10.44">A7M Reppuu</option>' + 
    '<option value="10.20">VF-17 (“Pirate Squad”)</option>' + 
    '<option value="9.64">F8F Bearcat</option>' +
    '<option value="9.44">F2A Buffalo (Thatch)</option>' +
    '<option value="9.24">Messerschmitt Me-155A</option>' +
    '<option value="8.98">XF5F Skyrocket</option>' + 
    '';

var divebombers='' +
    '<option value="DB" disabled class="disabled-option">Dive Bombers</option>' +
    '<option value="12.00">J5N Tenrai</option>' +
    '<option value="11.91">XSB3C-1 (Goldiver)</option>' +
    '<option name="helldiver" selected value="11.88">SB2C Helldiver</option>' +
    '<option value="11.71">SBD Dauntless (McClusky)</option>' +
    '<option value="11.57">Junkers Ju-87c</option>' +
    '<option value="11.11">Fairey Firefly</option>' +
    '<option value="10.44">D4Y Suisei</option>' +
    '<option value="10.38">Fairey Barracuda (831 Squadron)</option>' +
    '<option value="9.98">Suisei Model 12A</option>' +
    '<option value="9.18">Fairey Fulmar</option>' +
    '';

var torpedobombers='' +
    '<option value="TB" disabled class="disabled-option">Torpedo Bombers</option>' +
    '<option value="12.17">XTB2D-1 Sky Pirate</option>' +
    '<option value="12.04">TBM Avenger (VT-18)</option>' +
    '<option value="11.64">Westland Wyvern</option>' +
    '<option name="ryusei" selected value="11.37">B7A Ryusei</option>' +
    '<option value="11.17">Junkers Ju-87 D-4</option>' +
    '<option value="10.97">Swordfish (818 Squadron)</option>' +
    '<option value="10.60">B6N Saiun</option>' +
    '<option value="10.31">Fairey Barracuda</option>' +
    '<option value="9.98">Fairey Albacore</option>' +
    '';

var seaplanes='' +
    '<option value="Seaplane" disabled class="disabled-option">Seaplane</option>' +
    '<option value="14.30">M6A Seiran</option>' +
    '<option value="13.97">E16A Zuiun</option>' +
    '<option value="12.97">Suisei Model 21</option>' +
    '';

var otherplane='' +
    '<option value="O" disabled class="disabled-option">Custom Entry</option>' +
    '<option value="">Other</option>' +
    '';

var nouseslot='' +
    '<option value="N" disabled class="disabled-option">Not A Plane</option>' +
    '<option value="Don\'t Use Slot">Don\'t Use Slot</option>' +
    '';

function buildoptions(slot_obj){
        let options = '';
        let slotcount = 0;
        if (slot_obj.hasOwnProperty('F')){
            options += fighters;
            slotcount = slot_obj.F;
        }
        if (slot_obj.hasOwnProperty('D')){
            options += divebombers;
            slotcount = slot_obj.D;
        }
        if (slot_obj.hasOwnProperty('T')){
            options += torpedobombers;
            slotcount = slot_obj.T;
        }
        if (slot_obj.hasOwnProperty('S')){
            options += seaplanes;
            slotcount = slot_obj.S;
        }
        if (slot_obj.hasOwnProperty('N')){
            options += nouseslot;
        }
        options += otherplane;
        return {"options":options, "count":slotcount};

}

function handle_loadout_data(data){
    let slot1 = data.Slot1.Retrofit;
    let slot2 = data.Slot2.Retrofit;
    let slot3 = data.Slot3.Retrofit;
    let reload_stat = +data.Reload;
    let slot1options;
    let slot2options;
    let slot3options;
    let slot1count;
    let slot2count;
    let slot3count;
    let ret_obj;
    ret_obj = buildoptions(slot1);
    slot1options = ret_obj.options;
    slot1count = ret_obj.count;
    ret_obj = buildoptions(slot2);
    slot2options = ret_obj.options;
    slot2count = ret_obj.count
    ret_obj = buildoptions(slot3);
    slot3options = ret_obj.options;
    slot3count = ret_obj.count
    document.getElementById("reloadstattxt").value = reload_stat;
    let plane1name = document.querySelector('#plane1cddropdown > option:checked').text;
    let plane2name = document.querySelector('#plane2cddropdown > option:checked').text;
    let plane3name = document.querySelector('#plane3cddropdown > option:checked').text;
    let textfield;
    document.getElementById('plane1cddropdown').innerHTML = slot1options;
    textfield = document.getElementById('plane1counttextfield');
    textfield.value = slot1count;
    textfield.dataset.storedValue = slot1count;
    document.getElementById('plane2cddropdown').innerHTML = slot2options;
    textfield = document.getElementById('plane2counttextfield');
    textfield.value = slot2count;
    textfield.dataset.storedValue = slot2count;
    document.getElementById('plane3cddropdown').innerHTML = slot3options;
    textfield = document.getElementById('plane3counttextfield');
    textfield.value = slot3count;
    textfield.dataset.storedValue = slot3count;
    Array.prototype.filter.call(document.querySelectorAll('#plane1cddropdown > option'), (option) => option.text === plane1name).forEach((o) => o.selected = true);
    Array.prototype.filter.call(document.querySelectorAll('#plane2cddropdown > option'), (option) => option.text === plane2name).forEach((o) => o.selected = true);
    Array.prototype.filter.call(document.querySelectorAll('#plane3cddropdown > option'), (option) => option.text === plane3name).forEach((o) => o.selected = true);
    update_textfields(1);
    update_textfields(2);
    update_textfields(3);
    calculate_reload();
}

function acquire_loadout(){
    let carrier_name = document.getElementById('shipselect').value;
    if (carrier_name === "Other"){
        let general_loadout = {"F": "1", "D": "1", "T": "1", "S": "1", "N": "1"};
        let other_obj = {"Reload":100,"Slot1":{"Retrofit":general_loadout}, "Slot2":{"Retrofit":general_loadout}, "Slot3":{"Retrofit":general_loadout}};
        handle_loadout_data(other_obj);
    } else {
        let full_url = "https://thebombzen.com/azur-lane/data/" + carriers[carrier_name].carrierJSON;
        fetch(full_url).then((response) => {
            return response.json();
        }).then((json) => {
            handle_loadout_data(json);
        });
    }
}

function ready() {
    document.getElementById('plane1cddropdown').innerHTML = fighters;
    document.querySelector('#plane1cddropdown > option[name=hellcat]').selected = true;
    document.getElementById('plane2cddropdown').innerHTML = divebombers;
    document.querySelector('#plane2cddropdown > option[name=helldiver]').selected = true;
    document.getElementById('plane3cddropdown').innerHTML = torpedobombers;
    document.querySelector('#plane3cddropdown > option[name=ryusei]').selected = true;
    update_textfields(1);
    update_textfields(2);
    update_textfields(3);
    calculate_reload();
    fetch('/azur-lane/data/ships/carriers.json').then((r) => {
        return r.json();
    }).then((j) => {
        handle_toc(j);
    });
}

if (document.readyState === 'loading'){
    document.addEventListener("DOMContentLoaded", ready);
} else {
    ready();
}
