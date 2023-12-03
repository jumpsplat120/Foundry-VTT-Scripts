const utils = {};

utils.macro_setup = window.macro_setup;

if (!utils.macro_setup) {
	/**
     * Takes an object, and returns a number specifying how many key/value pairs are contained in the object.
	 * 
	 * @returns {number} The amount of items in the object.
     */
	Object.defineProperty(Object.prototype, "length", {
		get() { return Object.keys(this).length; },
		set() { },
		enumerable: false,
		writeable: false
	});

	/**
     * Takes an array, and returns a random single item from the array.
	 * 
	 * @returns {any} A random item from the array.
     */
	Object.defineProperty(Array.prototype, "random", {
		get() { return this[Math.floor(Math.random() * this.length)]; },
		set() { },
		enumerable: false,
		writeable: false
	})

	/**
     * Takes an object, and returns a random single value from the object.
	 * 
	 * @returns {any} A random value from the object.
     */
	Object.defineProperty(Object.prototype, "random", {
		get() { return this[Object.keys(this).random]; },
		set() { },
		enumerable: false,
		writeable: false
	});

	/**
     * Take a number, and map it from one range to another. So if your initial range was 1 - 4, and your new range
	 * was 4 - 40, and the input number was 2, then your new number is 22, since 2 is half way between 1 and 4, and
	 * 22 is half way between 4 and 40.
	 * 
	 * @param {number} from_min The minimum of the initial range.
	 * @param {number} from_max The maximum of the initial range.
	 * @param {number} to_min The minimum of the new range.
	 * @param {number} to_max The maximum of the new range.
	 * 
	 * @returns {number} The new number, mapped from the initial range to the new range.
     */
	Object.defineProperty(Number.prototype, "map", { value: function(from_min, from_max, to_min, to_max) {
		return (this - from_min) * (to_max - to_min) / (from_max - from_min) + to_min;
	}});

	/**
     * Takes a string, and returns that string with the first character near a space with an uppercase version of it.
	 * 
	 * For example, the sentence `hello world` would become `Hello World`.
	 * 
	 * @returns {string} The titlecased string.
     */
	Object.defineProperty(String.prototype, "toTitleCase", { value: function() {
		return this.split(" ").map(val => `${val.slice(0, 1).toUpperCase()}${val.slice(1)}`).join(" ");
	}});

	/**
     * Returns the portion of a string after the search part of the string. If the search doesn't exist in
	 * the initial string, returns an empty string.
	 * 
	 * @param {string} search The string to search for.
	 * 
	 * @returns {string} The new portion of string.
     */
	Object.defineProperty(String.prototype, "after", { value: function(search) {
		return this.split(search)[1];
	}});

	/**
     * Returns the portion of a string before the search part of the string. If the search doesn't exist in
	 * the initial string, returns an empty string.
	 *
	 * @param {string} search The string to search for.
	 * 
	 * @returns {string} The new portion of string.
     */
	Object.defineProperty(String.prototype, "before", { value: function(search) {
		const arr = this.split(search);

		return arr[0] === this ? undefined : arr[0];
	}});

	/**
     * Returns the initial array, with any duplicates removed.
	 * 
	 * @returns {array} The deduplicated array.
     */
	Object.defineProperty(Array.prototype, "deduplicate", { value: function() {
		const set = new Set();

		for (const value of this) {
			set.add(value);
		}

		return Array.from(set);
	}});
}

/**
 * The pronoun object returned from the `pronouns` getter on a `Character` instance.
 * 
 * @typedef  {object} pronouns
 * @property {string} themselves
 * @property {string} theirs
 * @property {string} their
 * @property {string} they
 * @property {string} them
 */

/**
 * The rechargeResults object returned from the `recharge` method on a `Item` instance.
 * 
 * @typedef  {object} rechargeResults
 * @property {CustomRoll} roll The `CustomRoll` instance that has already been rolled with the recharge method.
 * @property {Message} message The `Message` instance that was built from the `CustomRoll` instance, and has not been displayed.
 */

/**
 * Run a function, and if it's true, resolve the promise. If false, then wait's 0ms, i.e., run in the next
 * iteration of the event loop. If there's a timeout, then it will only wait until that amount of milliseconds
 * maximum, then will resolve and return `false`.
 * 
 * @param {function} func The function you want to run. If the function returns `true`, then will resolve the Promise. If it returns anything else, then will run the function again on the next loop.
 * @param {number} timeout The amount of milliseconds before the waitUntil function is forcibly resolved as `false`. If not provided, the waitUntil function will run infinitely.
 * 
 * @returns {Promise<boolean>} A Promise that resolves after `func` returns true.
 */
async function waitUntil(func, timeout) {
    let start_time = Date.now();

    function wrapper(done) {
        if (timeout && Date.now() - start_time >= timeout) done(false);
        if (func()) done(true);

        setTimeout(wrapper, 0, done);
    }

    return new Promise(done => {
        setTimeout(wrapper, 0, done);
    });
}

