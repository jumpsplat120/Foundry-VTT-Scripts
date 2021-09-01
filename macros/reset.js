const track = game.saved_macro.tracking;

Dialog.confirm({
    title: "Reset Confirmation",
    content: `Are you sure you want to reset? You have:<ul>
        <li><b>${track.arrows}</b> unrecovered arrows</li>
        <li><b>${track.advantage.length}</b> unused sources of advantage</li>
        <li><b>${track.damage.length}</b> unused sources of damage</li>
        <li>${track.lucky ? "A" : "No"} use of the lucky feat</li>
    </ul>`,
    yes: _ => { game.saved_macro.tracking: { arrows: 0, keys: {}, advantage: [], damage: {} } },
    no: _ => {},
    defaultYes: false
});