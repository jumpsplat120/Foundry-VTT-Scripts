const sm = game.saved_macro;
const u  = sm.utils;
const t  = sm.tracking;
const i  = u.getItemByName("Zephyr Strike");
const l  = i.labels;

i.roll({configureDialog: false, createMessage: false}).then(chat_message => { 
    if (chat_message) {
        u.chatMessage({ img: i.img, content: i.name }, { small: `<ul>
        <li>Does not take opportunity attacks</li>
        <li>A single attack gains the following:</li>
            <ul>
                <li>Advantage</li>
                <li>1d8 force damage</li>
                <li>30 extra feet of movement</li>
            </ul>
        </ul>` }, null, [l.level, l.components.join(", "), l.activation, l.target, l.range, l.duration])
        t.advantage[t.advantage.length] = [i.name, 1, "feather-alt", function() { t.damage.zephyr_strike = [false, null, false]; }];
    }
});