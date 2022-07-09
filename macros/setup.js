if (!window.utils) {
	//monkeypatch that returns 'Title Cased' text.
	String.prototype.toTitleCase = function() {
		let upper = true;
		let str   = "";
		
		for (let i = 0, l = this.length; i < l; i++) {
			const chr = this[i];
			if (chr == " ") {
				upper = true;
				str  += chr;
			} else {
				str  += upper ? chr.toUpperCase() : chr.toLowerCase();
				upper = false;
			}
		}

		return str;
	}

	//monkeypatch that allows you to .length Objects to see if they have any key value pairs.
	//only inlcudes keys visible using Object.keys
	Object.defineProperty(Object.prototype, "length", {
		get() { return Object.keys(this).length; },
		set() { },
		enumerable: false,
		writeable: false
	});

	//monkeypatch that will randomly return a value from an array
	Object.defineProperty(Array.prototype, "random", {
		get() { return this[Math.floor(Math.random() * this.length)]; },
		set() { },
		enumerable: false,
		writeable: false
	})

	//monkeypatch that will randomly return a value from an object
	Object.defineProperty(Object.prototype, "random", {
		get() { return this[Object.keys(this).random]; },
		set() { },
		enumerable: false,
		writeable: false
	})
} else {
	delete window.utils;
}

//flavor goes above content, but below the senders name. Usually used as a title, if the header isn't being used.
//content is the regular sized text. You'd use this if you wanted it to look like a regular message
//header is the part with an image and a fancy title, used for items and abilites. header_content is the text, and header_image is a url to the image that's displayed
//card_content is small text, usually used for descriptions of abilities and items. Smaller than regular content.
//button is a client sided button that can be clicked. takes the text of the button, plus what code should run on click, and on hover. The functions are inlined in the element so that they always run, so keep them short and sweet.
//dice_formula is the formula of a die roll. It comes in a little box, and is non bolded, and can be clicked to reveal roll info.
//dice_tooltip comes in five parts, the formula for that specific part, the flavor (which should be kept short, as it does not wrap), the result of that part of the roll, and the dice themselves.
//footer is below everything, and is stuff like "fire" or "holy", short stuff that you can have multiple of and it splits it up with a little line.
class Message {
	#header = {};
	#card_content;
	#content;
	#flavor;
	#buttons = [];
	#footer = [];
	#dice = {};

	static test() {
		const msg = new Message("Content");

		function click(e) { alert("You clicked!"); }
		function hover(e) { alert("You hovered."); }

		msg.setFlavor("Flavor")
		   .setHeaderImage("https://raw.githubusercontent.com/jumpsplat120/eval/main/logo.png")
		   .setHeaderContent("Header Content")
		   .setCardContent("Card Content")
		   .addButton("ButtonA", click, hover)
		   .addButton("ButtonB", click, hover)
		   .addDieFormula("Die Formula A")
		   .addDieFormula("Die Formula B")
		   .addDieTotal("Die Total A")
		   .addDieTotal("Die Total B")
		   .addDieTooltip("Formula A", "Flavor", "Total", { size: 2, value: "Gr", special: "crit" }, { size: 20, value: "Pn", special: "fail" })
		   .addDieTooltip("Formula B", "Flavor", "Total", { size: 1, value: "X", special: "unused" }, { size: 10, value: "10" })
		   .addFooter("Footer A")
		   .addFooter("Footer B")
		   .show()
	}

