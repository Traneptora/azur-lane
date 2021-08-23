#!/usr/bin/env python3

import json
import os
from shiplist_parse_battleship import parse_battleship_json
from shiplist_parse_carrier import parse_carrier_json

cargolist = []

for shiplist_json in ["shiplist_0.json", "shiplist_1.json"]:
    with open(shiplist_json, "r", encoding="UTF-8") as jsonfile:
        jsonlist = json.load(jsonfile)
    with open(shiplist_json, "w", encoding="UTF-8") as jsonfile:
        json.dump(jsonlist, jsonfile, sort_keys=True, indent=4)
    cargolist += jsonlist["cargoquery"]

toc = {"battleships":"battleships.json", "carriers":"carriers.json", "ships":[]}
battleships = {"ships":[]}
carriers = {"ships":[]}

for entry in cargolist:
    ship = entry["title"]
    shipID = ship["ShipID"]
    shipName = ship["Name"]
    shipdir = "ships/by-id/" + shipID;
    os.makedirs(shipdir, mode=0o755, exist_ok=True)
    os.makedirs("ships/by-name/", mode=0o755, exist_ok=True)
    try:
        os.symlink("../by-id/" + shipID, "ships/by-name/" + shipName, target_is_directory=True)
    except FileExistsError:
        pass
    with open(shipdir + "/ship.json", "w", encoding="UTF-8") as jsonfile:
        json.dump(ship, jsonfile, sort_keys=True, indent=4)
    toc_entry = {"ShipID":shipID, "Name":shipName, "DataDir":shipdir, "dataJSON":(shipdir + "/ship.json")}
    if ship["Type"] in ["Battleship", "Battlecruiser", "Aviation Battleship", "Monitor"]:
        toc_entry["battleshipJSON"] = shipdir + "/battleship.json"
        battleships["ships"].append(toc_entry)
        battleship_json = parse_battleship_json(ship_json=ship)
        with open(toc_entry["battleshipJSON"], "w", encoding="UTF-8") as jsonfile:
            json.dump(battleship_json, jsonfile, sort_keys=True, indent=4)
    if ship["Type"] in ["Aircraft Carrier", "Light Aircraft Carrier", "Aviation Battleship", "Submarine Carrier"] or "SubtypeRetro" in ship and ship["SubtypeRetro"] in ["Aviation Battleship"]:
        toc_entry["carrierJSON"] = shipdir + "/carrier.json"
        carriers["ships"].append(toc_entry)
        carrier_json = parse_carrier_json(ship_json=ship)
        with open(toc_entry["carrierJSON"], "w", encoding="UTF-8") as jsonfile:
            json.dump(carrier_json, jsonfile, sort_keys=True, indent=4)
    toc["ships"].append(toc_entry)

with open("ships/toc.json", "w", encoding="UTF-8") as jsonfile:
    json.dump(toc, jsonfile, sort_keys=True, indent=4)
with open("ships/battleships.json", "w", encoding="UTF-8") as jsonfile:
    json.dump(battleships, jsonfile, sort_keys=True, indent=4)
with open("ships/carriers.json", "w", encoding="UTF-8") as jsonfile:
    json.dump(carriers, jsonfile, sort_keys=True, indent=4)
