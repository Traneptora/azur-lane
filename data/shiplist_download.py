#!/usr/bin/env python3

# Query the Azur Lane Wiki Cargo Query table for a JSON database of ships
# Please only run this when necessary

import sys
import requests

def _eprint(*args, **kwargs):
    kwargs['file'] = sys.stderr
    print(*args, **kwargs)

ship_urls = [
    'https://azurlane.koumakan.jp/w/api.php?action=cargoquery&tables=ships&format=json&limit=500&offset=0&fields=ShipGroup,ShipID,Name,CNName,JPName,KRName,Rarity,Nationality,ConstructTime,Type,SubtypeRetro,Class,Artist,ArtistLink,ArtistPixiv,ArtistTwitter,VA,Remodel,RemodelId,HealthInitial,Armor,FireInitial,AAInitial,TorpInitial,AirInitial,ReloadInitial,EvadeInitial,ConsumptionInitial,Speed,Luck,AccInitial,ASWInitial,OxygenInitial,AmmoInitial,HealthMax,FireMax,AAMax,TorpMax,AirMax,ReloadMax,EvadeMax,ConsumptionMax,AccMax,ASWMax,OxygenMax,AmmoMax,HealthKai,ArmorKai,FireKai,AAKai,TorpKai,AirKai,ReloadKai,EvadeKai,ConsumptionKai,SpeedKai,ASWKai,AccKai,OxygenKai,AmmoKai,Health120,Fire120,AA120,Torp120,Air120,Reload120,Evade120,Consumption120,Acc120,ASW120,Oxygen120,Ammo120,HealthKai120,FireKai120,AAKai120,TorpKai120,AirKai120,ReloadKai120,EvadeKai120,ConsumptionKai120,AccKai120,ASWKai120,OxygenKai120,AmmoKai120,Eq1Type,Eq1BaseMax,Eq1BaseKai,Eq1EffInit,Eq1EffInitMax,Eq1EffInitKai,Eq2Type,Eq2BaseMax,Eq2BaseKai,Eq2EffInit,Eq2EffInitMax,Eq2EffInitKai,Eq3Type,Eq3BaseMax,Eq3BaseKai,Eq3EffInit,Eq3EffInitMax,Eq3EffInitKai',
    'https://azurlane.koumakan.jp/w/api.php?action=cargoquery&tables=ships&format=json&limit=500&offset=500&fields=ShipGroup,ShipID,Name,CNName,JPName,KRName,Rarity,Nationality,ConstructTime,Type,SubtypeRetro,Class,Artist,ArtistLink,ArtistPixiv,ArtistTwitter,VA,Remodel,RemodelId,HealthInitial,Armor,FireInitial,AAInitial,TorpInitial,AirInitial,ReloadInitial,EvadeInitial,ConsumptionInitial,Speed,Luck,AccInitial,ASWInitial,OxygenInitial,AmmoInitial,HealthMax,FireMax,AAMax,TorpMax,AirMax,ReloadMax,EvadeMax,ConsumptionMax,AccMax,ASWMax,OxygenMax,AmmoMax,HealthKai,ArmorKai,FireKai,AAKai,TorpKai,AirKai,ReloadKai,EvadeKai,ConsumptionKai,SpeedKai,ASWKai,AccKai,OxygenKai,AmmoKai,Health120,Fire120,AA120,Torp120,Air120,Reload120,Evade120,Consumption120,Acc120,ASW120,Oxygen120,Ammo120,HealthKai120,FireKai120,AAKai120,TorpKai120,AirKai120,ReloadKai120,EvadeKai120,ConsumptionKai120,AccKai120,ASWKai120,OxygenKai120,AmmoKai120,Eq1Type,Eq1BaseMax,Eq1BaseKai,Eq1EffInit,Eq1EffInitMax,Eq1EffInitKai,Eq2Type,Eq2BaseMax,Eq2BaseKai,Eq2EffInit,Eq2EffInitMax,Eq2EffInitKai,Eq3Type,Eq3BaseMax,Eq3BaseKai,Eq3EffInit,Eq3EffInitMax,Eq3EffInitKai'
]

for i, url in enumerate(ship_urls):
    _eprint(f'Getting Ship URL: {i}')
    r = requests.get(url)
    if not r.ok:
        _eprint(f'Error getting {entry["name"]} URL: {url}')
        _eprint(f'Status code: {r.status_code}')
        sys.exit(1)
    save_location = f'shiplist_{i}.json'
    _eprint(f'Saving to: {save_location}')
    with open(save_location, "w", encoding='UTF-8') as file:
        file.write(r.text)
