if (!utils) {
	ui.notifications.error("Missing required utils. Run the setup macro first!");
	return;
}

const longbow   = utils.getItemByName("longbow");
const arrows    = utils.getItemByName("arrows");
const item_data = longbow.data.data;
const abilities = game.user.character.data.data.abilities;
const str       = abilities.str.mod;
let pool_data;
let sharpshooter;

if (utils.getItemByName("longbow").data.data.quantity <= 0) {
	new utils.Dialog.ok("Ammo Notification", "You don't have any arrows for your bow!");
	return;
}

utils.Advantage.check()
	.then(sources => {
		if (sources === null) { return null; }
		
		pool_data = utils.Advantage.pool(sources);

		return utils.playSound(utils.sounds?.bow_draw?.random);
	})
	.then(_ => {
		if (_ === null) { return null; }

		if (!(item_data.proficient && !!utils.getItemByName("Sharpshooter"))) { return false; }

		//if proficent, and have the sharpshooter feat...
		return new utils.Dialog("Sharpshooter", "You have the sharpshooter feat! If you'd like, you can take a -5 to your attack, and if the attack hits, you gain a +10 in damage.")
			.addButton(new utils.Button()
				.setIcon("bullseye")
				.setText("Heck Ya")
				.setCallback(_ => { sharpshooter = true; }))
			.addButton(new utils.Button()
				.setIcon("times")
				.setText("Nah")
				.setCallback(_ => { sharpshooter = false; }))
			.onClose(_ => null)
			.show()
	})
	.then(_ => {
		if (_ === null) { return null; }

		return new utils.Roll(longbow)
			.add(pool_data.formula, pool_data.label, "Base")
			.add(str, "Strength", "Ability Modifier")
			.maybeAdd(item_data.proficient, item_data.prof.term, "Martial Weapons", "Proficency")
			.maybeAdd(utils.getItemByName("Fighting Style: Archery"), 2, "Fighting Style - Archery", "Feat")
			.maybeSubtract(sharpshooter, 5, "Sharpshooter", "Feat")
			.roll()
	})
	.then(message => {
		if (message === null) { return null; }

		utils.decreaseItemQuantity(arrows, 1);
		
		utils.tracking.arrows++;

		return message.setFlavor("Attack Roll").show();
	});