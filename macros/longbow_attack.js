if (!utils) {
	ui.notifications.error("Utils | Missing required utils. Run the setup macro first!");
	return;
}

const longbow   = utils.getItemByName("longbow");
const arrows    = utils.getItemByName("arrows");
const item_data = longbow.data.data;
const abilities = game.user.character.data.data.abilities;
const str       = abilities.str.mod;

let sharpshooter = false;

if (utils.getItemByName("longbow").data.data.quantity <= 0) {
	new utils.Dialog.ok("Ammo Notification", "You don't have any arrows for your bow!");
	return;
}

new utils.Dialog("Sharpshooter", 
"You have the sharpshooter feat! If you'd like, you can take a -5 to your attack, and if the attack hits, you gain a +10 in damage.")
	.addButton(new utils.Button()
		.setIcon("bullseye")
		.setText("Heck Ya")
		.setCallback(utils.Button.yes))
	.addButton(new utils.Button()
		.setIcon("times")
		.setText("Nah")
		.setCallback(utils.Button.no))
	.onClose((_, r) => r("Sharpshooter dialog closed."))
	.show(!!utils.getItemByName("Sharpshooter") && item_data.proficient)
	.then(choice => { sharpshooter = choice; }, utils.reject)
	.then(utils.Advantage.check, utils.reject)
	.then(utils.Advantage.pool, utils.reject)
	.then(data => {
		utils.playSound(utils.sounds?.bow_draw?.random);

		return new utils.Roll(longbow)
			.add(data.formula, data.label, "Base")
			.add(str, "Strength", "Ability Modifier")
			.maybeAdd(item_data.proficient, item_data.prof.term, "Martial Weapons", "Proficency")
			.maybeAdd(utils.getItemByName("Fighting Style: Archery"), 2, "Fighting Style - Archery", "Feat")
			.maybeSubtract(sharpshooter, 5, "Sharpshooter", "Feat")
			.roll()
	}, utils.reject)
	.then(message => {
		utils.decreaseItemQuantity(arrows, 1);
		
		utils.tracking.arrows++;

		return message.setFlavor("Attack Roll").show();
	}, utils.reject);