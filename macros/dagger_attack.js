if (!utils) {
	ui.notifications.error("Utils | Missing required utils. Run the setup macro first!");
	return;
}

const dagger    = utils.getItemByName("dagger");
const item_data = dagger.data.data;
const abilities = game.user.character.data.data.abilities;
const dex       = abilities.dex.mod;
const str       = abilities.str.mod;
const finess    = dex >= str;

//check advantages, asking which ones you'd like to use
utils.Advantage
	.check()
	.then(utils.Advantage.pool, utils.reject)
	.then(data => {
		utils.playSound(utils.sounds?.dagger_swing?.random);

		return new utils.Roll(dagger)
			.add(data.formula, data.label, "Base")
			.maybeAdd(finess, dex, "Dexterity (Finess)", "Ability Modifier")
			.maybeAdd(!finess, str, "Strength", "Ability Modifier")
			.maybeAdd(item_data.proficient, item_data.prof.term, "Simple Weapons", "Proficency")
			.roll()
	}, utils.reject)
	.then(message => {
		const uuid = utils.uuid();
		const die  = message.data.roll.terms[0];
		const crit = die.faces == die.total;
		
		//save dagger damages to turn.damage array
		utils.tracking.turn.damage.push(new utils.Damage("Piercing", "Dagger", `Attack${crit ? " (Critical)" : ""}`, `${crit ? "1" : "2"}d4`, uuid))
		utils.tracking.turn.damage.push(new utils.Damage("Piercing", "Ability Modifier (Dagger)", finess ? "Dexterity (Finess)" : "Strength", finess ? dex : str, uuid))
		
		//show attack chat message
		return message.setFlavor("Attack Roll").show();
	}, utils.reject)
	.then(_ => {
		let second_dagger = false;

		//check if the player has a second dagger
		for (const item of game.user.character.data.items) {
			if (item?.name == "Dagger" && item != dagger) {
				second_dagger = true;
				break;
			}
		}

		if (!second_dagger) { return null; }

		//if they do, ask if they'd like to use their bonus action to attack again
		return utils.Dialog.prompt("Light", 
			`If you've succesfully landed that attack, 
			you may use your a light weapon in your offhand 
			to attack again as a bonus action. Would you 
			like to?`);
	}, utils.reject)
	.then(choice => {
		if (!choice) { return false; }

		//TODO: Add a way to get all light weapons and pick one
		return utils.Dialog.ok("Light", 
			`Choose which equipped light weapon you'd like to attack with.`);
	})
	.then(utils.Advantage.check, utils.reject)
	.then(utils.Advantage.pool, utils.reject)
	.then(data => {
		if (!data) { return false; }

		utils.playSound(utils.sounds?.dagger_swing?.random);

		return new utils.Roll(dagger)
			.add(data.formula, data.label, "Base")
			.maybeAdd(finess && dex < 0, dex, "Dexterity (Finess/Light)", "Ability Modifier")
			.maybeAdd(!finess && str < 0, str, "Strength (Light)", "Ability Modifier")
			.maybeAdd(item_data.proficient, item_data.prof.term, "Simple Weapons", "Proficency")
			.roll()
	}, utils.reject)
	.then(message => {
		const uuid = utils.uuid();
		const die  = message.data.roll.terms[0];
		const crit = die.faces == die.total;

		utils.tracking.turn.damage.push(new utils.Damage("Piercing", "Dagger", `Bonus Attack${crit ? " (Critical)" : ""}`, `${crit ? "1" : "2"}d4`, uuid))

		if (finess && dex < 0) {
			utils.tracking.turn.damage.push(new utils.Damage("Piercing", "Ability Modifier (Dagger)", "Dexterity (Finess)", dex, uuid))
		}

		if (!finess && str < 0) {
			utils.tracking.turn.damage.push(new utils.Damage("Piercing", "Ability Modifier (Dagger)", "Strength", str, uuid))
		}

		return message.setFlavor("Attack Roll - Light").show();
	}, utils.reject)
	.then(_ => {
		//if the player can extra attack, and haven't this turn
		if (!utils.getItemByName("Extra Attack")) { return Promise.reject("Does not have extra attack.");    }
		if (utils.tracking.turn.extra_attack)     { return Promise.reject("Has already used extra attack."); }

		//ask if they'd like to
		return utils.Dialog.prompt("Extra Attack Feat", 
			`You have the extra attack feat, and have not used
			it this turn. Would you like to attack again?`);
	}, utils.reject)
	.then(utils.Advantage.check, utils.reject)
	.then(utils.Advantage.pool, utils.reject)
	.then(data => {
		if (!data) { return Promise.reject("Did not extra attack."); }

		utils.playSound(utils.sounds?.dagger_swing?.random);

		//form a new roll
		return new utils.Roll(dagger)
			.add(data.formula, data.label, "Base")
			.maybeAdd(finess, dex, "Dexterity (Finess)", "Ability Modifier")
			.maybeAdd(!finess, str, "Strength", "Ability Modifier")
			.maybeAdd(item_data.proficient, item_data.prof.term, "Simple Weapons", "Proficency")
			.roll()
	}, utils.reject)
	.then(message => {
		const uuid = utils.uuid();
		const die  = message.data.roll.terms[0];
		const crit = die.faces == die.total;
		
		//mark that we've used extra attack
		utils.tracking.turn.extra_attack = true;

		//save new extra attack damage entry
		utils.tracking.turn.damage.push(new utils.Damage("Piercing", "Dagger", `Attack ${crit ? " (Critical)" : ""}`, `${crit ? "1" : "2"}d4`, uuid))
		utils.tracking.turn.damage.push(new utils.Damage("Piercing", "Ability Modifier (Dagger)", finess ? "Dexterity (Finess)" : "Strength", finess ? dex : str))

		//show result of extra attack attack roll
		return message.setFlavor("Attack Roll - Extra Attack Feat").show();
	}, console.log);