const s = game.saved_macro;
const u = s.utils;

const arrows = u.getItemByName("arrows");
let fired_arrows = s.tracking.arrows;
const recovered = Math.round(fired_arrows / 2);
fired_arrows = 0;

u.updateItemQuantity("arrows", recovered, "+");

u.chatMessage(null, { small: "...At the end of the battle, you can recover half your expended ammunition by taking a minute to search the battlefield."}, [{
	title: "Recover",
	onclick: function(button, recovered) {
		const content = button.parentElement.parentElement.parentElement;
		button.classList.add("nohover");
		button.innerHTML = `<h3 style="font-weight: bold;">${recovered}</h3>`;
	},
	data: [ recovered ]
}], null, "Ammo Recovery");