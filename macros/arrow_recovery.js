const arrows    = utils.getItemByName("arrows");
const recovered = Math.round(utils.tracking.arrows / 2);

utils.tracking.arrows = 0;

utils.increaseItemQuantity(arrows, recovered);

new utils.Message()
	.setFlavor("Arrow Recovery")
	.setCardContent("At the end of the battle, you can recover half your expended ammunition by taking a minute to search the battlefield.")
	.addDieTotal(recovered)
	.send();