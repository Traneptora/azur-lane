#!/usr/bin/env python3

import json
import re
from itertools import product

re_whitespace = re.compile(r'\s+')
re_condition = re.compile(r'(\w+)(\(((\w+)on)?(\w+)\))?$')
re_f = re.compile(r'(fighter)[^\+]*(\+([0-9]))?$')
re_d = re.compile(r'(divebomber)[^\+]*(\+([0-9]))?$')
re_t = re.compile(r'(torpedobomber)[^\+]*(\+([0-9]))?$')
re_s = re.compile(r'(seaplane)[^\+]*(\+([0-9]))?$')
re_slot1 = re.compile(r'(slot1)[^\+]*(\+([0-9]))?$')
re_slot2 = re.compile(r'(slot2)[^\+]*(\+([0-9]))?$')
re_slot3 = re.compile(r'(slot3)[^\+]*(\+([0-9]))?$')
re_all = re.compile(r'(allplanes)[^\+]*(\+([0-9]))?$')
re_dict = {'F': re_f, 'D': re_d, 'T': re_t, 'S': re_s, '0': re_slot1, '1': re_slot2, '2': re_slot3, 'P': re_all}
re_condition_parse = re.compile(r'(m)lb|lb([0-9])|(retrofit)')

def parse_conditionless_type(equip_string):
    if equip_string == None:
        return 'N'
    if re_f.search(equip_string):
        return 'F'
    if re_d.search(equip_string):
        return 'D'
    if re_t.search(equip_string):
        return 'T'
    if re_s.search(equip_string):
        return 'S'
    return 'N'

def parse_lb_condition(condition_string):
    lb_num = next(status for status in re_condition_parse.search(condition_string).group(1, 2, 3) if status)
    if lb_num == 'm':
        return 3
    if lb_num == 'retrofit':
        return 4
    return int(lb_num)

def parse_equip_slot(equip_string):
    option_list = re_whitespace.sub('', equip_string.lower()).split('/')
    lb_json = [{}, {}, {}, {}, {}]
    for option in option_list:
        condition = re_condition.search(option)
        if condition:
            condition_group = condition.group(1, 4, 5)
        else:
            raise ValueError('invalid condition')
        base_state = {parse_conditionless_type(condition_group[0]): 1}
        if condition_group[2]:
            lb_num = parse_lb_condition(condition_group[2])
            if condition_group[1]:
                lb_state = {parse_conditionless_type(condition_group[1]): 1}
            else:
                lb_state = base_state
            for i in range(lb_num, 5):
                lb_json[i].update(lb_state)
            if condition_group[1]:
                for i in range(0, lb_num):
                    lb_json[i].update(base_state)
        else:
            for lb_json_entry in lb_json:
                lb_json_entry.update(base_state)
    return lb_json

def parse_lb_upgrade(lb_upgrade_string):
    option_list = re_whitespace.sub('', lb_upgrade_string.lower()).split('/')
    sdict = {}
    for option in option_list:
        for k in re_dict:
            m = re_dict[k].search(option)
            if m and m.groups()[-1]:
                sdict[k] = int(m.groups()[-1])
    return sdict

def parse_carrier_json(ship_json):
    slot_list = [parse_equip_slot(ship_json['Eq1Type']), parse_equip_slot(ship_json['Eq2Type']),  parse_equip_slot(ship_json['Eq3Type'])]
    lb_upgrades = [{}, parse_lb_upgrade(ship_json['LB1']), parse_lb_upgrade(ship_json['LB2']), parse_lb_upgrade(ship_json['LB3']), {}]
    for i,  j in product(range(3), range(5)):
        slot = slot_list[i]
        lb_upgrade = lb_upgrades[j]
        for k in range(j, 5):
            lb_state = slot[k]
            for plane_type in lb_state.keys():
                if plane_type in lb_upgrade:
                    lb_state[plane_type] += lb_upgrade[plane_type]
            if 'P' in lb_upgrade or str(i) in lb_upgrade:
                for plane_type in 'F', 'D', 'T', 'S':
                    if plane_type in lb_state:
                        lb_state[plane_type] += lb_upgrade['P'] if 'P' in lb_upgrade else lb_upgrade[str(i)]
    carrier_json = {'Slot1':{}, 'Slot2':{}, 'Slot3':{}}
    for i in range(3):
        slot_key = 'Slot' + str(i + 1)
        lb_json = {'LB0':{}, 'LB1':{}, 'LB2':{}, 'MLB':{}, 'Retrofit':{}}
        carrier_json[slot_key] = lb_json
        for j in range(5):
            carrier_json[slot_key][list(lb_json.keys())[j]].update(slot_list[i][j])
    return carrier_json
