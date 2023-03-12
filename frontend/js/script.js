// TODO:
// Fix damage scaling for cantrips and irregular scaling spells (e.g. Spiritual Weapon)
// To include:
//    - School
//    - Time
//    - Range
//    - Components
//    - Duration
//      - Concentration?
//    - Saving Throw / Spell Attack (Melee vs Ranged vs ???)
//    - Area Type

let suggestions_elem = document.getElementById("suggestions");
let search_elem = document.getElementById("search");

// Animate expation of spell
function expandSection(element) {
    var sectionHeight = element.scrollHeight;
    var elementTransition = element.style.transition;
    element.style.transition = '';
    requestAnimationFrame(function() {
        element.style.height = 0 + 'px';
        element.style.transition = elementTransition;
        requestAnimationFrame(function() {
            element.style.height = sectionHeight + 'px';
        });
    });
}

// 1 -> 1st, 2 -> 2nd, etc...
function getNumberWithOrdinal(n) {
    var s = ["th", "st", "nd", "rd"],
        v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

//Gets damage of spell at all levels (Incomplete)
function get_spell_damage(spell) {
    let damage_array = [];
    let higher_entries = spell["entriesHigherLevel"][0]["entries"][0];
    let damage_str = higher_entries.match(/(?<=\s)([^{\}]+(?=}))/g) || [];
    for (let k = 0; k < damage_str.length; k++) {
        let curr_damage_array = [];
        let base_damage = damage_str[k].split("|")[0];
        let increment_damage = damage_str[k].split("|")[2];
        let levels = damage_str[k].split("|")[1];

        // Needs fixing for different types of damage scaling. Probably entire rewrite
        let j = 0;
        for (let i = levels.split("-")[0] - 1; i < levels.split("-")[1]; i++) {
            curr_damage_array[i] = parseInt(base_damage.split("d")[0]) + (j * parseInt(increment_damage.split("d")[0])) + "d" + base_damage.split("d")[1];
            j++;
        }
        damage_array.push(curr_damage_array);
    }
    return damage_array;
}