/**
 * Waits a certain amount of time before resolving a Promise.
 * 
 * @param {number} ms The amount of millseconds before the Promise resolves. By default is 0 milliseconds.
 * 
 * @returns {Promise<undefined>} A Promise that resolves after `ms` millseconds.
 */
async function wait(ms) {
    return new Promise(done => { setTimeout(done, ms || 0); });
}

/**
 * AudioHelper helper; makes playing a sound even easier with intelligent defaults, and returns the sound instance to be manipulated.
 * 
 * @param {string} src A URI that points towards a valid sound file. May run into CORS issues when pointed to off-server audio content.
 * @param {number} volume A number between 0 and 1, corresponding to the percentage the sound should be played at. 0 is no sound, while 1 is at maximum volume.
 * @param {boolean} autoplay If true, plays the sound immediately after loading. Otherwise, the sound instance that was returned will need to be manually triggered.
 * @param {boolean} loop If true, will loop the sound after ending. You will need to use the returned sound instance to stop the sound from playing.
 * @param {boolean} send If true, will send the sound to everyone else and play it for them as well.
 * 
 * @returns {Sound} A Foundary sound instance.
 */
async function playSound(src, volume = 0.8, autoplay = true, loop = false, send = true) {
	const sound = await AudioHelper.play({ src, volume, autoplay, loop }, send);
	
	//some sounds are so short, that by the time we get the sound instance
	//they're already done playing. If they're playing, we schedule, but if
	//not, just return the sound directly.
	if (sound.isPlaying) return sound.schedule(_ => sound, sound.duration);

	return sound;
}

/**
 * Takes an object, and dumps all the key/value pairs into another object. Generally used to
 * take an object and place it into the window/global space.
 * 
 * @param {object} obj The object you want to copy into another.
 * @param {object} dump The object you want to copy into. If none is specified, defaults to `window`.
 */
function pollute(obj, dump) {
	const space = dump || window;

	for (const [key, value] of Object.entries(obj)) space[key] = value;
}

/**
 * Searches through an ActorDirectory to find an Actor by name.
 * 
 * @param {ActorDirectory} dir The directory to search through.
 * @param {string} name The name of the Actor you're searching for. Non case-sensitive, and ignores non alphanumeric characters.
 * 
 * @returns {Actor|null} Returns the Actor, if one is found.
 */
function searchDirectory(dir, name) {
	if (dir === undefined)                                     throw new Error("'dir' was not specified.");
	if (!dir.reduce)                                           throw new Error("'dir' is missing a 'reduce' function.");
	if (!(typeof name === "string" || name instanceof String)) throw new Error("'name' is not a string.");

	const regex = /[^\w\d]/ig;

	name = name.toLowerCase().replaceAll(regex, "");

	return dir.reduce((a, b) => { if (b.name.replaceAll(regex, "").toLowerCase() === name) { return b; } return a; });
}

/**
 * Checks if a string is a valid Font Awesome Icon that can be used.
 * 
 * @param {string} icon The icon name to look for in stylesheets.
 * 
 * @returns {boolean}
 */
function validateFontAwesome(icon) {
	//look through styles sheets...
	for (const sheet of [...document.styleSheets]) {
		//when we find the fontawesome one...
		if (sheet?.href?.includes?.("fontawesome")) {
			//look at all the rules...
			for (const rule of [...sheet.cssRules]) {
				//if it's a stylerule, and if the selectorText matches the attempted icon...
				if (rule.constructor.name === "CSSStyleRule" && rule.selectorText.match(`fa-${icon}::before`)) return true;
			}

			//once we found the fa sheet, we don't need to keep looking.
			break;
		}
	}

	return false;
}

/**
 * Display a warning message on the screen where the user can see. Automatically attaches `Macro Utilities | ` in front of the message.
 * 
 * @param {string} message The message you wish to display. If no message is provided, defaults to `Warning!`.
 * @param {boolean} permanent Whether the warning should stay permanently displayed until dismissed.
 */
function warn(message, permanent = false) {
	if (!(typeof message === "string" || message instanceof String) || message === "") message = "Warning!";
	
	permanent = !!permanent;

	ui.notifications.notify(`Macro Utilities | ${message}`, "warning", { permanent });
}

/**
 * Display an error message on the screen where the user can see. Automatically attaches `Macro Utilities | ` in front of the message.
 * 
 * @param {string} message The message you wish to display. If no message is provided, defaults to `Error!`.
 * @param {boolean} permanent Whether the error should stay permanently displayed until dismissed.
 */
function error(message, permanent = false) {
	if (!(typeof message === "string" || message instanceof String) || message === "") message = "Error!";

	permanent = !!permanent;

	ui.notifications.notify(`Macro Utilities | ${message}`, "error", { permanent });
}