	constructor(content) {
		if (content) { this.#content = content; }
	}

	set header_image(x) {
		this.setHeaderImage(x);
	}

	set header_content(x) {
		this.setHeaderContent(x);
	}

	set card_content(x) {
		this.#card_content = x;
	}

	set content(x) {
		this.#content = x;
	}

	set flavor(x) {
		this.#flavor = x;
	}

	setFlavor(text) {
		this.#flavor = text;

		return this;
	}
	
	setHeaderImage(url) {
		if (url === undefined || url === null) {
			delete this.#header.img;
		} else {
			this.#header.img = url;
		}

		return this;
	}

	setHeaderContent(text) {
		if (text === undefined || text === null) {
			delete this.#header.content;
		} else {
			this.#header.content = text;
		}

		return this;
	}

	setCardContent(text) {
		this.#card_content = text;

		return this;
	}

	setContent(text) {
		this.#content = text;

		return this;
	}

	addButton(text, onclick, onhover) {
		this.#buttons[this.#buttons.length] = { text, onclick, onhover };
		
		return this;
	}

	addFooter(text) {
		this.#footer[this.#footer.length] = text;
		
		return this;
	}

	//die totals can be red or green for fails and crits.
	//optionally pass "crit" or "fail" to color the total.
	addDieTotal(text, special) {
		if (!this.#dice.total) { this.#dice.total = []; }

		special = ({ crit: " critical", fail: " fumble" })?.[special] ?? "";

		this.#dice.total[this.#dice.total.length] = { text, special };

		return this;
	}

	addDieFormula(text) {
		if (!this.#dice.formula) { this.#dice.formula = []; }

		this.#dice.formula[this.#dice.formula.length] = text;

		return this;
	}

	//each dice is an object with the following values
	//size: 4, 6, 8, 12, 20
	//value: anything (can only fit two letters before wrapping)
	//special (optional): crit (makes it green), fail (makes it pinkish red), unused (grays it out)
	//If not specified, defaults to regular behaviour (max value of die size is green, 1's are red)
	addDieTooltip(formula = "", flavor = "", total = "", ...dice) {
		if (!this.#dice.tooltip) { this.#dice.tooltip = []; }

		const data = { formula, flavor, total };
		
		for (const die of [...dice]) {
			if (!data.dice) {data.dice = []; }

			const die_data = { size: die.size.toString(), value: die.value.toString() };
			
			if (die.special) {
				die_data.special = ({ max: "max", min: "min", discarded: "discarded", crit: "max", fail: "min", unused: "discarded" })[die.special];
			} else if (Number(die_data.value) != NaN) {
				if (die_data.value == die_data.size) { die_data.special = "max"; }
				if (die_data.value == 1) { die_data.special = "min"; }
			}

			data.dice[data.dice.length] = die_data;
		}

		this.#dice.tooltip[this.#dice.tooltip.length] = data;

		return this;
	}

	popButton() {
		return this.#buttons.pop();
	}

	popFooter() {
		return this.#footer.pop();
	}

	popDieTotal() {
		let res = this.#dice.total.pop?.();

		if (this.#dice.total?.length ?? -1 == 0) { delete this.#dice.total; }

		return res;
	}

	popDieFormula() {
		let res = this.#dice.formula.pop?.();

		if (this.#dice.formula?.length ?? -1 == 0) { delete this.#dice.formula; }

		return res;
	}

	popDieTooltip() {
		let res = this.#dice.tooltip.pop?.();

		if (this.#dice.tooltip?.length ?? -1 == 0) { delete this.#dice.tooltip; }

		return res;
	}

	#header_html() {
		let res = "";
		
		if (this.#header.length > 0) {
			res += `<header class="card-header flexrow">`;
			if (this.#header.img) { res += `<img src="${this.#header.img}" title="${this.#header.content}" width="36" height="36" />` }
			res += `<h3 class="item-name">${this.#header.content}</h3></header>`;
		}

		return res;
	}

	#card_content_html() {
		return this.#card_content ? `<div class="card-content">${this.#card_content}</div>` : "";
	}

	#content_html() {
		return this.#content ?? "";
	}

	#buttons_html() {
		let res = "";

		if (this.#buttons.length > 0) {
			res = `<div class="card-buttons">`;

			for (const button of this.#buttons) {
				//const uuid = game.saved_macro.utils.guid();
				//button_ids[button_ids.length] = { uuid: uuid, onclick: button.onclick, onmouseover: button.onmouseover, data: button.data };
				res += `<button>${button.text}</button>`;
			}

			res += "</div>";
		}

		return res;
	}

	#footer_html() {
		let res = "";

		if (this.#footer.length > 0) {
			res = `<footer class='card-footer'>`;

			for (const footer of this.#footer) { res += `<span>${footer}</span>`; }

			res += "</footer>";
		}

		return res;
	}

	#dice_html() {
		let res = "";

		if (this.#dice.length > 0) {
			res += `<div class="dice-roll"><div class="dice-result">`
			
			for (const formula of this.#dice?.formula ?? []) {
				res += `<div class="dice-formula">${formula}</div>`
			}

			if (this.#dice.tooltip?.length ?? 0 > 0) {
				res += `<div class="dice-tooltip" style="display: none;">
						<section class="tooltip-part">
						<div class="dice">`
				
				for (const tooltip of this.#dice.tooltip) {
					res += `<header class="part-header flexrow">
								<span class="part-formula">${tooltip.formula}</span>
								<span class="part-flavor">${tooltip.flavor}</span>
								<span class="part-total">${tooltip.total}</span>
							</header>
							<ol class="dice-rolls">`
					
					for (const die of tooltip?.dice ?? []) { res += `<li class="roll die d${die.size} ${die.special}">${die.value}</li>` }

					res += `</ol>`
				}

				res += `</div></section></div>`
			}

			for (const total of this.#dice?.total ?? []) {
				res += `<h4 class="dice-total${total.special}">${total.text}</h4>`;
			}

			res += `</div></div>`
		}

		return res;
	}

	show(data) {
		data = data ?? this.data ?? {};
		data.content = `${this.#content_html()}
			<div class="dnd5e chat-card item-card">
				${this.#header_html()}
				${this.#card_content_html()}
				${this.#buttons_html()}
			</div>
			${this.#dice_html()}
			<div class="dnd5e chat-card item-card">
				${this.#footer_html()}
			</div>`
		
		//the speaker is either the passed this.speaker, or uses the users character name.
		data.speaker = { alias: this.speaker ?? game.user.character.name };
		
		//only create a flavor entry if one was made
		if (this.#flavor) { data.flavor = this.#flavor; }

		ChatMessage.create(data);

		return this;
	}
}

//Takes a formula that can be built in parts, and when ran, will return a promise with a Message
//that will have a better formatting than a standard roll. Labels such as 5[fire] are removed from
//the initial formula, but still appear in the drop down. Also, non dice show up in the drop
//down along with a label. There's also a new title, using {brackets}. This is for the "title" of that
//part of the roll. So a use case would be 1d6[fire] + 1d4[holy]{Magic Enchantment}.
//That way, not only do you get the damage types, but you can also say where the source is coming from.
//The "title" is actually just the formula part, but you don't need to write 2d6 and then also show 2 d6s,
//so instead that space can be used for something more informational.
class CustomRoll {
	#item;
	#formula = "";

	constructor(item) {
		if (typeof item == "string") {
			const str = item;

			item = utils.getItemByName(item);

			if (!item) {
				ui.notifications.error(`'${str}' is not a valid item for '${game.user.character.name}'.`);
				return;
			}
		}

		if (!item) {
			ui.notifications.error(`Failed to pass an item or item name to the utils.Roll class.`);
			return;
		}

		if (!(item instanceof Item)) {
			ui.notifications.error(`'${item}' is not a valid Item.`);
			return;
		}

		this.#item = item;
	}

	#operation(op, term, label, title) {
		if (this.#formula.length > 0) { this.#formula += ` ${op} `; }

		this.#formula += `${term.toString()}${label ? `[${label}]` : ""}${title ? `{${title}}` : ""}`

		return this;
	}

	//adds a term, with an optional label and title. The first term, regardless of 
	//operation, won't have an operator precede it.
	add(term, label, title) { return this.#operation("+", term, label, title); }

	subtract(term, label, title) { return this.#operation("-", term, label, title); }

	divide(term, label, title) { return this.#operation("/", term, label, title); }

	multiply(term, label, title) { return this.#operation("*", term, label, title); }

	//opens/closes a paranthesis
	open() { this.#formula += "("; }

	close() { this.#formula += ")"; }

	//takes a conditional, and only adds/subtracts/divides/multiplies the term
	//if the conditional is true. This avoids having to build terms by breaking the roll
	//up into pieces; you can just use these maybes and chain them together. Really
	//complicated formulas might stil need things broken up but this should help with the
	//simple cases.
	maybeAdd(if_true, term, label, title) {
		if (if_true) { this.add(term, label, title); }
		
		return this;
	}

	maybeSubtract(if_true, term, label, title) {
		if (if_true) { this.subtract(term, label, title); }
		
		return this;
	}

	maybeDivide(if_true, term, label, title) {
		if (if_true) { this.divide(term, label, title); }
		
		return this;
	}

	maybeMultiply(if_true, term, label, title) {
		if (if_true) { this.multiply(term, label, title); }
		
		return this;
	}

	//function for recursive searching of terms
	#iterate(roll, arr = []) {
		for (const term of roll.terms) {
			//if it's a parenthetical term, make a new roll out of it, and get the order of stuff we care about.
			const name    = term.constructor.name;
			const formula = term.formula;

			if (name == "ParentheticalTerm") { arr = iterate(new Roll(term.term), arr); }

			//add term to result array if the constructor is 'Die'
			if (name == "Die") { arr[arr.length] = term; }
			//but only add a numeric term if it's labeled. If there's no label then there's no point in adding it
			//since we are really only adding it below for labeling purposes
			if (name == "NumericTerm" && (formula.includes("{") || formula.includes("["))) { arr[arr.length] = term; }
		}

		//flatten the array because the parathneticals will have it wonky
		return arr;
	}

	//The function to use once we get the html from the nested promises.
	#buildRoll(real_roll, html) {
		const roll    = new Roll(this.#formula);
		const message = new utils.Message();
		
		//remove labels and only display math
		message.addDieFormula(this.#formula.replace(/\[.*?\]/g, "").replace(/\{.*?\}/g, ""));

		//find the die total from the html, and use that
		message.addDieTotal(html.match(/<h4 class="dice-total(.*?)">(\d+)<\/h4>/)[2]);
		
		//using the formula, create a roll, but don't parse it, and look at all the terms to determine
		//order of tooltips. Reversing it so we can just pop the values off.
		const order = this.#iterate(roll);
		
		//get all of the pieces of already rolled die results, matcher is different to include newlines and spacing
		//add the tooltips to the new roll instance, adding in numeric values when appropriate
		for (const match of [...html.matchAll(/<section class="tooltip-part">([^]*?)<\/section>/g)]) {
			const tooltip = match[1];
			const data    = {};
			let flavor    = tooltip.match(/<span class="part-flavor">(.*?)<\/span>/);

			if (flavor) {
				flavor = flavor[1];
				if (flavor.includes("{")) {
					//if there's a title, use that
					data.formula = flavor.match(/{(.*?)}/)[1];
				}

				//flavor is whatever is left after you take out the title.
				data.flavor = flavor.replace(/{.*?}/, "");
			}

			//if there's not already a formula, use the one pulled from the html
			if (!data.formula) { data.formula = tooltip.match(/<span class="part-formula">(.*?)<\/span>/)[1]; }

			data.total = tooltip.match(/<span class="part-total">(.*?)<\/span>/)[1];
			data.dice  = [];
			
			//get each roll value, including special data
			for (const match of [...tooltip.matchAll(/<li class="(.*?)">(.*?)<\/li>/g)]) {
				const classes = match[1].split(" ");

				data.dice[data.dice.length] = { value: match[2] }
				
				//only include the first special value. If it's discarded AND max, we don't care, discarded first.
				for (const special of ["discarded", "min", "max"]) {
					if (classes.includes(special)) {
						data.dice[data.dice.length - 1].special = special;
						break;
					}
				}

				//Add in the first size we find.
				for (const size of ["d4", "d6", "d8", "d10", "d12", "d20"]) {
					if (classes.includes(size)) {
						//slice off the d, because our Message class is expecting it to just be a number.
						data.dice[data.dice.length - 1].size = size.substring(1);
						break;
					}
				}
			}

			//add in all numeric tooltips before we add in the next dice tooltip
			while (order[order.length - 1].constructor.name == "NumericTerm") {
				const term = order[order.length - 1];
				const label = term.options.flavor;
				message.addDieTooltip(label.match(/{(.*?)}/)?.[1] ?? "", label.replace(/{.*?}/, ""), term.number);
				order.pop();
			}

			message.addDieTooltip(data.formula, data.flavor, data.total, ...data.dice);
			order.pop();
		}
		
		message.data = { type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: real_roll };

		return message;
	}

	//rolls the formula, and returns the result as a chat message.
	roll() {
		if (this.#formula.length == 0) {
			ui.notifications.warn("Tried to roll an empty formula.");
			return;
		}

		//hide titles in the labels so it's parsed by foundry's roll class
		//first, we wrap any squiggly brackets in square brackets
		//then, any back to back (][) square brackets should be removed
		this.#formula = this.#formula.replace(/({.*?})/g, "[$1]").replace(/\]\[/g, "");

		//make a roll using the formula, then turn into into a message
		//then get the html from that message (not everything needs to be
		//async foundry)
		return new Roll(this.#formula).roll({async: true})
		.then(roll => roll.toMessage(null, {create: false})
				.then(data => new ChatMessage(data).getHTML())
				.then(html => this.#buildRoll(roll, html[0].outerHTML))
				.then(msg  => msg.setHeaderImage(this.#item.data.img)
								.setHeaderContent(this.#item.data.name)
								.setCardContent(this.#item.data.data.description.chat)))
	}
}

//Contains the static Advantage.check method, which checks utils.tracking for sources of advantage and disadvantage, and
//creates a dialog, and returns the result all in a promise. Also creates Advantage instances, which are
//objects that contain their advantage state, source, fa icon, and a callback for determining when the advantage has expired.
class Advantage {
	#advantage;
	#source;
	#icon;
	#expires;

	//mutates an array, removing all advantage objects that are expired. ignores anything that
	//isn't an instance of Advantage.
	static expire(array) {
		if (!Array.isArray(array)) { return; }

		for (let i = 0; i < array.length; i++) {
			if (array[i] instanceof utils.Advantage) {
				if (array[i].expired()) { array.splice(i, 1); }
			}
		}

		return array;
	}

	//Helper function that takes a pool of vantage sources, and returns an object with info
	//based on all pooled sources.
	static pool(array) {
		if (array.length == 0) { return { state: 0, label: "", formula: "1d20" }; }

		const result = { state: 0 };

		//determine state based on all sources
		for (const vantage of array) {
			result.state += vantage.advantage ? 1 : -1;
		}

		//if there's only one, form title, otherwise sort so all advantages are first, then all disadvantages
		if (array.length == 1) { 
			result.label = `${array[0].advantage ? "Advantage" : "Disadvantage"} - ${array[0].source}`;
		} else {
			array.sort((a, b) => a.advantage && b.disadvantage ? -1 : (a.disadvantage && b.advantage ? 1 : 0));
		}
		
		//title for only two entries
		if (array.length == 2) {
			result.label = `+ (${array[0].source}) / - (${array[1].source})`
		}

		//title for three entries, changes dependent on state
		if (array.length == 3) {
			if (result.state == 1) {
				result.label = `+ (multiple) / - (${array[2].source})`
			} else {
				result.label = `+ (${array[0].source}) / - (multiple)`
			}
		}

		//four and above is this
		if (array.length >= 4) {
			result.label = `+ (multiple) / - (multiple)`
		}

		result.formula = `${result.state == 1 ? "2d20kh" : (result.state == -1 ? "2d20kl" : "1d20")}`

		return result;
	}

	//returns a promise, that either waits for a dialog to finish, and gives the an array of vantage sources (can be empty),
	//or simply returns null if the dialog was closed without choosing anything.
	static async check() {
		const tracking = utils.tracking;
		const sources  = [];

		//expire all old vantages
		utils.Advantage.expire(tracking.advantage);
		utils.Advantage.expire(tracking.disadvantage);

		//add all sources of disadvantage to the pool, and tick each one as being used.
		for (const disadvantage of tracking.disadvantage) {
			sources[sources.length] = disadvantage;
		}

		const advantages       = tracking.advantage;
		const disadvantages    = tracking.disadvantage;
		const advantage_amt    = advantages.length;
		const disadvantage_amt = disadvantages.length;
		const has_disadvantage = disadvantage_amt > 0;
		const dis_plural = disadvantage_amt == 1 ? "" : "s";
		const ad_plural  = advantage_amt    == 1 ? "" : "s";
		let content;
		let bummer;

		//recursively choose x amount of advantages from choices, and place them in result array
		function callback(choices, amount, result) {
			//account for the already existing values in the result array
			amount += result.length;

			//creates and returns a dialog that shows choices from the choices array
			function choose(another) {
				const dialog = new utils.Dialog("Advantage Sources", `Choose a${another ? "nother" : ""} source of advantage.`);

				for (const choice of choices) {
					if (choice.in_use) { continue; }
					
					dialog.addButton(new utils.Button()
						.setIcon(choice.icon)
						.setText(choice.source)
						.setCallback(_ => choice))
				}

				return dialog;
			}

			//the recursive function. Keeps running itself until enough choices are made.
			function handleChoice(chosen) {
				result[result.length] = chosen;

				chosen.in_use = true;

				if (result.length < amount) { return choose(true).show().then(handleChoice); }

				return result;
			}
			
			return choose().show().then(handleChoice);
		}

		//go through array and delete the .in_use key from any values in the array
		//then, add a use key to any object that doesn't have one, and increment the value by one.
		//finally, return the array.
		function process(array) {	
			if (array === null) { return null; }

			return array.map(vantage => {
				delete vantage.in_use;

				if (!vantage.uses) { vantage.uses = 0; }

				vantage.uses++;

				return vantage;
			});
		}

		if (has_disadvantage && advantage_amt > disadvantage_amt) {
			return utils.Dialog.ok("Advantage",
				`You have ${disadvantage_amt} source${dis_plural} of disadvantage on you, 
				and have ${advantage_amt} source${ad_plural} of advantage. Would you like 
				to use your advantage${ad_plural}?`)
				.then(choice => {
					if (choice === null) { return null; }

					return new utils.Dialog()
						.setTitle("Advantage")
						.setContent(`Do you want to have advantage, or only remove your disadvantage?`)
						.addButton(new utils.Button()
							.setIcon("plus")
							.setText("Gain Advantage")
							.setCallback(_ => true))
						.addButton(new utils.Button()
							.setIcon("equals")
							.setText("Remove Disadvantage")
							.setCallback(_ => false))
						.onClose(_ => null)
						.show();
				})
				.then(choice => {
					if (choice === null) { return null; }

					//choice is implictly cast to 1 or 0
					return callback(advantages, disadvantage_amt + choice, sources);
				})
				.then(process)
		}

		if (has_disadvantage && advantage_amt == disadvantage_amt) {
			return utils.Dialog.prompt("Advantage",
				`You have ${disadvantage_amt} source${dis_plural} of disadvantage on you, 
				and have ${advantage_amt} source${ad_plural} of advantage. Would you like 
				to use your advantage${ad_plural} to remove your disadvantage${dis_plural}?`)
				.then(choice => {
					if (choice === null)  { return null; }
					if (choice === false) { return sources; }

					return callback(advantages, disadvantage_amt, sources);
				})
				.then(process)
		}

		if (has_disadvantage && advantage_amt < disadvantage_amt) {
			return utils.Dialog.ok("Advantage",
				`You have ${disadvantage_amt} source${dis_plural} of disadvantage on you, 
				but have ${advantage_amt} source${ad_plural} of advantage. Using your 
				advantage${ad_plural} won't help in this instance.`)
		}

		if (advantage_amt > 0) {
			return utils.Dialog.prompt("Advantage",
				`You have${advantage_amt == 1 ? " a " : " "}source${ad_plural} of advantage! Would you like to use ${advantage_amt == 1 ? "it" : "one"}?`)
				.then(choice => {
					if (choice === null) { return null; }

					return callback(advantages, 1, sources);
				})
				.then(process)
		}

		if (advantage_amt == 0) {
			return [];
		}
	}
	
	//set whether there is advantage, disadvantage, or neither, as well as source and optional icon.
	//The last value is the expiration function. This callback is run to determine whether the source
	//has expired or not. It's up to the user to determine when that should be checked. The Advantage
	//class provides a static function called "expire", which you can pass in an object, and it will
	//iterate over that object, removing all expired sources of advantage, and ignoring everything else.
	constructor(advantage, source, icon = "check", expires) {
		if (typeof advantage !== "boolean") {
			ui.notifications.error("Advantage can only be true or false.");
			return;
		}

		if (!source || typeof source !== "string") {
			ui.notifications.error("Invalid source for advantage.");
			return;
		}

		if (!expires || typeof expires !== "function") {
			ui.notifications.error("Invalid expires function for advantage.");
			return;
		}

		icon = icon.toString();

		if (utils.validateFA(icon)) {
			this.#icon = icon;
		} else {
			console.warn(`'${icon}' is not a valid font awesome icon. Setting to checkmark default.`);
			icon = "check";
		}

		this.#advantage = advantage;
		this.#expires   = expires;
		this.#source    = source;
		this.#icon      = icon;
	}

	//Runs the expires function. If this function returns a truthy value, then the Advantage instance should be removed.
	expired() { return this.#expires(this); }

	get source() { return this.#source; }
	
	get icon() { return this.#icon; }

	get advantage() { return this.#advantage; }

	get disadvantage() { return !this.#advantage; }

	set source(x) { console.warn("Advantage source is immutable. Rather than change the source, make a new instance."); }
	
	set icon(x) { console.warn("Advantage icon is immutable. Rather than change the icon, make a new instance."); }

	set advantage(x) { console.warn("Advantage state is immutable. Rather than change the state, make a new instance."); }

	set disadvantage(x) { console.warn("Advantage state is immutable. Rather than change the state, make a new instance."); }
}

//Creates a dialog button, for use in the custom dialog class.
class DialogButton {
	#key;
	#icon;
	#text;
	#callback;

	//Buttons have keys as a way to reference them within the dialog.
	//You can make a button with a custom keys, or let it be auto generated.
	//It's expected that you'd create one initially, but you can use the
	//setter to do it as well. It doesn't have a helper method, however.
	constructor(key) {
		this.#key = key?.toString?.() ?? utils.guid();
	}

	set key(x) { this.#key = key.toString(); }

	set icon(x) { this.setIcon(x); }

	set text(x) { this.setText(x); }

	set label(x) { this.setText(x); }

	set callback(x) { this.setCallback(x); }

	get key() { return this.#key; }

	get icon() { return this.#icon; }

	get text() { return this.#text; }

	get label() { return this.#text; }

	get callback() { return this.#callback; }

	setIcon(icon) {
		icon = icon.toString();

		if (utils.validateFA(icon)) {
			this.#icon = icon;
		} else {
			console.warn(`'${icon}' is not a valid font awesome icon. Setting to checkmark default.`);

			this.#icon = "check";
		}

		return this;
	}

	setText(text) {
		this.#text = text.toString();

		return this;
	}

	setLabel(label) {
		return this.setText(label);
	}

	setCallback(callback) {
		if (typeof callback != "function") {
			ui.notifications.error("Failed to build button as passed callback was not a function.");
			return;
		}

		this.#callback = callback;

		return this;
	}

	//returns the object used in the vanilla foundry Dialog class.
	get object() {
		return {
			icon: `<i class="fas fa-${this.#icon ?? "check"}"></i>`,
			label: this.#text ?? "",
			callback: this.#callback ?? function() {}
		};
	}

	set object(x) { console.warn("Can not set object of button directly."); }
}

//Creates a dialog more seamlessly. After building a dialog, showing it returns a promise, that runs once
//and option has been picked, including closing the dialog box. Callbacks are run, and the value of the
//callback is returned in the promise.
class CustomDialog {
	#title;
	#buttons = {};
	#content;
	#default;
	#close;
	#promises = [];

	//helper function that builds a simple dialog that has an okay button. All values are optional.
	static ok(title, content, ok, close) {
		ok    = ok    ?? (_ => true);
		close = close ?? (_ => null);

		return new utils.Dialog(title, content)
			.addButton(new utils.Button()
				.setIcon("check")
				.setText("Ok")
				.setCallback(ok))
			.onClose(close)
			.show()
	}

	//helper function that builds a simple dialog with a yes and no button. All values are optional.
	static prompt(title, content, yes, no, close) {
		yes   = yes   ?? (_ => true);
		no    = no    ?? (_ => false);
		close = close ?? (_ => null);

		return new utils.Dialog(title, content)
			.addButton(new utils.Button()
				.setIcon("check")
				.setText("Yes")
				.setCallback(yes))
			.addButton(new utils.Button()
				.setIcon("times")
				.setText("No")
				.setCallback(no))
			.onClose(close)
			.show()
	}

	//Dialogs don't need a title and content, but they can be defined initially, or defined in
	//one of the chaining functions
	constructor(title = "", content = "") {
		this.#title = title.toString();
		this.#content = content.toString();
	}

	//since this is directly referencing the object, this allows you to
	//modify a button directly, without having to pull it out, change it,
	//and put it back in.
	get buttons() { return this.#buttons; }

	get title() { return this.#title; }

	get content() { return this.#content; }

	set buttons(x) { console.warn("You can not set a buttons object directly. Use the add/removeButton methods."); }
	
	set title(x) { this.setTitle(x); }

	set content(x) { this.setContent(x); }

	setTitle(title) {
		this.#title = title.toString();

		return this;
	}

	setContent(content) {
		this.#content = content.toString();

		return this;
	}

	//Takes a Button instance, which is a util Class that contains all the relevant button things.
	//takes an optional value that determines whether or not that button is considered the "default"
	//option. The first button will always be considered default if one is not specified.
	addButton(button, is_default) {
		if (!(button instanceof utils.Button)) {
			ui.notifications.error(`Failed to add '${button.toString()}' to Dialog as it's not a Button instance.`);
			return;
		}

		this.#buttons[button.key] = button;

		if (is_default || this.#buttons.length == 1) { this.#default = button.text; }

		return this;
	}

	//Removes a button by label.
	removeButton(label) {
		if (this.#buttons[label] === undefined) {
			console.warn(`No button labeled '${label}' was found in Dialog buttons.`);
		} else {
			delete this.#buttons[label];
		}

		return this;
	}

	//The callback that runs when the dialog is closed.
	onClose(callback) {
		if (typeof callback != "function") {
			ui.notifications.warn("Failed to build dialog as passed 'close' callback was not a function.");
			return;
		}

		this.#close = callback;

		return this;
	}

	//shows the dialog, and returns a promise, which resolves when the dialog is closed, whether by
	//selecting a button, or simply x'ing it out. default is a keyword, so we use square bracket
	//notation to avoid errors.
	async show() {
		return new Promise((resolve) => {
			const data = {
				title: this.#title,
				content: this.#content,
				["default"]: this.#default,
				buttons: {}
			};
	
			for (const [key, button] of Object.entries(this.#buttons)) {
				const obj = button.object;
				const f   = obj.callback;

				//promisifies the original callback
				obj.callback = function() { resolve(f()); };
	
				data.buttons[key] = obj;
			}
			
			if (this.#close) {
				//scopes the close function, otherwise it can't be accessed.
				const f = this.#close;
				
				data.close = function() { resolve(f()); };
			}

			new Dialog(data).render(true);
		})
	}
}

window.utils = {};

//Message class for building a message.
utils.Message = Message;

//Roll class for building a better roll.
utils.Roll = CustomRoll;

//Advantage class for checking and working with advantage.
utils.Advantage = Advantage;

//Button class for creating Dialog Buttons.
utils.Button = DialogButton;

//Dialog class for creating better dialogs.
utils.Dialog = CustomDialog;

//Helper function that wraps Dialog.prompt. Uses intelligent defaults
utils.prompt = () => {

}

//vaidates if a string is a valid Font Awesome Icon
utils.validateFA = icon => {
	//look through styles sheets
	for (const sheet of [...document.styleSheets]) {
		//when we find the fontawesome one...
		if (sheet?.href?.includes?.("fontawesome")) {
			//look at all the rules...
			for (const rule of [...sheet.cssRules]) {
				//if it's a stylerule, and if the selectorText matches the attempted icon...
				if (rule.constructor.name == "CSSStyleRule" && rule.selectorText.match(`fa-${icon}::before`)) {
					return true;
				}
			}
			//once we found the fa sheet, we don't need to keep looking.
			break;
		}
	}

	return false;
}

//Helper for the helper. Plays a sound with intelligent defaults, and returns a promise
//that fires when the sound is done playing. returns the sound object that was playing.
utils.playSound = (src, volume = 0.8, autoplay = true, loop = false, send = false) => {
	if (!src) {
		ui.notifications.warn("No sound was given to playSound.");
		return;
 	}

	return AudioHelper.play({ src, volume, autoplay, loop }, send)
		.then(sound => {
			//some sounds are so short, that by the time we get the sound instance
			//they're already done playing. If they're playing, we schedule, but if
			//not, just return the sound directly.
			if (sound.isPlaying) { return sound.schedule(_ => sound, sound.duration); }
			return sound;
		});
}

//Returns true if a key is being pressed.
utils.isPressed  = key => !!utils.pressed_keys[key.toLowerCase()];

//takes a name like 'Wooden Sword' and returns 'wooden_sword'
utils.simpleName = item_name => item_name.replaceAll(" ", "_").toLowerCase();

//takes a name like 'wooden_sword' and returns 'Wooden Sword'
utils.fancyName  = item_name => item_name.replaceAll("_", " ").toTitleCase();

//creates a prompt for rerolling via the lucky feat. takes two callbacks,
//which are called when the prompt is answered yes or no.
utils.luckyPrompt = (yes, no) => {
	new Dialog({
		title: "Lucky",
		content: "Is this a reroll for the Lucky feat?",
		buttons: {
			yes: { icon: '<i class="fas fa-check"></i>', label: "Yes", callback: yes },
			no:  { icon: '<i class="fas fa-times"></i>', label: "No", callback: no   }
		}
	}).render(true);
}

//gets an item from a character, or from the local character, by name. Takes
//names like wooden_sword as well as Wooden Sword
utils.getItemByName = (item_name, character) => {	
	const name = utils.simpleName(item_name);

	for (const item of [...(character ?? game.user.character).data.items.values()]) {
		if (utils.simpleName(item.name) === name) { return item; }
	}
}

//helper function that returns an array of pronouns, based on a character's gender,
//as determined by their character sheet. Very simple, only returns masc, fem, or neutral pronouns. 
utils.getPronouns = character => {
	const gender = (character ?? game.user.character).data.data.details.gender.toLowerCase();
	return !!({ female: true, girl: true, gal: true, woman: true, f: true, fem: true, ["she/her"]: true })[gender] ? ["she", "her", "herself", "hers", "her"] :
		   !!({ male: true, boy: true, guy: true, man: true, m: true, masc: true, ["he/him"]: true })[gender]      ? ["he", "him", "himself", "his", "his"]   : 
		   																											 ["they", "them", "themselves", "theirs", "their"];
}

function changeQuantity(item, amount, type) {
	if (typeof item == "string") {
		const i = utils.getItemByName(item);
		let total = 0;

		if (!i) { 
			ui.notifications.error(`Utils | Failed to find an item by the name ${item}`);
			return;
		}

		item = i;
	}
	
	if (item?.data?.data?.quantity === undefined) {
		ui.notifications.error(`Utils | ${item.name} does not have a quantity to change.`);
		return;
	}

	if (typeof amount !== "number") {
		const grammar = type === "set" ? "to" : "by";
		ui.notifications.error(`Utils | ${amount} is not a numeric value to ${type} quantity ${grammar}.`);
		return;
	}
	
	if (type == "decrease" && item.data.data.quantity - amount >= 0) {
		ui.notifications.warn(`Utils | Subtracting ${amount} ${item.name} will put you under zero quantity. This should be accounted for. Setting quantity to zero...`);
	} else if (type == "set" && amount < 0) {
		ui.notifications.warn(`Utils | ${amount} is less than zero. This should be handled. Setting quantity to zero...`);
	} else {
		if (type == "increase") { total = item.data.data.quantity + amount; }
		if (type == "decrease") { total = item.data.data.quantity - amount; }
		if (type == "set")      { total = amount; }
	}

	item.update({ "data.quantity": total });
}

//increase the quantity of an item.
utils.increaseItemQuantity = (item, amount) => {
	changeQuantity(item, amount, "increase");
}

//decrease thr quantity of an item.
utils.decreaseItemQuantity = (item, amount) => {
	changeQuantity(item, amount, "decrease");
}

//set the quantity of an item.
utils.setItemQuantity = (item, amount) => {
	changeQuantity(item, amount, "set");
}

//returns a global uuid, in the format of '94f87472-e276-6d50-71e5-880e3ca6675e'
utils.guid = _ => {
	function f(s) {
		let p = (Math.random().toString(16) + "000000000").substr(2, 8);
		return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
	}

	return f() + f(true) + f(true) + f();
}

utils.tracking = {};

utils.tracking.arrows = 0;
utils.tracking.keys   = {};
utils.tracking.advantage    = [];
utils.tracking.disadvantage = [];
utils.tracking.damage    = {};

utils.sounds = {};

utils.sounds.bruh = ["https://www.jumpsplat120.com/assets/sfx/misc/bruh.mp3"];
utils.sounds.bugs = ["https://www.jumpsplat120.com/assets/sfx/misc/bugs.mp3"];

utils.sounds.bow_draw = [
	"https://www.jumpsplat120.com/assets/sfx/bow/draw/1.mp3",
	"https://www.jumpsplat120.com/assets/sfx/bow/draw/2.mp3",
	"https://www.jumpsplat120.com/assets/sfx/bow/draw/3.mp3",
	"https://www.jumpsplat120.com/assets/sfx/bow/draw/4.mp3",
	"https://www.jumpsplat120.com/assets/sfx/bow/draw/5.mp3",
	"https://www.jumpsplat120.com/assets/sfx/bow/draw/6.mp3"
]

utils.sounds.dagger_swing = [
	"https://www.jumpsplat120.com/assets/sfx/dagger/swing/1.wav",
	"https://www.jumpsplat120.com/assets/sfx/dagger/swing/2.wav",
	"https://www.jumpsplat120.com/assets/sfx/dagger/swing/3.wav",
	"https://www.jumpsplat120.com/assets/sfx/dagger/swing/4.wav",
	"https://www.jumpsplat120.com/assets/sfx/dagger/swing/5.wav"
]

//tracks if a key is currently being pressed down or not.
document.addEventListener("keydown", event => { utils.tracking.keys[event.key.toLowerCase()] = true;  });
document.addEventListener("keyup",  event =>  { utils.tracking.keys[event.key.toLowerCase()] = false; });

console.log("Macros | Setup has finished.");