// Replaces tags with text
function strip_tags(text) {
    let newtext = text;
    let newtags = [];
    let tags = newtext.match(/{.*?}/g) || [];
    for (let i = 0; i < tags.length; i++) {
        switch(tags[i].match(/(?<={@).*?(?=\s)/g)[0]) {

            // Regex confuses me
            case "action":
                newtags.push(tags[i].match(/(?<=\s)([^{\}]+(?=}))/g)[0]);
                break;
            case "adventure":
                newtags.push(tags[i].match(/(?<=\s)[^\|\}]+/g)[0]);
                break;
            case "b":
                newtags.push(tags[i].match(/(?<=\s)([^{\}]+(?=}))/g)[0]);
                break;
            case "book":
                newtags.push(tags[i].match(/(?<=\s)[^\|\}]+/g)[0]);
                break;
            case "chance":
                newtags.push(tags[i].match(/(?<=\s)[^\|\}]+/g)[0] + "%");
                break;
            case "classFeature":
                newtags.push(tags[i].match(/(?<=\s)[^\|\}]+/g)[0]);
                break;
            case "condition":
                newtags.push(tags[i].match(/(?<=\s)[^\|\}]+/g)[0]);
                break;
            case "creature":
                newtags.push(tags[i].match(/(?<=\s)[^\|\}]+/g)[0]);
                break;
            case "d20":
                newtags.push("+" + tags[i].match(/(?<=\s)([^{\}]+(?=}))/g)[0]);
                break;
            case "damage":
                newtags.push(tags[i].match(/(?<=\s)([^{\}]+(?=}))/g)[0]);
                break;
            case "dice":
                // @dice also has an awkward syntax that makes it hard to match fully with regex due to it being used for object stats in
                // Animate Objects. So I am matching for most of it, then checking for a | (only present in animate objects), and dealing
                // with that seperately
                let temptag = tags[i].match(/(?<=\s)[^{\}]+(?=})/g)[0];
                if (temptag.includes("|")) {
                    temptag = temptag.split("|")[1];
                }
                newtags.push(temptag);
                break;
            case "filter":
                newtags.push(tags[i].match(/(?<=\s)[^\|\}]+/g)[0]);
                break;
            case "hit":
                newtags.push(tags[i].match(/(?<=\s)([^{\}]+(?=}))/g)[0]);
                break;
            case "i":
                newtags.push(tags[i].match(/(?<=\s)([^{\}]+(?=}))/g)[0]);
                break;
            case "item":
                newtags.push(tags[i].match(/(?<=\s)[^\|\}]+/g)[0]);
                break;
            case "note":
                // Recursion because @note is funky like that
                // Also have to use text rather than tags[i], because of how I am matching tags above. This might break tremendously
                newtags.push(strip_tags(text.match(/(?<={@note ).*(?=\})/g)[0]));
                // have to replace newtext due to hoow I am splitting text below
                newtext = newtext.replace(/(?<={@note ).*(?=\})/g, "");
                break;
            case "quickref":
                // I hate quickref with a deep, burning passion. There is just so much wrong with it, and it is impossible to make a pattern to match all cases.
                // However, I hate regex just the slightest bit more, so I am just gonna use if statements for this bit
                if (tags[i] == "{@quickref Surprise|PHB|3|0|surprised}") {
                    newtags.push("surprised");
                } else if (tags[i] == "{@quickref Vision and Light|PHB|2||heavily obscured}") {
                    newtags.push("heavily obscured");
                } else if (tags[i] == "{@quickref difficult terrain||3}") {
                    newtags.push("difficult terrain");
                }
                break;
            case "race":
                newtags.push(tags[i].match(/(?<=\s)[^\|\}]+/g)[0]);
                break;
            case "scaledamage":
                newtags.push(tags[i].match(/([^\|\}]+(?=}))/g)[0]);
                break;
            case "scaledice":
                newtags.push(tags[i].match(/([^\|\}]+(?=}))/g)[0]);
                break;
            case "sense":
                newtags.push(tags[i].match(/(?<=\s)([^{\}]+(?=}))/g)[0]);
                break;
            case "skill":
                newtags.push(tags[i].match(/(?<=\s)([^{\}]+(?=}))/g)[0]);
                break;
            case "spell":
                newtags.push(tags[i].match(/(?<=\s)([^{\}]+(?=}))/g)[0]);
                break;
            default:
                newtags.push(tags[i].match(/(?<=\s)([^{\}]+(?=}))/g)[0]);
        }
    }
    let tagless = newtext.split(/{.*?}/g);
    let result = tagless.reduce(function(arr, v, i) {return arr.concat(v, newtags[i]); }, []);
    return result.join("");
}

