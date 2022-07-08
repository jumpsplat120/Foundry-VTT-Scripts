if (!utils) {
	ui.notifications.error("Missing required utils. Run the setup macro first!");
	return;
}

const dagger    = utils.getItemByName("dagger");
const item_data = dagger.data.data;
const abilities = game.user.character.data.data.abilities;
const dex       = abilities.dex.mod;
const str       = abilities.str.mod;
const finess    = dex >= str;

utils.Advantage.check()
	.then(sources => {
		if (sources === null) { return null; }
		
		const data = utils.Advantage.pool(sources);

		//play sound, then roll
		return utils.playSound(utils.sounds?.dagger_swing?.random).then(_ => new utils.Roll(dagger)
			.add(data.formula, data.label, "Base")
			.maybeAdd(finess, dex, "Dexterity (Finess)", "Ability Modifier")
			.maybeAdd(!finess, str, "Strength", "Ability Modifier")
			.maybeAdd(item_data.proficient, item_data.prof.term, "Simple Weapons", "Proficency")
			.roll())
	})
	.then(message => message == null ? null : message.setFlavor("Attack Roll").show());


//const lucky_dialog = u.luckyPrompt(event => {
//    rollAttackAndPlaySound(null, null, "Dagger w/ Lucky (Reroll) - Attack Roll");
//	t.lucky = false;
//	t.advantage = t.advantage.filter(arr => arr[0] != "Lucky");
//}, event => {
//	if (t.advantage.length > 0) {
//		advantageDialog();
//	} else {
//        rollAttackAndPlaySound(event.shiftKey, event.ctrlKey);
//	}
//})
//
//if (t.lucky && t.damage.dagger) {
//    lucky_dialog.render(true);
//} else if (t.advantage.length > 0) {
//    advantageDialog();
//} else {
//    rollAttackAndPlaySound(event.shiftKey, event.ctrlKey);
//}