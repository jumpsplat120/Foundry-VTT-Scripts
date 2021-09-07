//Run this before running any other macro
const url = "https://www.jumpsplat120.com/sfx/";

game.saved_macro = {
	sounds: { bruh: `${url}bruh.mp3`, bugs: `${url}bugs.mp3` },
	actor: { },
	utils: {
		playSound: (src, volume = 0.8, autoplay = true, loop = false) => { AudioHelper.play({ src, volume, autoplay, loop }, false); },
		isPressed: key => { return !!game.saved_macro.tracking.keys[key.toLowerCase()] },
		simpleName: item_name => { return item_name.replaceAll(" ", "_").toLowerCase() },
		fancyName: item_name => { return item_name.replaceAll("_", " ").toTitleCase() },
		luckyPrompt: (yes, no) => {
			return new Dialog({
			title: "Lucky",
			content: "Is this a reroll for the Lucky feat?",
			buttons: {
				yes: { icon: '<i class="fas fa-check"></i>', label: "Yes", callback: yes },
				no: { icon: '<i class="fas fa-times"></i>', label: "No", callback: no }}});
		},
		advantagePrompt: (yes, no) => {
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
		createButton: (label, fa_icon, callback) => {
			return { icon: `<i class="fas fa-${fa_icon}"></i>`,
					 label: label,
					 callback: callback }
		},
		getItemByName: (item_name, character) => {
			character = character || game.user.character;
			
			const utils = game.saved_macro.utils;
			const vals = [...character.data.items.values()]
			for (let i = 0; i < vals.length; i++) { if (utils.simpleName(vals[i].name) === utils.simpleName(item_name)) { return vals[i] } }
		},
		getPronouns: character => {
			const gender = character.data.data.details.gender.toLowerCase();
			const is_girl = gender == "female" || gender == "girl" || gender == "gal" || gender == "woman" || gender == "f" || gender == "she/her"
			const is_boy = gender == "male" || gender == "boy" || gender == "guy" || gender == "man" || gender == "m" || gender == "he/him"
			const masc    = ["he", "him", "himself", "his", "his"]
			const fem     = ["she", "her", "herself", "hers", "her"]
			const epicene = ["they", "them", "themselves", "theirs", "their"]
			return is_girl ? fem : is_boy ? masc : epicene;
		},
		updateItemQuantity: (item_name, new_amount, action) => {
			const item = game.saved_macro.utils.getItemByName(item_name)
			item
			if (action == "+") {
				item.data.quantity += new_amount;
				item.data.data.quantity += new_amount;
				item.data._source.data.quantity += new_amount;
			} else if (action == "-") {
				item.data.quantity -= new_amount;
				item.data.data.quantity -= new_amount;
				item.data._source.data.quantity -= new_amount;
			} else {
				item.data.quantity = new_amount;
				item.data.data.quantity = new_amount;
				item.data._source.data.quantity = new_amount;
			}
		},
		chatMessage: (header, content, buttons, footer, flavor) => {
			//content == { small: "", regular: "" }
			//header  == { img: "something.jpg", content: "" }
			//footer  == [ "foo", "bar" ]
			//buttons == [ { title: "", onclick: function() { }, onmouseover: function() {}, data: ["anything can go here", true, 1, {}] } ]
			let el = "";
			let button_ids = [];
			
			if (content && content.regular) { el += content.regular; }
			
			el += "<div class='dnd5e chat-card item-card'>";
			
			if (header) {
				el += "<header class='card-header flexrow'>";
				if (header.img) { el += "<img src='" + header.img + "' title='" + header.content + "' width='36' height='36'>"; }
				el += "<h3 class='item-name'>" + header.content + "</h3></header>";
			}
			
			if (content) {
				el += "<div class='card-content'>";
				if (content.small) { el += content.small; }
				el += "</div>";
			}
			
			if (buttons) {
				el += "<div class='card-buttons'>";
				buttons.forEach(item => {
					const uuid = game.saved_macro.utils.guid();
					button_ids[button_ids.length] = {uuid: uuid, onclick: item.onclick, onmouseover : item.onmouseover, data: item.data };
					el += "<button id='" + uuid + "'>" + item.title + "</button>";
				});
				el += "</div>";
			}
			
			if (footer) {
				el += "<footer class='card-footer'>";
				footer.forEach(item => { el += "<span>" + item + "</span>"; });
				el += "</footer>";
			}
			
			el += "</div>";
			
			ChatMessage.create({ 
				content: el, 
				speaker: { alias: game.user.character.name },
				flavor: flavor }).then(function() {
					button_ids.forEach(item => {
						run.forEveryone(item => {
							if (item.onclick) {
								document.getElementById(item.uuid).onclick = function() { item.onclick(document.getElementById(item.uuid), ...item.data) };
							}
							
							if (item.onmouseover) {
								document.getElementById(item.uuid).onmouseover = function() { item.onmouseover(document.getElementById(item.uuid), ...item.data) };
							}
						}, item)
					});
				});
		},
		guid: _ => {
			function _p8(s) {
				let p = (Math.random().toString(16) + "000000000").substr(2,8);
				return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
			}
			return _p8() + _p8(true) + _p8(true) + _p8();
		}
	},
	//keys = { keyname: true }
	//advantage = [ ["Source Name", amt, "fa-icon", function() { console.log("Do on using advantage") }] ]
	//damage = { damage_source: [false, 1, false]; }
	//					[critical, spell_level, versatile]
	tracking: { arrows: 0, keys: {}, advantage: [], damage: {} }
};

game.saved_macro.sounds.bow = [];

for (let i = 1; i < 6; i++) { game.saved_macro.sounds.bow[game.saved_macro.sounds.bow.length] = `${url}bow${i}.mp3`; }

//track keys, ~~can be used for changing behaviour on shift/ctrl clicks for macros~~
//turns out macros have an "event" variable to access that has .ctrlKey and .shiftKey
//So this is for detecting any other keypresses
document.addEventListener("keydown", event => { game.saved_macro.tracking.keys[event.key.toLowerCase()] = true; });
document.addEventListener("keyup", event => { game.saved_macro.tracking.keys[event.key.toLowerCase()] = false; });

run.forEveryone(_ => {
	//sending no hover css to everyone
	const css = `button.nohover {
		background: rgba(0, 0, 0, 0.1);
		border: 1px solid #999;
		box-shadow: 0 0 2px #fff inset;
		color: #191813;
	}

	button.nohover:hover {
		color: #191813;
	}`;
	const style = document.createElement("style");

	if (style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		style.appendChild(document.createTextNode(css));
	}

	document.getElementsByTagName("head")[0].appendChild(style);
})

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
    return str
}
Object.defineProperty(Object.prototype, "length", {
	get() { return Object.keys(this).length; },
	set() { },
	enumerable: false,
	writeable: false
});

Array.prototype.random = function() {
	return this[Math.floor(Math.random() * this.length)];
}