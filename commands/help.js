function help(msg, prefix, args) {
	if (args[0] == 2) {
		msg.channel.send({
			'embed': {
				'description': `**---- osu! ----**
					**\`${prefix}leaderboard\`** or **\`$lb\`**
					Will display the top 25 people on the leaderboard in the last mentioned map in the chat e.g. \`$map Ange du Blanc Pur\` then \`$lb\`
					
					\`-c [count]\` - (optional) will change the count of people displayed e.g. \`${prefix}lb -c 10\` (This will show the top 10 people in the last mentioned map)
					\`0-25\` - Number of people (Default = 25)
	
					**\`${prefix}pp\`**
					Calculates the pp for the last mentioned map in the chat e.g. \`$map Ange du Blanc Pur\` then \`$pp 100% +HD\`
					
					\`[accuracy]%\` - (If not given the bot will assume its 100% accuracy when approriate) show the pp for a specific accuracy
					\`+[mods]\` - (If not given the bot will assume no mods are applied) show the pp with the specified maps applied.
					\`[Number of misses]m\` - (If not given the bot will assume 0 misses) show the pp with the specified miss count.
					\`[combo]x\` - (If not given the bot will assume a Full combo) show the pp with the specified combo.
					\`$map Ange du Blanc Pur\` \`${prefix}pp 95% 1200x 2m +HD\` (This will return the pp for a 95% accuracy, 2 miss, 1200 combo HD play on Ange de Blanc Pur)

					**---- General ----**
						**\`${prefix}help\`** or **\`${prefix}hl\`**
						Displays this command list
						
						**\`${prefix}cat\`**
						:)
						
						**\`${prefix}changelog\`** or **\`${prefix}cl\`**
						Will return the information on where to find the changelog for the bot
						
						**\`${prefix}ping\`**
						The bot will measure the latency of the API's that the bot uses and returns their latency
						
						Use \`$help 1\` to go to the previous page
						[2/2]`,

				'color': 3066993,
				'footer': {
					'icon_url': 'https://i.imgur.com/34evAhO.png',
					'text': 'Always Remember, The beautiful bot loves you <3'
				}
			}
		});
		return;
	}
	msg.channel.send( `>>> **---- osu! ----**\n**\`${prefix}osuset [Username]\`** or **\`$os [Username]\`**\nLinks or updates your osu username which will be used in other osu commands e.g. \`$osuset Moorad\`\n\t\t\`-t [type]\` - (optional) will change the the server type e.g. \`${prefix}osuset -t 1 Moorad\` (This will link my Gatari account)\n\t\t\t\t\`0\` - Official osu! servers (Default)\n\t\t\t\t\`1\` - Gatari servers (Partially Supported)\n\t\t\t\t\`2\` - Akatsuki servers (Partially Supported)\n\n**\`${prefix}osu [Username]\`**\nDisplays the stats of the specified user. If no osu username is specified then the username linked with account will be used (refer to **\`${prefix}osuset\`**)\n\n**\`${prefix}best\`** or **\`$bt\`**\nShows the top 5 plays of the specified user. If no osu username is specified then the username linked with account will be used (refer to **\`${prefix}osuset\`**)\n\n**\`${prefix}map [Beatmap name or beatmap id]\`** or **\`${prefix}mp [Beatmap name or beatmap id]\`**\nShows you the stats of the specified map\n\n**\`${prefix}recent [Username]\`** or **\`${prefix}rs [Username]\`**\nWill return the stats of the most recent play of the specified user. If no osu username is specified then the username linked with account will be used e.g. \`$rs Moorad\`\n\t\t\`-p [previous]\` - (optional) will show the plays previous to the latest one e.g. \`${prefix}rs -p 3 Moorad\` (This will display the play that is the 3rd latest)\n\t\t\t\t\`0-49\` - Any value between 0 and 49 is valid\n\t\t\`-m [mode]\` - (optional) will display the recent play of the specified mode e.g. \`${prefix}rs -m 3 Moorad\` (This will show my latest mania play)\n\t\t\t\t\`0\` - Standard (Default)\n\t\t\t\t\`1\` - Taiko\n\t\t\t\t\`2\` - CTB\n\t\t\t\t\`3\` - Mania\n\n**\`${prefix}c\`** or **\`${prefix}compare\`**\nIt will return your best play on the last map mentioned in the chat  e.g. \`$map Ange du Blanc Pur\` then \`$c\` (Will show my best score on Ange du Blanc Pur)\n\nUse \`$help 2\` to go to the next page\n[1/2]\n`);
	console.log(`HELP : ${msg.author.id}`);
}



module.exports = {
	help: help
};