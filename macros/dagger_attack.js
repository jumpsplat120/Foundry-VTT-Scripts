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

let pool_data;

utils.Advantage.check()
	.then(sources => {
		if (sources === null) { return null; }
		
		pool_data = utils.Advantage.pool(sources);

		return utils.playSound(utils.sounds?.dagger_swing?.random);
	})
	.then(_ => {
		if (_ === null) { return null; }

		return new utils.Roll(dagger)
			.add(pool_data.formula, pool_data.label, "Base")
			.maybeAdd(finess, dex, "Dexterity (Finess)", "Ability Modifier")
			.maybeAdd(!finess, str, "Strength", "Ability Modifier")
			.maybeAdd(item_data.proficient, item_data.prof.term, "Simple Weapons", "Proficency")
			.roll()
	})
	.then(message => {
		if (message === null) { return null; }

		return message.setFlavor("Attack Roll").show();
	});