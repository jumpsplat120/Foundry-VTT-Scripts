const saved = game.saved_macro;
const track = saved.tracking;
const utils = saved.utils;

const shift = event.shiftKey;
const ctrl  = event.ctrlKey;

const rollSkill = (ability, flavor, advantage, disadvantage) => {
    const options = { fastForward: true };
    if (flavor) { options.flavor = flavor; }
    if (advantage) { options.advantage = advantage; }
    if (disadvantage) { options.disadvantage = disadvantage; }
    game.user.character.rollSkill(ability, options)
}

const rollAndCheck = (skill_id, skill_name) => {
    if (track.lucky) {
        utils.luckyPrompt(event => {
            rollSkill(skill_id, `${skill_name} Skill Check w/ Lucky (Reroll)`);
            track.lucky = false;
        }, event => {
            if (track.advantage.length > 0) {
                utils.advantagePrompt(arr => {
                    rollSkill(skill_id, `${skill_name} Skill Check w/ ${arr[0]}`, true);
                }, _ => {
                    rollSkill(skill_id, null, shift, ctrl);
                }).render(true);
            } else {
                rollSkill(skill_id, null, shift, ctrl);
            }
        }).render(true);
    } else {
        rollSkill(skill_id, null, shift, ctrl);
    }
}

new Dialog({
    title: "Skill Selection",
    content: "",
    buttons: {
        animal_handling: utils.createButton("Animal Handling", "horse-head",        event => { rollAndCheck("ani", "Animal Handling"); }),
        sleight_of_hand: utils.createButton("Sleight of Hand", "hand-sparkles",     event => { rollAndCheck("sle", "Sleight of Hand"); }),
        investigation:   utils.createButton("Investigation",   "search",            event => { rollAndCheck("inv", "Investigation"); }),
        intimidation:    utils.createButton("Intimidation",    "fist-raised",       event => { rollAndCheck("int", "Intimidation"); }),
        perception:      utils.createButton("Perception",      "glasses",           event => { rollAndCheck("per", "Perception"); }),
        acrobatics:      utils.createButton("Acrobatics",      "snowboarding",      event => { rollAndCheck("acr", "Acrobatics"); }),
        athletics:       utils.createButton("Athletics",       "running",           event => { rollAndCheck("ath", "Athletics"); }),
        deception:       utils.createButton("Deception",       "mask",              event => { rollAndCheck("dec", "Deception"); }),
        medicine:        utils.createButton("Medicine",        "briefcase-medical", event => { rollAndCheck("med", "Medicine"); }),
        religion:        utils.createButton("Religion",        "pray",              event => { rollAndCheck("rel", "Religion"); }),
        survival:        utils.createButton("Survival",        "tree",              event => { rollAndCheck("sur", "Survival"); }),
        history:         utils.createButton("History",         "book",              event => { rollAndCheck("his", "History"); }),
        insight:         utils.createButton("Insight",         "chess",             event => { rollAndCheck("ins", "Insight"); }),
        stealth:         utils.createButton("Stealth",         "user-ninja",        event => { rollAndCheck("ste", "Stealth"); }),
        arcana:          utils.createButton("Arcana",          "disease",           event => { rollAndCheck("arc", "Arcana"); }),
        nature:          utils.createButton("Nature",          "leaf",              event => { rollAndCheck("nat", "Nature"); })
    }
}).render(true);