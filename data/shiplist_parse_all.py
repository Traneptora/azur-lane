#!/usr/bin/env python3

import json
import os
from shiplist_parse_carrier import parse_carrier_json

jsonfile = open("shiplist.json", "r", encoding="UTF-8")
jsonlist = json.load(jsonfile)
jsonfile.close()
jsonfile = open("shiplist.json", "w", encoding="UTF-8")
json.dump(jsonlist, jsonfile, sort_keys=True, indent=4)
jsonfile.close()

toc = {"ships":[], "carriers":[]}

for entry in jsonlist["cargoquery"]:
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
    jsonfile = open(shipdir + "/ship.json", "w", encoding="UTF-8")
    json.dump(ship, jsonfile, sort_keys=True, indent=4)
    jsonfile.close()
    toc_entry = {"ShipID":shipID, "Name":shipName, "DataDir":shipdir, "dataJSON":(shipdir + "/ship.json")}
    if ship["Type"] in ["Aircraft Carrier", "Light Aircraft Carrier"] or ship["SubtypeRetro"] in ["Aviation Battleship"]:
        toc_entry["carrierJSON"] = shipdir + "/carrier.json"
        toc["carriers"].append(toc_entry)
        carrier_json = parse_carrier_json(ship_json=ship)
        jsonfile = open(toc_entry["carrierJSON"], "w", encoding="UTF-8")
        json.dump(carrier_json, jsonfile, sort_keys=True, indent=4)
        jsonfile.close()
    toc["ships"].append(toc_entry)

jsonfile = open("ships/toc.json", "w", encoding="UTF-8")
json.dump(toc, jsonfile, sort_keys=True, indent=4)
jsonfile.close()
