import sys, io

buffer = io.StringIO()
sys.stdout = sys.stderr = buffer

import json
import eel

def load_json():
    spell_list = []
    index = json.loads(open("json/index.json", "r").read())
    for key, spell_file in index.items():
        cur_spells = json.loads(open("json/" + spell_file, "r").read())
        spell_list += cur_spells["spell"]
    return spell_list

def search_spells(spell_list, search_term):
    return_list = []
    for spell in spell_list:
        if search_term.lower() in spell["name"].lower():
            return_list.append(spell)
    return return_list

def get_single_spell(spell_list, name):
    for spell in spell_list:
        if spell["name"] == name:
            return spell

spells = load_json()

@eel.expose
def ex_search_spells(search_term):
    return search_spells(spells, search_term)

@eel.expose
def ex_get_single_spell(name):
    return get_single_spell(spells, name)

eel.init('frontend')
eel.start('index.html')