/**
 * Display an info message on the screen where the user can see. Automatically attaches `Macro Utilities | ` in front of the message.
 * 
 * @param {string} message The message you wish to display. If no message is provided, defaults to `Info!`.
 * @param {boolean} permanent Whether the info should stay permanently displayed until dismissed.
 */
function info(message, permanent = false) {
	if (!(typeof message === "string" || message instanceof String) || message === "") message = "Error!";

	permanent = !!permanent;

	ui.notifications.notify(`Macro Utilities | ${message}`, "info", { permanent });
}

/**
 * If the initial value is `false`, then the message is displayed, and a `MacroError`
 * is thrown with the same message. `if_false` is explicitly checked for either `undefined`,
 * `false` or `null`. Other falsey values, such as `""`, `0`, and `NaN` do not count
 * as false.
 * 
 * @param {boolean} if_false If this value is false, throws an error and displays a message, otherwise this function does nothing.
 * @param {string} message The message to be displayed, and the message used in the `MacroError`. Whatever the message, it is appended with `Macro Utilities | `.
 * @param {function} type The type of notification pop up can be changed by passing in either the `error`, `warn` or `info` function.
 * @param {boolean} permanent Whether the info should stay permanently displayed until dismissed.
 */
function assert(if_false, message = "Error!", type = error, permanent = false) {
	if (!(if_false === false || if_false === undefined || if_false === null)) return;
	if (!(type === error || type === warn || type === info)) type = error;

	type(message, permanent);

	throw new MacroError(message);
}

/**
 * Generate's a uuid, in the format "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", where `x` is an alpha-numeric character, all lowercase.
 * 
 * @returns {string} The uuid string.
 */
function generateUUID() {
	function f(s) {
		let p = (Math.random().toString(16) + "000000000").substr(2, 8);
		return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
	}

	return f() + f(true) + f(true) + f();
}

