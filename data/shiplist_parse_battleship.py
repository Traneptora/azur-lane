#!/usr/bin/env python3

def parse_battleship_json(ship_json):
    mlb_count = ship_json.get('Eq1BaseMax', 0), ship_json.get('Eq2BaseMax', 0), ship_json.get('Eq3BaseMax', 0)
    kai_count = (ship_json['Eq1BaseKai'], ship_json['Eq2BaseKai'], ship_json.get('Eq3BaseKai', 0)) if 'Eq1BaseKai' in ship_json else (0, 0, 0)
    battleship_json = {}
    battleship_json['Name'] = ship_json['Name']
    reload_stat = int(ship_json['Reload120'])
    if 'ReloadKai120' in ship_json:
        reload_120 = int(ship_json['ReloadKai120'])
        if reload_120 > 0: reload_stat = reload_120
    battleship_json['Reload'] = reload_stat
    return battleship_json
