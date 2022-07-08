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
		   .send()
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

	addDieTotal(text) {
		if (!this.#dice.total) { this.#dice.total = []; }

		this.#dice.total[this.#dice.total.length] = text;

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
				res += `<h4 class="dice-total">${total}</h4>`;
			}

			res += `</div></div>`
		}

		return res;
	}

	send(data) {
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
		message.addDieTotal(html.match(/<h4 class="dice-total">(\d+)<\/h4>/)[1]);
		
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
	run() {
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

window.utils = {};

//Message class for building a message.
utils.Message = Message;

//Roll class for building a better roll.
utils.Roll = CustomRoll;

utils.checkAdvantage = _ => undefined;
//Helper function that wraps Dialog.prompt. Uses intelligent defaults
utils.prompt = () => {

}

//Creates a damage entry, which is saved in tracking, and can be used to roll for damage.

//Helper for the helper. Plays a sound with intelligent defaults
utils.playSound  = (src, volume = 0.8, autoplay = true, loop = false, send = false) => {
	if (!src) {
		ui.notifications.warn("No sound was given to playSound.");
		return;
 	}

	AudioHelper.play({ src, volume, autoplay, loop }, send);
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

//creates a prompt for handling advantage. takes two callbacks, which are
//called when the prompt is answered yes or no.
utils.advantagePrompt = (yes, no) => {
	return new Dialog({
		title: "Advantage",
		content: "You have sources of advantage! Would you like to use one?",
		buttons: {
			yes: {
				icon: '<i class="fas fa-check"></i>',
				label: "Yes",
				callback: event => {
					const buttons = {}
					game.saved_macro.tracking.advantage.forEach((advantage, i) => {
						buttons[u.simpleName(advantage[0])] = {
							icon: `<i class="fas fa-${advantage[2]}"></i>`,
							label: advantage[0],
							callback: _ => {
								advantage[3]();
								yes(advantage);
								advantage[1]--;
								if (advantage[1] == 0) { t.advantage.splice(i, 1); }
							}
						}
					})
					let d = new Dialog({
						title: "Advantage Sources",
						content: "Please choose a source of advantage.",
						buttons: buttons
					}).render(true);
				}
			},
			no: {
				icon: '<i class="fas fa-times"></i>',
				label: "No",
				callback: no
			}
		}
	})
}

//helper function that returns an object used for Dialogs
utils.createButton = (label, fa_icon, callback) => {
	return { icon: `<i class="fas fa-${fa_icon}"></i>`,
			 label: label,
			 callback: callback }
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
utils.tracking.advantage = [];
utils.tracking.damage    = {};

utils.sounds = {};

utils.sounds.bruh = ["https://www.jumpsplat120.com/assets/sfx/misc/bruh.mp3"];
utils.sounds.bruh = ["https://www.jumpsplat120.com/assets/sfx/misc/bugs.mp3"];

utils.sounds.bow_draw = [
	"https://www.jumpsplat120.com/assets/sfx/bow/draw/1.mp3",
	"https://www.jumpsplat120.com/assets/sfx/bow/draw/2.mp3",
	"https://www.jumpsplat120.com/assets/sfx/bow/draw/3.mp3",
	"https://www.jumpsplat120.com/assets/sfx/bow/draw/4.mp3",
	"https://www.jumpsplat120.com/assets/sfx/bow/draw/5.mp3",
	"https://www.jumpsplat120.com/assets/sfx/bow/draw/6.mp3"
]

//tracks if a key is currently being pressed or not.
document.addEventListener("keydown", event => { utils.tracking.keys[event.key.toLowerCase()] = true;  });
document.addEventListener("keyup",  event =>  { utils.tracking.keys[event.key.toLowerCase()] = false; });