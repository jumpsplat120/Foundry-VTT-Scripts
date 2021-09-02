const saved = game.saved_macro;
const utils = saved.utils;
const track = saved.tracking;
const ff = utils.getItemByName("Favored Foe");
const name = game.user.targets.size > 0 ? [...game.user.targets][0].name : false;

ff.roll({configureDialog: false, createMessage: false}).then(chat_message => { if (chat_message) {
    utils.chatMessage({ img: ff.img, content: ff.name + `${name ? " (" + name + ")" : ""}` }, { small: `Taylor has marked <b>${name ? name : "an enemy"}</b>! On a successful damage dealing attack, for one minute (or until she loses concentration), she may deal an extra <b>${ff.data.data.damage.parts[0][0]}</b> damage to it.` })
    track.damage.favored_foe = [false, null, false];
}});