// Creates info box for spell (Incomplete)
function create_spell_info(spell) {
    // Create div
    let spell_info = document.createElement("div");
    spell_info.id = "spell_info"

    // Start tracking innerHTML to insert
    let spell_info_innerHTML = "";
    spell_info_innerHTML += "<h2>" + spell["name"] + "</h2>";
    if (parseInt(spell["level"]) > 0) {
        spell_info_innerHTML += "<p>" + getNumberWithOrdinal(parseInt(spell["level"])) + " Level spell</p>";
    } else if (parseInt(spell["level"]) == 0) {
        spell_info_innerHTML += "<p>Cantrip</p>";
    }

    // Damage at higher levels table (Fix to only display when higher levels deal damage, rather than other effect)
    if (spell["entriesHigherLevel"]) {
        spell_info_innerHTML += `
        <table><tr>
        <td>1st</td>
        <td>2nd</td>
        <td>3rd</td>
        <td>4th</td>
        <td>5th</td>
        <td>6th</td>
        <td>7th</td>
        <td>8th</td>
        <td>9th</td>
        </tr>
        `
        spell_damage_arr = get_spell_damage(spell);
        for (let i = 0; i < spell_damage_arr.length; i++) {
            spell_info_innerHTML += "<tr>";
            for (let j = 0; j < spell_damage_arr[i].length; j++) {
                spell_info_innerHTML += "<td>" + (spell_damage_arr[i][j] || "x") + "</td>";
            }
            spell_info_innerHTML += "</tr>";
        }
        spell_info_innerHTML += "<table>";
    }

    // Gives damage type
    if (spell["damageInflict"]) {
        spell_info_innerHTML += "<p>Damage Type: " + spell["damageInflict"].join(", ") + "</p>";
    }



    // Entries
    for (let i = 0; i < spell["entries"].length; i++) {

        // For table entries
        if (spell["entries"][i]["type"] == "table") {

            spell_info_innerHTML += "<p>" + spell["entries"][i]["caption"] + "</p>";
            spell_info_innerHTML += "<table><tr>";

            // Header
            for (let j = 0; j < spell["entries"][i]["colLabels"].length; j++) {
                spell_info_innerHTML += "<th>" + strip_tags(spell["entries"][i]["colLabels"][j]) + "</th>";
            }

            spell_info_innerHTML += "</tr>";

            for (let j = 0; j < spell["entries"][i]["rows"].length; j++) {
                spell_info_innerHTML += "<tr>"

                // Rows
                for (let k = 0; k < spell["entries"][i]["rows"][j].length; k++) {
                    if (typeof spell["entries"][i]["rows"][j][k] == "object") {

                        // For Weirdly formatted JSON for roll values. NightmareNightmareNightmareNightmareNightmareNightmareNightmareNightmareNightmareNightmareNightmareNightmare
                        if (spell["entries"][i]["rows"][j][k]["roll"]["exact"]){
                            spell_info_innerHTML += "<td>" + spell["entries"][i]["rows"][j][k]["roll"]["exact"] + "</td>";
                        } else if (spell["entries"][i]["rows"][j][k]["roll"]["min"] != null && spell["entries"][i]["rows"][j][k]["roll"]["max"] != null){
                            spell_info_innerHTML += "<td>" + spell["entries"][i]["rows"][j][k]["roll"]["min"] + "-" + spell["entries"][i]["rows"][j][k]["roll"]["max"] + "</td>";
                        }

                    } else {

                        // Else just add the text to the table
                        spell_info_innerHTML += "<td>" + strip_tags(spell["entries"][i]["rows"][j][k]) + "</td>";
                    }
                }

                spell_info_innerHTML += "</tr>"
            }

            spell_info_innerHTML += "</table>"

        // For entries nested in entries. Currently only looks one level deep, might need to fix.
        } else if (typeof spell["entries"][i] == "object") {
            spell_info_innerHTML += "<p>" + spell["entries"][i]["name"] + ": " + strip_tags(spell["entries"][i]["entries"].join(" ")) + "</p>";
        
        // Regular fucking plaintext entries
        } else {
            spell_info_innerHTML += "<p>" + strip_tags(spell["entries"][i]) + "</p>";
        }
    }

    // Entries at higher levels. Might need fixing if they do the same fuckiness as regular entries
    if (spell["entriesHigherLevel"]) {
        spell_info_innerHTML += "<p>" + strip_tags(spell["entriesHigherLevel"][0]["entries"].join(" ")) + "</p>";
    }

    // add all that shit to the div
    spell_info.innerHTML = spell_info_innerHTML;

    //return it back to the function that called it to be added to DOM
    return spell_info;
}

// When a spell entry gets clicked, this is called. It Just calls a bunch of other stuff tbh
async function click_list_item() {
    let spell = await eel.ex_get_single_spell(this.innerHTML)();

    // Try catch in case spell_info doesn't exist yet, which happens on start and right after searches
    try {
        document.getElementById("spell_info").remove();
    } catch (e) {
        //do nothing
    }

    // Creates, inserts and animates the div
    let spell_info = create_spell_info(spell);
    this.parentNode.insertBefore(spell_info, this.nextSibling);
    expandSection(spell_info);
}

// Updates the search every time the input changes. Was expecting this to be much slower tbh
async function update_list() {
    suggestions_elem.innerHTML = "";

    // Checking if input is empty so we dot display every spell when searching for an empty string
    if (this.value != "") {
        let spells = await eel.ex_search_spells(this.value)();
        for (let i = 0; i<spells.length; i++) {
            let listElement = document.createElement("li");
            listElement.innerHTML += spells[i]["name"];

            // Adding the event listener here as it is easier than looping through every li element after the fact, and we can just grab
            // the spell name from innerText and do another search
            listElement.addEventListener("click", click_list_item);
            suggestions_elem.appendChild(listElement);
        }
    }
}

search_elem.addEventListener("input", update_list);