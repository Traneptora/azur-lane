#!/usr/bin/env python3

import json
import re

re_whitespace = re.compile(r'\s+')
re_condition = re.compile(r'(\w+)(\(((\w+)on)?(\w+)\))?')
re_f = re.compile(r'fighter')
re_d = re.compile(r'divebomber')
re_t = re.compile(r'torp(edo)?bomber')
re_s = re.compile(r'seaplane')
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
    lb_json = [[], [], [], [], []]
    for option in option_list:
        condition = re_condition.search(option)
        if condition:
            condition_group = condition.group(1, 4, 5)
        else:
            raise ValueError("invalid condition")
        base_state = parse_conditionless_type(condition_group[0])
        if condition_group[2]:
            lb_num = parse_lb_condition(condition_group[2])
            if condition_group[1]:
                lb_state = parse_conditionless_type(condition_group[1])
            else:
                lb_state = base_state
            for i in range(lb_num, 5):
                lb_json[i].append(lb_state)
            if condition_group[1]:
                for i in range(0, lb_num):
                    lb_json[i].append(base_state)
        else:
            for lb_json_entry in lb_json:
                lb_json_entry.append(base_state)
    return lb_json

def parse_carrier_json(ship_json, carrier_json_file):
    eq1_type = ship_json["Eq1Type"]