/**
 * The class used generally for extending custom errors. Can not be called on it's own,
 * but takes all values passed (rather than just a single value like the vanilla `Error` does),
 * and also has a toString that contains both the name and message of the error instance.
 */
 class CustomError extends Error {	
    constructor(...message) {
        super(...message);

        if (this instanceof AbstractError) throw new AbstractError("Unable to instantiate the 'AbstractError' class directly.");
        if (this instanceof CustomError)   throw new AbstractError("Unable to instantiate the 'CustomError' class directly.");

		this.name = "custom_error";
    }

	get name() { return this.#name; }

    toString() { return `[<${this.name}> ${this.message}]`; }
}

/**
 * Error for when you try to instansiate something that isn't meant to be instansiate.
 * Not actually abstract itself.
 */
class AbstractError extends CustomError {
    constructor(m = "This is an abstract class, and can not be instantiated directly.", ...essage) {
        super(m, ...essage);

        this.name = "abstract_error";
    }
}

/**
 * Error for when anything goes wrong in the `Macro Utils` macro. Used internally in `assert`.
 */
class MacroError extends CustomError {
	constructor(m = "Something in Macro Utilities has failed.", ...essage) {
        super(m, ...essage);

        this.name = "macro_error";
    }
}


/**
 * Wrapper class for handling Actor5e characters.
 */
class Character {
	#actor;

	/**
	 * Gets an item that the character owns by name.
	 * 
	 * @param {string} character_name The actor name to search by. If one is not provided, uses the user's main character, as determined by `game.user.character.name`.
	 * 
	 * @returns {Character} An instance of the character class.
	 */
	constructor(character_name) {
		let name = character_name || game?.user?.character?.name;
		    name = name.trim();
		    name = name === "" ? undefined : name;

		if (name === undefined) throw new Error("Name was not specified, and user does not have a character.");

		this.#actor = searchDirectory(game.actors, name);

		if (this.#actor === undefined) throw new Error(`No actor was found with the name '${name}'.`);
	}

	/**
	 * Gets an item that the character owns by name.
	 * 
	 * @param {string} item_name The item's name to search by. Non case sensitive, and ignores spaces.
	 * 
	 * @returns {Item|null} Returns either the item, if the character owns it, or null if one is not found.
	 */
	get(item_name) {
		const name = (item_name || "").trim(" ", "").toLowerCase();

		for (const item of [...character.data.items.values()]) {
			if (item.name.trim(" ", "").toLowerCase() === name) return new Item(item);
		}
	}

	/**
	 * An object of pronouns based on the gender on the character sheet. Defaults to neutral pronouns if no gender is found, or otherwise can not be determined.
	 * 
	 * @returns {pronouns} Returns an object with neutral pronouns as keys, and assumed pronouns as values.
	 */
	get pronouns() {
		const gender = (this.#actor?.data?.data?.details?.gender || "").toLowerCase();

		const fem = {
			themselves: "herself",
			theirs: "hers",
			their: "her",
			they: "she",
			them: "her"
		};

		const masc = {
			themselves: "hisself",
			theirs: "his",
			their: "his",
			they: "he",
			them: "him"
		};

		const neutral = {
			themselves: "themselves",
			theirs: "theirs",
			their: "their",
			they: "they",
			them: "them"
		};

		if (gender.includes("she/her")) return fem;
		if (gender.includes("female"))  return fem;
		if (gender.includes("woman"))   return fem;
		if (gender.includes("girl"))    return fem;
		if (gender.includes("gal"))     return fem;
		if (gender.includes("fem"))     return fem;
		if (gender === "f")             return fem;

		if (gender.includes("he/him")) return masc;
		if (gender.includes("male"))   return masc;
		if (gender.includes("masc"))   return masc;
		if (gender.includes("boy"))    return masc;
		if (gender.includes("guy"))    return masc;
		if (gender.includes("man"))    return masc;
		if (gender === "m")            return masc;

		return neutral;
	}

	/**
	 * Returns all items owned by the character.
	 * 
	 * @returns {Items[]} An array of `Item` instances.
	 */
	get items() {
		const results = [];

		for (const item of [...character.data.items.values()]) results[results.length] = new Item(item); 

		return results;
	}
}

/**
 * Wrapper class for handling Item5e items.
 */
class Item {
	#item;

	/**
	 * Takes an `Item5e` instance, and returns an `Item` instance, that has helper functions for updating values across the server.
	 * 
	 * @param {Item5e} item The `Item5e` instance. Validates by checking the constructor name of the `raw_item`.
	 * 
	 * @returns {Item} The `Item` instance.
	 */
	constructor(item) {
		assert(item.constructor.name === "Item5e", "Failed to build Item instance; 'item' is not an Item5e instance.");
		
		this.#item = item;
	}

	/**
	 * Uses `system.uses.recovery` to build a `CustomRoll`, and displays a `CustomDialog`. If the dialog
	 * is not cancelled, then return a rolled `CustomRoll` instance using the item's recovery formula,
	 * along with the `Message` instance it generates.
	 * 
	 * @param {string=} title The title of the `CustomDialog` instance. If not provided, uses the item's name.
	 * @param {string=} content The content of the `CustomDialog` instance. If not provided, uses a simple message with an inline link to the item.
	 * 
	 * @returns {rechargeResults=} An object containing the `Message` and `CustomRoll` instance.
	 */
	async recharge(title, content) {
		const roll    = new CustomRoll(this.recovery);
		const message = await roll.roll();

		message.header_content = this.name;
		message.card_content   = this.chat_description;
		message.header_image   = this.image;
		
		const response = await CustomDialog.ok(
			title   || `Recharge ${this.name.toTitleCase()}`,
			content || `<p>You're about to recharge your ${this.link}!</p>`);

		if (!response) return;

		return { message, roll };
	}

	/**
	 * A URI pointing to the image used for this item.
	 * 
	 * @returns {string}
	 */
	get image() {
		return this.#item.img;
	}

	/**
	 * The description of the item.
	 * 
	 * @returns {string}
	 */
	get description() {
		return this.#item.system.description.value;
	}

	/**
	 * The recovery formula of the item.
	 * 
	 * @returns {string}
	 */
	get recovery() {
		return this.#item.system.uses.recovery;
	}

	/**
	 * The quantity of the item.
	 * 
	 * @returns {number}
	 */
	get quantity() {
		return this.#item.system.quantity;
	}

	/**
	 * The charges/uses of the item.
	 * 
	 * @returns {number}
	 */
	get charges() {
		return this.#item.system.uses.value;
	}

	/**
	 * The maximum charges/uses of the item.
	 * 
	 * @returns {number}
	 */
	 get max_charges() {
		return this.#item.system.uses.max;
	}

	/**
	 * Returns the chat ID, which, when parsed, gives a clickable that opens up the item ingame.
	 * 
	 * @returns {string}
	 */
	get chat_id() {
		return this.#item.link;
	}

	/**
	 * The name of the item.
	 * 
	 * @returns {string}
	 */
	get name() {
		return this.#item.name;
	}

	/**
	 * The raw html link to the linked item. This is similar to `chat_id`, but does the parsing internally, and may not be 100% accurate to the chat_id process.
	 * 
	 * @returns {string}
	 */
	get link() {
		return `<a class="content-link" draggable="true" data-uuid="${this.chat_id.split("@UUID").pop().before("]").after("[")}" data-id="${this.#item.id}" data-type="Item" data-tooltip="${this.#item.type.toTitleCase()} Item"><i class="fas fa-suitcase"></i>${this.name}</a>`
	}

	/**
	 * Sets the charges/uses of the item, using the update method to send that info to the server as well.
	 * Normally, you want to use the `recharge` method, which uses the `recovery` roll data to build a roll.
	 * Will clamp the value between 0, and the maximum.
	 * 
	 * @param {number} value Will post an error if the value is not a number.
	 */
	set charges(value) {
		if (typeof value !== "number") value = Number(value);
		if (typeof value !== "number") error(`Unable to change '${this.name}' charges; '${value}' is not of type 'number'.`);
		if (value === NaN)             error(`Unable to change '${this.name}' charges; '${value}' can not be converted to 'number'.`);

		this.#item.update({ "system.uses.value": Math.min(this.#item.system.uses.max, Math.max(value, 0)) });
	}

	/**
	 * Sets the quantity of the item, using the update method to send that info to the server as well.
	 * Will clamp the value so as to not go below 0.
	 * 
	 * @param {number} value Will post an error if the value is not a number.
	 */
	set quantity(value) {
		if (typeof value !== "number") value = Number(value);
		if (typeof value !== "number") error(`Unable to change '${this.name}' quantity; '${value}' is not of type 'number'.`);
		if (value === NaN)             error(`Unable to change '${this.name}' quantity; '${value}' can not be converted to 'number'.`);

		this.#item.update({ "system.quantity": Math.max(value, 0) });
	}
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

		special = ({ crit: " critical", fail: " fumble", [" critical"]: " critical", [" fumble"]: " fumble" })?.[special] ?? "";

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
				if (die_data.value == 1)             { die_data.special = "min"; }
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
				//const uuid = game.saved_macro.utils.uuid();
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
	#roll;
	#formula;

	constructor(formula) {
		this.#formula = formula;
	}
	
	get total() { return this.#roll.total; }

	get result() { return this.#roll.total; }

	get formula() { return this.#formula; }

	set formula(x) { this.#formula = x; }

	#operation(op, term, label, title) {
		if (this.#formula.length > 0) { this.#formula += ` ${op} `; }

		this.#formula += `${term.toString()}${label ? `[${label}]` : ""}${title ? `{${title}}` : ""}`

		return this;
	}

	//adds a term, with an optional label and title. The first term, regardless of 
	//operation, won't have an operator precede it.
	add(term, label, title)      { return this.#operation("+", term, label, title); }

	subtract(term, label, title) { return this.#operation("-", term, label, title); }

	divide(term, label, title)   { return this.#operation("/", term, label, title); }

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
		if (if_true) this.subtract(term, label, title);
		
		return this;
	}

	maybeDivide(if_true, term, label, title) {
		if (if_true) this.divide(term, label, title);
		
		return this;
	}

	maybeMultiply(if_true, term, label, title) {
		if (if_true) this.multiply(term, label, title);
		
		return this;
	}

	//function for recursive searching of terms
	#iterate(roll, arr = []) {
		for (const term of roll.terms) {
			//if it's a parenthetical term, make a new roll out of it, and get the order of stuff we care about.
			const name    = term.constructor.name;
			const formula = term.formula;

			if (name == "ParentheticalTerm") arr = this.#iterate(new Roll(term.term), arr);

			//add term to result array if the constructor is 'Die'
			if (name == "Die") arr[arr.length] = term;

			//but only add a numeric term if it's labeled. If there's no label then there's no point in adding it
			//since we are really only adding it below for labeling purposes
			if (name == "NumericTerm" && (formula.includes("{") || formula.includes("["))) {
				//get the operator before this numeric term if there is one, to determine if the number
				//in the die tooltip should appear as a positive or negative number. Basically in all
				//cases except for subtraction, the number should appear positive
				term.number *= (roll.terms[roll.terms.indexOf(term) - 1]?.operator ?? "+") == "-" ? -1 : 1;
				
				arr[arr.length] = term;
			}
		}

		//flatten the array because the parathneticals will have it wonky
		return arr;
	}

	//The function to use once we get the html from the nested promises.
	#buildRoll(real_roll, html) {
		const roll    = new Roll(this.#formula);
		const message = new Message();
		const total   = html.match(/<h4 class="dice-total(.*?)">(\d+)<\/h4>/);

		//remove labels and only display math
		message.addDieFormula(this.#formula.replace(/\[.*?\]/g, "").replace(/\{.*?\}/g, ""));

		//find the die total from the html, and use that
		message.addDieTotal(total[2], total[1]);
		
		//using the formula, create a roll, but don't parse it, and look at all the terms to determine
		//order of tooltips.
		const order = this.#iterate(roll);
		
		//put all data into this array, so that we can reverse it after everythings done, and the
		//tooltips show up in the order the formula is
		const new_order = [];

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

				new_order[new_order.length] = { 
					formula: label.match(/{(.*?)}/)?.[1] ?? "",
					flavor: label.replace(/{.*?}/, ""),
					total: term.number,
					dice: []
				}

				order.pop();
			}

			new_order[new_order.length] = { 
				formula: data.formula,
				flavor: data.flavor,
				total: data.total,
				dice: data.dice
			}

			order.pop();
		}
		
		for (const tooltip of new_order.reverse()) {
			message.addDieTooltip(tooltip.formula, tooltip.flavor, tooltip.total, ...tooltip.dice);
		}

		message.data = { type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: real_roll };

		return message;
	}

	//rolls the formula, and returns the result as a chat message.
	async roll(maybe) {
		if (maybe === false) return false;
		
		assert(this.#formula.length === 0, "Tried to roll an empty formula.", warn);

		//hide titles in the labels so it's parsed by foundry's roll class
		//first, we wrap any squiggly brackets in square brackets
		//then, any back to back (][) square brackets should be removed
		this.#formula = this.#formula.replace(/({.*?})/g, "[$1]").replace(/\]\[/g, "");

		//make a roll using the formula, then turn into into a message
		//then get the html from that message (not everything needs to be
		//async foundry)
		const roll   = new Roll(this.#formula);
		const result = await roll.roll({ async: true });
		const data   = await roll.toMessage(null, { create: false });

		const chat = new ChatMessage(data);
		const html = await chat.getHTML();
		const msg  = this.#buildRoll(roll, html[0].outerHTML);

		this.#roll = roll;

		return msg;
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
		const result = [];

		if (!Array.isArray(array)) return;

		for (const advantage of array) {
			if (advantage instanceof Advantage && advantage.expired) 
		}
		for (let i = 0; i < array.length; i++) {
			if (array[i] instanceof Advantage) {
				if (array[i].expired()) { array.splice(i, 1); }
			}
		}

		return array;
	}

	//Helper function that takes a pool of vantage sources, and returns an object with info
	//based on all pooled sources.
	static pool(array) {
		if (array === false) return false;

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
	static async check(maybe) {
		if (maybe === false) return false;

		const tracking = utils.tracking;
		const sources  = [];

		//expire all old vantages
		Advantage.expire(tracking.advantage);
		Advantage.expire(tracking.disadvantage);

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
				const dialog = new CustomDialog("Advantage Sources", `Choose a${another ? "nother" : ""} source of advantage.`);

				for (const choice of choices) {
					if (choice.in_use) { continue; }
					
					dialog.addButton(new CustomButton()
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

				if (result.length < amount) return choose(true).show().then(handleChoice);

				return result;
			}
			
			return choose().show().then(handleChoice);
		}

		//go through array and delete the .in_use key from any values in the array
		//then, add a use key to any object that doesn't have one, and increment the value by one.
		//finally, return the array.
		function process(array) {	
			if (array === null) return null;

			return array.map(vantage => {
				delete vantage.in_use;

				if (!vantage.uses) { vantage.uses = 0; }

				vantage.uses++;

				return vantage;
			});
		}

		if (has_disadvantage && advantage_amt > disadvantage_amt) {
			return CustomDialog.ok("Advantage",
				`You have ${disadvantage_amt} source${dis_plural} of disadvantage on you, 
				and have ${advantage_amt} source${ad_plural} of advantage. Would you like 
				to use your advantage${ad_plural}?`)
				.then(choice => {
					if (choice === null) return null;

					return new CustomDialog()
						.setTitle("Advantage")
						.setContent(`Do you want to have advantage, or only remove your disadvantage?`)
						.addButton(new CustomButton()
							.setIcon("plus")
							.setText("Gain Advantage")
							.setCallback(_ => true))
						.addButton(new CustomButton()
							.setIcon("equals")
							.setText("Remove Disadvantage")
							.setCallback(_ => false))
						.onClose(_ => null)
						.show();
				})
				.then(choice => {
					if (choice === null) return null;

					//choice is implictly cast to 1 or 0
					return callback(advantages, disadvantage_amt + choice, sources);
				})
				.then(process)
		}

		if (has_disadvantage && advantage_amt == disadvantage_amt) {
			return CustomDialog.prompt("Advantage",
				`You have ${disadvantage_amt} source${dis_plural} of disadvantage on you, 
				and have ${advantage_amt} source${ad_plural} of advantage. Would you like 
				to use your advantage${ad_plural} to remove your disadvantage${dis_plural}?`)
				.then(choice => {
					if (choice === null)  return null;
					if (choice === false) return sources;

					return callback(advantages, disadvantage_amt, sources);
				})
				.then(process)
		}

		if (has_disadvantage && advantage_amt < disadvantage_amt) {
			return CustomDialog.ok("Advantage",
				`You have ${disadvantage_amt} source${dis_plural} of disadvantage on you, 
				but have ${advantage_amt} source${ad_plural} of advantage. Using your 
				advantage${ad_plural} won't help in this instance.`)
		}

		if (advantage_amt > 0) {
			return CustomDialog.prompt("Advantage",
				`You have${advantage_amt == 1 ? " a " : " "}source${ad_plural} of advantage! Would you like to use ${advantage_amt == 1 ? "it" : "one"}?`)
				.then(choice => {
					if (choice === null) return null;

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
		assert(typeof advantage === "boolean", "Advantage can only be true or false.");
		assert(typeof expires === "function", "Invalid expires function for advantage.");
		assert(typeof source === "string", "Invalid source for advantage.");

		icon = icon.toString();

		if (validateFontAwesome(icon)) {
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

	get expired() { return this.#expires(this); }

	get source() { return this.#source; }

	get icon() { return this.#icon; }

	get advantage() { return this.#advantage; }

	get disadvantage() { return !this.#advantage; }

	set source(x)       { console.warn("Advantage source is immutable. Rather than change the source, make a new instance."); }
	set icon(x)         { console.warn("Advantage icon is immutable. Rather than change the icon, make a new instance.");     }
	set advantage(x)    { console.warn("Advantage state is immutable. Rather than change the state, make a new instance.");   }
	set disadvantage(x) { console.warn("Advantage state is immutable. Rather than change the state, make a new instance.");   }
}

//Creates a dialog button, for use in the custom dialog class.
class CustomButton {
	#key;
	#icon;
	#text;
	#callback;

	static yes(r, _) { return r(true); }

	static no(r, _) { return r(false); }

	//Buttons have keys as a way to reference them within the dialog.
	//You can make a button with a custom keys, or let it be auto generated.
	//It's expected that you'd create one initially, but you can use the
	//setter to do it as well. It doesn't have a helper method, however.
	constructor(key) {
		this.#key = key?.toString?.() ?? generateUUID();
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

		if (validateFontAwesome(icon)) {
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
		assert(typeof callback === "function", "Failed to build button as passed callback was not a function.");

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

	set object(x) { console.warn("Macro Utilities | Can not set object of button directly."); }
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
		ok    = ok    ?? CustomButton.yes;
		close = close ?? ((_, r) => r("Prompt dialog closed."));

		return new CustomDialog(title, content)
			.addButton(new CustomButton()
				.setIcon("check")
				.setText("Ok")
				.setCallback(ok))
			.onClose(close)
			.show()
	}

	//helper function that builds a simple dialog with a yes and no button. All values are optional.
	static prompt(title, content, yes, no, close) {
		yes   = yes   ?? CustomButton.yes;
		no    = no    ?? CustomButton.no;
		close = close ?? ((_, r) => r("Prompt dialog closed."));

		return new CustomDialog(title, content)
			.addButton(new CustomButton()
				.setIcon("check")
				.setText("Yes")
				.setCallback(yes))
			.addButton(new CustomButton()
				.setIcon("times")
				.setText("No")
				.setCallback(no))
			.onClose(close)
			.show()
	}

	//Dialogs don't need a title and content, but they can be defined initially, or defined in
	//one of the chaining functions
	constructor(title = "", content = "") {
		this.#title   = title.toString();
		this.#content = content.toString();
	}

	//since this is directly referencing the object, this allows you to
	//modify a button directly, without having to pull it out, change it,
	//and put it back in.
	get buttons() { return this.#buttons; }

	get title() { return this.#title; }

	get content() { return this.#content; }

	set buttons(x) { console.warn("Macro Utilities | You can not set a buttons object directly. Use the add/removeButton methods."); }
	
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
		assert(button instanceof CustomButton, `Failed to add '${button.toString()}' to Dialog as it's not a Button instance.`);

		this.#buttons[button.key] = button;

		if (is_default || this.#buttons.length == 1) this.#default = button.text;

		return this;
	}

	//Removes a button by label.
	removeButton(label) {
		if (this.#buttons[label] === undefined) {
			console.warn(`Utils | No button labeled '${label}' was found in Dialog buttons.`);
		} else {
			delete this.#buttons[label];
		}

		return this;
	}

	//The callback that runs when the dialog is closed.
	onClose(callback) {
		assert(typeof callback === "function", "Failed to build dialog as passed 'close' callback was not a function.", warn);

		this.#close = callback;

		return this;
	}

	//shows the dialog, and returns a promise, which resolves when the dialog is closed, whether by
	//selecting a button, or simply x'ing it out. default is a keyword, so we use square bracket
	//notation to avoid errors.
	async show(maybe) {
		return new Promise((resolve, reject) => {
			if (maybe === false) return false;

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
				obj.callback = function() { return f(resolve, reject); };
	
				data.buttons[key] = obj;
			}
			
			if (this.#close) {
				//scopes the close function, otherwise it can't be accessed.
				const f = this.#close;
				
				data.close = function() { return f(resolve, reject); };
			}

			new Dialog(data).render(true);
		})
	}
}

//Create a damage instance, which contains damage type, source, and formula. Damages can be turned into rolls
//directly, or an array of them can be pooled together to create one roll with all of the damage calculated
//at once. Formula's should *not* contain labels as labels and titles are created using type and source when
//rolled or pooled together. A damage source should be simple; if you have damage being dealt that is multiple
//types of damage, they are most likely seperate sources of damage, and should be treated as seperate damage instances.
class Damage {
	#type;
	#info;
	#uuid;
	#source;
	#formula;

	//Create a "damage" item that can be used for utils.Rolls
	static item = game.collections.get("Item").contents[0].clone({ 
		img: "https://www.jumpsplat120.com/assets/images/explosion.png",
		name: "Damage",
		permission: { default: 3 },
		data: {
			description: { 
				chat: "<p>A collection of sources of damage.</p>",
				value: "<p>A collection of sources of damage.</p>"
			}
		}
	});

	//pool multiple sources of damage together to create a super roll, rather than rolling each
	//source of damage seperately. returns the a promise that will return the roll, for any
	//final processing that might want to be done, such as dividing all the damage by 2. Hides the
	//type in backticks and is removed in format, so if your item name has backticks, don't.
	static pool(array) {
		const roll = new CustomRoll(Damage.item);

		for (const damage of array) {
			roll.add(damage.formula, damage.info, `${damage.source.data.name}\`${damage.type}\``);
		}

		return roll.roll();
	}

	//Takes a roll message, and formats the message. Used most commonly with the one recieved
	//from Damage.pool. returns the promise from showing the message.
	static format(message) {
		message.setFlavor("Damage Roll");

		const data     = {};
		const tooltips = [];

		let content = "<ul>";
		let tooltip = message.popDieTooltip();
		
		//pop off all tooltips, collecting relevant info, and stripping type until there are no more.
		while (tooltip) {
			const type = tooltip.formula.match(/`(.*?)`/)[1];

			if (!data[type]) { data[type] = 0; }

			data[type] += Number(tooltip.total);

			tooltip.formula = tooltip.formula.replace(/`(.*?)`/, "");

			//deepcopy the tooltip so we don't end up with 9 references to the last tooltip.
			tooltips[tooltips.length] = JSON.parse(JSON.stringify(tooltip));

			tooltip = message.popDieTooltip();
		}

		//rebuild the tooltips
		for (const tooltip of tooltips.reverse()) {
			message.addDieTooltip(tooltip.formula, tooltip.flavor, tooltip.total, ...tooltip.dice);
		}

		//build the damage types breakdown
		for (const [type, total] of Object.entries(data)) {
			content += `<li>${type} - ${total}</li>`;
		}

		content += "</ul>";

		return message.setCardContent(content).show();
	}

	//type of damage, such as fire, piercing, magic, etc. This will not show up in the tooltip, but will show up in the
	//breakdown that can be viewed by clicking the damage dropdown, ie the "content" of the body.
	//source can be an item object, such as longbow, dagger, sharpshooter, etc. All spells/feats/weapons are items in foundry,
	//or it can be a string identifier, such as "Ability Modifier". This will be used as the title for the damage source.
	//info about the damage that might be needed to identify it. For example, a dagger attack could say "Attack", or "Bonus - Light".
	//this will be used as the label.
	//formula should not contain labels, and be simple; for example, a damage source would be the base 1d4 of a dagger, and
	//not include the ability modifier. The ability mod would be considered a seperate source of damage.
	//uuid is an optional value, that can group various damage sources together. For example, while the 1d4 of a dagger is not
	//the same source of damage as the modifier, they are grouped together, and would not be dealt apart from each other. A use
	//case is when sources with similar uuids are created, they will show up together when using the Deal Damage macro, rather
	//than as seperate options.
	constructor(type, source, info, formula, uuid) {
		this.#type    = type;
		this.#info    = info;
		this.#source  = source;
		this.#formula = formula;
		this.#uuid    = uuid ?? generateUUID();
	}

	get type() { return this.#type; }

	get source() { return this.#source; }

	get formula() { return this.#formula; }

	get roll() {
		const item = typeof this.#source == "string" ? Damage.item : this.#source;

		return new CustomRoll(item)
			.add(this.#formula, this.#info, `${item.data.name}\`${this.#type}\``)
			.roll()
			.then(Damage.format)
	}

	set type(x) { console.warn("Damage type is immutable. Rather than change the type, make a new instance."); }

	set source(x) { console.warn("Damage source is immutable. Rather than change the source, make a new instance."); }

	set formula(x) { console.warn("Damage formula is immutable. Rather than change the formula, make a new instance."); }

	set roll(x) { console.warn("You can not set the roll of a damage type."); }

}

utils.Item      = Item;
utils.Damage    = Damage;
utils.Message   = Message;
utils.Advantage = Advantage;
utils.Character = Character;
utils.CustomRoll   = CustomRoll;
utils.CustomDialog = CustomDialog;
utils.CustomButton = CustomButton;

utils.validateFontAwesome = validateFontAwesome;
utils.searchDirectory     = searchDirectory;
utils.generateUUID        = generateUUID;
utils.waitUntil = waitUntil;
utils.playSound = playSound;
utils.pollute   = pollute;
utils.error = error;
utils.info  = info;
utils.warn  = warn;
utils.wait  = wait;

utils.macro_setup = true;

pollute(utils);

console.log("Macro Utilities | Setup has finished.");