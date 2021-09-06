const saved = game.saved_macro;
const utils = saved.utils;
const track = saved.tracking;
const gs = utils.getItemByName("Gathered Swarm");
const target = game.user.targets.size > 0 ? [...game.user.targets][0] : false;
const name = target ? target.name : false;
const intro = "A swarm of skittering spiders and flying insects assist the attack."

new Dialog({
    title: "Select Swarm Option",
    buttons: {
        damage: utils.createButton("Deal Damage", "fist-raised", event => {
            utils.chatMessage({ img: gs.img, content: gs.name + " (Damage)" }, { small: `${intro} On a <b>successful</b> hit, the attack deals an additional <b>1d6</b> piercing damage.` })
            track.damage.gathered_swarm = [false, null, false];
        }),
        push_foe: utils.createButton("Move Enemy", "angle-double-right", event => {
            if (target) {
                target.actor.rollAbilitySave("str", { fastForward: true, chatMessage: false }).then(roll => {
                    utils.chatMessage({ img: gs.img, content: gs.name + ` (Move ${name})` }, { small: `${intro} On a <b>successful</b> hit, ${name} must roll a Strength Saving throw against Taylor's Spell Save DC (<b>${game.user.character.data.data.attributes.spelldc}</b>) or be moved up to 15 feet horizontally.` }, [{
                        title: `${name}'s Strength Saving Throw`,
                        onclick: function(button, roll) {
                            const content = button.parentElement.parentElement.parentElement;
                            button.classList.add("nohover");
                            button.innerHTML = `<h3 style="font-weight: bold;">${roll.total}</h3>`;
                        },
                        data: [ roll ]
                    }])
                });
            } else {
                Dialog.prompt({
                    title: "Missing Target",
                    content: "Move Enemy requires an enemy to be targeted!",
                    label: "OK",
                    callback: function() {},
                    rejectClose: false
                });
            }
        }),
        push_self: utils.createButton("Move Yourself", "walking", event => {
            utils.chatMessage({ img: gs.img, content: gs.name + ` (Move ${name || "Enemy"})` }, { small: `${intro} On a <b>successful</b> hit, the swarm moves Taylor 5 feet horizontally.` })
        })
    }
}).render(true);