#!/usr/bin/python

import json
import io
import os

jsonfile = io.open("shiplist.json", "r", encoding="UTF-8")
jsonlist = json.load(jsonfile)["cargoquery"]
jsonfile.close()

toc = {"ships":[]}

for entry in jsonlist:
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
	jsonfile = io.open(shipdir + "/ship.json", "w", encoding="UTF-8")
	json.dump(ship, jsonfile)
	jsonfile.close()
	toc["ships"].append({"ShipID":shipID, "Name":shipName, "dataJSON":(shipdir + "/ship.json")})

jsonfile = io.open("ships/toc.json", "w", encoding="UTF-8")
json.dump(toc, jsonfile)
jsonfile.close()
