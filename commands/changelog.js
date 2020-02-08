function changelog(msg) {
	const embed = {
		'title': 'All of the latest changes can be found on The Beautiful Bot website',
		'description': '[Changelog file in TBB\'s Github repo](https://github.com/moorad/the-beautiful-bot/blob/master/CHANGELOG.md) or [TBB\'s website](https://the-beautiful-bot.netlify.com/changelog)\nIf you want a more indepth changelog you can check out The Beautiful Bot\'s GitHub Page\nhttps://github.com/Moorad/the-beautiful-bot/commits/master',
		'color': 1492731
	};
	msg.channel.send({
		embed
	});
}

module.exports = {
	changelog: changelog
};