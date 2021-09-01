const saved = game.saved_macro;
const utils = saved.utils;
const track = saved.tracking;
const ff = utils.getItemByName("Favored Foe");
const damage = ff.data.data.damage.parts[0][0];

ff.roll({configureDialog: false, createMessage: false}).then(chat_message => { if (chat_message) {
    utils.chatMessage({ img: ff.img, content: ff.name }, { small: `On a successful damage dealing attack, Taylor may mark an enemy for one minute (or until she loses concentration), and deal an extra ${damage} damage to it.` })
    track.damage.favored_foe = [false, null, false];
}});