// planecounts and times must already be numbers
function get_airstrike_cooldown(plane1time, plane1count, plane2time, plane2count, plane3time, plane3count, reloadstat, reloadbuff, beacon, cooldown_reduction, init_cooldown_reduction){
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
    let reloadstat = $("#reloadstattextfield").prop("value");
    let reloadbuff = $("#reloadbufftextfield").prop("value");
    let plane1time = $("#plane1cdtextfield").prop("value");
    let plane1count = $("#plane1counttextfield").prop("value");
    let plane2time = $("#plane2cdtextfield").prop("value");
    let plane2count = $("#plane2counttextfield").prop("value");
    let plane3time = $("#plane3cdtextfield").prop("value");
    let plane3count = $("#plane3counttextfield").prop("value");
    let cooldown_reduction = $("#cdreduction1textfield").prop("value");
    let initial_cooldown_reduction = $("#cdreduction2textfield").prop("value");
    let beacon = $("#beaconbox").is(":checked");
    let cooldown = get_airstrike_cooldown(plane1time, +plane1count, plane2time, +plane2count, plane3time, +plane3count, +reloadstat, +reloadbuff, beacon, +cooldown_reduction, +initial_cooldown_reduction);
    if (cooldown[0] > 0.0){
        $("#finalcooldown").prop("innerHTML", cooldown.shift() + "s");
        $("#initcooldown").prop("innerHTML", cooldown[0] + "s");
        $("#finalstriketimers").prop("innerHTML", cooldown.join(", ") + "");
    } else {
        $("#finalcooldown").prop("innerHTML", "Some Error Occurred :(");
        $("#initcooldown").prop("innerHTML", "");
        $("#finalstriketimers").prop("innerHTML", "");
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
    } else {
        $cdtextfield.attr('disabled', false);
        $counttextfield.attr('disabled', false);
        //$counttextfield.prop('value', storedcountvalue);
        $countstorage.prop('value', 0);
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
    for (i in carrier_list){
        carrier_name = carrier_list[i];
        $('#shipselect').append('<option name="' + carrier_name + '" value="'+ carrier_name +'">' + carrier_name + '</option>');
    }
    carrier_list.push("Other");
    $('#shipselect').append('<option name="Other" value="Other">Other</option>');
    $('#shipselect > option[name=Enterprise').prop("selected", true);
    acquire_loadout();
}

var fighters='' +
    '<option value="F" disabled class="disabled-option">Fighters</option>' +
    '<option name="hellcat" value="10.90">F6F Hellcat</option>' +
    '<option value="10.61">Sea Hornet</option>' +
    '<option value="10.20">VF-17 ("Pirate Squad")</option>' + 
    '<option value="10.77">F7F Tigercat</option>' +
    '<option value="9.64">F8F Bearcat</option>' +
    '<option value="10.70">N1K3-A Shiden Kai</option>' +
    '<option value="10.60">Seafang</option>' +
    '<option value="10.61">Sea Fury</option>' +
    '<option value="10.44">A7M Reppuu</option>' + 
    '<option value="8.98">XF5F Skyrocket</option>' + 
    '<option value="9.24">Messerschmitt Me-155A</option>' +
    '<option value="9.44">F2A Buffalo (Thatch Squadron)</option>' +
    '';

var divebombers='' +
    '<option value="DB" disabled class="disabled-option">Dive Bombers</option>' +
    '<option name="helldiver" value="11.88">SB2C Helldiver</option>' +
    '<option value="10.44">Comet / D4Y Suisei</option>' +
    '<option value="11.11">Fairey Firefly</option>' +
    '<option value="11.91">Experimental XSB3C-1</option>' +
    '<option value="10.38">Fairey Barracuda (831 Squadron)</option>' +
    '<option value="9.18">Fairey Fulmar</option>' +
    '<option value="11.71">SBD Dauntless (McClusky)</option>' +
    '<option value="11.57">Junkers Ju-87c</option>' +
    '';

var torpedobombers='' +
    '<option value="TB" disabled class="disabled-option">Torpedo Bombers</option>' +
    '<option value="10.31">Barracuda</option>' +
    '<option value="9.98">Fairey Albacore</option>' +
    '<option name="ryusei" value="11.37">Aichi B7A Ryusei</option>' +
    '<option value="10.97">Swordfish (818 Squadron)</option>' +
    '<option value="12.04">TBM Avenger (VT-18 Squadron)</option>' +
    '<option value="12.04">Torpedo VT-8 Squadron</option>' +
    '<option value="10.51">Firecrest</option>' +
    '<option value="11.64">Wyvern</option>' +
    '<option value="11.17">Junkers Ju-87 D-4</option>' +
    '<option value="12.17">XBT2D-1 Sky Pirate</option>' +
    '';

var seaplanes='' +
    '<option value="Seaplane" disabled class="disabled-option">Seaplane</option>' +
    '<option value="14.30">Aichi M6A Seiran</option>' +
    '<option value="13.97">Aichi E16A Zuiun</option>' +
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
    let plane1name = $('#plane1cddropdown > option:selected').text();
    let plane2name = $('#plane2cddropdown > option:selected').text();
    let plane3name = $('#plane3cddropdown > option:selected').text();
    $('#plane1cddropdown').html(slot1options);
    $('#plane1counttextfield').prop('value', slot1count);
    $('#plane2cddropdown').html(slot2options);
    $('#plane2counttextfield').prop('value', slot2count);
    $('#plane3cddropdown').html(slot3options);
    $('#plane3counttextfield').prop('value', slot3count);
    $("#plane1cddropdown > option").filter(function(){return $(this).text() === plane1name}).prop('selected', true);
    $("#plane2cddropdown > option").filter(function(){return $(this).text() === plane2name}).prop('selected', true);
    $("#plane3cddropdown > option").filter(function(){return $(this).text() === plane3name}).prop('selected', true);
    update_textfields(1);
    update_textfields(2);
    update_textfields(3);
    calculate_reload();
}

function acquire_loadout(){
    let carrier_name = $('#shipselect').prop('value');
    if (carrier_name === "Other"){
        let general_loadout = {"F": "1", "D": "1", "T": "1", "S": "1", "N": "1"};
        let other_obj = {"Slot1":{"Retrofit":general_loadout}, "Slot2":{"Retrofit":general_loadout}, "Slot3":{"Retrofit":general_loadout}};
        handle_loadout_data(other_obj);
    } else {
        let full_url = "https://thebombzen.com/azur-lane/data/" + carriers[carrier_name].carrierJSON;
        $.getJSON(full_url, handle_loadout_data);
    }
}

// Load This After JQuery
$(function(){
    $('#plane1cddropdown').html($('#planeselectfighter').html());
    $('#plane1cddropdown > option[name=hellcat]').prop("selected", true);
    $('#plane2cddropdown').html($('#planeselectdivebomber').html());
    $('#plane2cddropdown > option[name=helldiver]').prop("selected", true);
    $('#plane3cddropdown').html($('#planeselecttorpedobomber').html());
    $('#plane3cddropdown > option[name=ryusei]').prop("selected", true);
    update_textfields(1);
    update_textfields(2);
    update_textfields(3);
    calculate_reload();
    $.getJSON('https://thebombzen.com/azur-lane/data/ships/toc.json', handle_toc)
});
