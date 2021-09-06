const saved = game.saved_macro;
const utils = saved.utils;
const track = saved.tracking;
const lucky = utils.getItemByName("lucky");
const labels = lucky.labels;

if (track.lucky) {
	Dialog.prompt({
		title: "Lucky Prompt",
		content: "You already have a use of Lucky!",
		label: "OK",
		callback: function() {},
		rejectClose: false
	});
} else {
	lucky.roll({configureDialog: false, createMessage: false}).then(chat_message => {
		if (chat_message) { utils.chatMessage({ img: lucky.img, content: lucky.name }, { small: `After spending a luck point, Taylor may roll an additional d20 and choose which die to use.` }) }
	});
	
	track.advantage[track.advantage.length] = [lucky.name, 1, "hand-sparkles", function() { track.lucky = false; }];
	track.lucky = true;
}