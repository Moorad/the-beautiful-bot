// Prettier ruined my code ;-;. I hate prettier. Never going to use it again
// Errors
// 4040 - Any other error
// 4041 - Username not found
// 4042 - Beatmap not found
// 4043 - File not found
require('dotenv').config();
const Discord = require('discord.js');
const request = require('request');
const fs = require('fs');
const http = require('http');
const client = new Discord.Client();
const countryCodes = JSON.parse(fs.readFileSync('country_codes.json'));
const Canvas = require('canvas');
const requestPromiseNative = require('request-promise-native');
const MongoClient = require('mongodb').MongoClient;
Canvas.registerFont('assets/SegoeUI.ttf', {
	family: 'segoeUI'
});
Canvas.registerFont('assets/SegoeUIBold.ttf', {
	family: 'segoeUIBold'
});
const prefix = '$';
const url = `mongodb://${process.env.dbUsername}:${process.env.dbPassword}@ds121295.mlab.com:21295/thebeautifulbot`;
const dbName = 'thebeautifulbot';
const {
	exec
} = require('child_process');
const help = {
	'embed': {
		'description': '**---- osu! ----**\n**`' + prefix + 'osuset [Username]`**\nThe osuset command will link your discord with your osu account which will be used in other osu commands\n**`' + prefix + 'osu [Username]`**\nThe user command displays the stats of the specified user. if no osu username is specified then the username linked with account will be used (refer to `' + prefix + 'osuset`)\n**`' + prefix + 'best [Username]`**\nThe best command displays top 5 plays of the specified user. if no osu username is specified then the username linked with account will be used (refer to `' + prefix + 'osuset`)\n**`' + prefix + 'mp [Beatmap name or beatmap id]`**\nThe Beatmap command shows you the stats of the specified map\n**`' + prefix + 'rs [Username]`**\nThe recent command shows you the stats of the most recent play/s\n**`' + prefix + 'osurename [Username]`**\nThe rename command will change the osu account linked with your discord.\n**---- General ----**\n**`' + prefix + 'help`**\nThe help commands will display this command list`',
		'color': 3066993,
		'footer': {
			'icon_url': 'https://cdn.discordapp.com/avatars/647218819865116674/30bf8360b8a5adef5a894d157e22dc34.png?size=128',
			'text': 'Always Remember, The beautiful bot loves you <3'
		}
	}
};
http.createServer((req, res) => {

	if (req.url == '/') {
		console.log('ping');
		res.write('ping');
		res.end();
	}


}).listen(process.env.PORT || 4000);

// Ping the app evert 5 minutes to prevent the app from sleeping
setInterval(function () {
	http.get(process.env.server);
}, 300000);

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);

});

// client.on('guildMemberAdd', (member) => {
// 	client.channels.find('id',config.welcomeChannelID).send('Welcome to the server **'+member.user.username+'**!! I hope you enjoy it around here, if you ever need me either @ me or type `'+prefix+'help`.\nThere are currently '+(client.users.size-1)+' members in the server\n-');

// 	var role = member.guild.roles.find(role => role.id === config.memberRoleID);
// 	member.addRole(role);
// });

// client.on('guildMemberRemove', (member) => {
// 	client.channels.find('id',config.byeChannelID).send('Sadly, **'+member.user.username+'** left the server ;-;. I hope they come back some day.\nThere are currently '+(client.users.size-2)+' members in the server\n-');
// });

client.on('message', async msg => {
	msg.content = msg.content.toLowerCase();
	if (msg.author.id == '647218819865116674') {
		return;
	}
	if (msg.content == '<@647218819865116674>') {
		const embed = help
		msg.channel.send(embed);
	}

	if (msg.content.startsWith(prefix)) { // Prefix is used
		var parameters = msg.content.slice(prefix.length).split(' ');
		var command = parameters[0];
		parameters.splice(0, 1);
		if (command == 'osu') {
			if (/<@[0-9]{18}>/g.test(parameters[0])) {
				var discordID = parameters[0].slice(2, 20);

				readDB(msg, discordID, (doc) => {
					createUserCard(msg, doc.osuUsername);
				});
			} else if (parameters.length != 0) {
				createUserCard(msg, parameters.join('_'));
			} else {
				readDB(msg, msg.author.id, function (doc) {
					createUserCard(msg, doc.osuUsername);
				});
			}
		} else if (command == 'rs') {
			if (/<@[0-9]{18}>/g.test(parameters[0])) {
				var discordID = parameters[0].slice(2, 20);
				readDB(msg, discordID, (doc) => {
					recent(msg, doc.osuUsername);
				});
			} else if (parameters.length != 0) {
				recent(msg, parameters.join('_'));
			} else {
				readDB(msg, msg.author.id, function (doc) {
					recent(msg, doc.osuUsername);
				});
			}
		} else if (command == 'best') {
			if (/<@[0-9]{18}>/g.test(parameters[0])) {
				var discordID = parameters[0].slice(2, 20);
				readDB(msg, discordID, (doc) => {
					best(msg, doc.osuUsername);
				});
			} else if (parameters.length != 0) {
				best(msg, parameters.join('_'));
			} else {
				readDB(msg, msg.author.id, function (doc) {
					best(msg, doc.osuUsername);
				});
			}
		} else if (command == 'mp') {
			if (parameters.length != 0) {
				searchBeatmap(msg, parameters.join(' '));
			}
		} else if (command == 'osurename') {
			if (parameters.length != 0) {
				updatedb(msg, parameters.join('_'), function () {
					msg.channel.send('Your osu username linked with your account has been successfully updated!');
				});
			} else {
				msg.channel.send('Osu username has not been provided.');
			}
		} else if (command == 'osuset') {
			checkUser(msg, {
				discordID: msg.author.id,
				osuUsername: parameters.join(' ')
			}, function (data) {
				writedb(data);
			});
		} else if (command == 'help') {
			const embed = help
			msg.channel.send(embed);
		} else if (command == 'changelog') {
			getRepoData(msg);
		}
	}
	if (msg.content === 'bot you alive?') { // bot are you alive
		msg.reply('**YES!!!**');
	} else if (msg.content === 'cat') { // cat
		request('https://api.thecatapi.com/v1/images/search', function (err, res, body) {
			msg.reply(JSON.parse(body)[0].url);
		});
	} else if (msg.content.includes('bye')) {
		// bye
		msg.reply('See you next time ;). I hope you get the Joke.');
	} else if (msg.content === 'good bot') {
		msg.reply('<:heart:' + 615531857253105664 + '>');
	} else if (msg.content.includes('osu.ppy.sh/beatmapsets')) {
		var beatmapsetid = msg.content.match(/osu.ppy.sh\S+/g)[0];
		beatmapsetid = beatmapsetid.replace('osu.ppy.sh/beatmapsets/', '');
		var beatmapid = beatmapsetid.match(/#\S+/g)[0];
		beatmapid = beatmapid.replace('#osu/', '');
		beatmapsetid = beatmapsetid.replace(beatmapsetid.match(/#\S+/g), '');
		getBeatmapData(msg, beatmapsetid, beatmapid);
	} else if (msg.content.includes('osu.ppy.sh/users')) {
		var userid = msg.content.replace('https://osu.ppy.sh/users/', '');
		createUserCard(msg, userid);
	}
});

function searchBeatmap(msg, name) {
	request(`https://osusearch.com/query/?title=${name}&query_order=favorites`, {
		json: true
	}, (err, res, body) => {
		if (body.beatmaps.length == 0) {
			errorMessage(msg, 4042);
			return;
		}
		msg.channel.send('https://osu.ppy.sh/beatmapsets/' + body.beatmaps[0].beatmapset_id + '#osu/' + body.beatmaps[0].beatmap_id);
		getBeatmapData(msg, body.beatmaps[0].beatmapset_id, body.beatmaps[0].beatmap_id);
	});
}

function getBeatmapData(msg, beatmapsetid, beatmapid) {
	request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&s=${beatmapsetid}`, {
		json: true
	}, (err, res, body) => {
		if (body.length == 0) {
			errorMessage(msg, 4042);
			return;
		}
		var data = body[0];
		var difficulties = [];
		for (var i of body) {
			difficulties.push(i.difficultyrating);
			if (i.beatmap_id == beatmapid) {
				data = i;
			}
		}
		data.difficulties = difficulties;
		data.url = 'https: //osu.ppy.sh/beatmapsets/' + beatmapsetid + '#osu/' + beatmapid;
		if (msg) {
			createBeatmapCard(msg, data);
		} else {
			return (data);
		}
	});
}


async function createBeatmapCard(msg, data) {
	// init the canvas
	var canvas = Canvas.createCanvas(1251, 685);
	var ctx = canvas.getContext('2d');
	// Background
	ctx.beginPath();
	ctx.fillStyle = '#121212';
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fill();
	// Beatmap Image
	try {
		const beatmapImage = await Canvas.loadImage('https://assets.ppy.sh/beatmaps/' + data.beatmapset_id + '/covers/cover@2x.jpg');
		ctx.drawImage(beatmapImage, 0, 0, canvas.width, 346);
	} catch (err) { //change background to gradient if image is not found
		console.log(err);
		ctx.beginPath();
		var gradient = ctx.createLinearGradient(0, 0, 0, 346);
		gradient.addColorStop(0, '#2B2B2C');
		gradient.addColorStop(1, '#1D1F21');
		ctx.fillStyle = gradient;
		ctx.rect(0, 0, canvas.width, 346);
		ctx.fill();
	}
	ctx.fillStyle = '#000000AA';
	rrect(ctx, 20, 20, 200, 50, 30);
	ctx.font = '25px segoeUI';
	ctx.textAlign = 'center';
	ctx.fillStyle = '#FFFFFF';
	ctx.fillText(data.approved == 1 ? 'RANKED' : 'UNRANKED', 120, 55);
	ctx.textAlign = 'left';

	//title and artist name
	ctx.fillStyle = '#ffffff';
	ctx.font = '50px segoeUIBold';
	data.title = data.title.length <= 23 ? data.title : data.title.slice(0, 22) + '...';
	ctx.fillText(data.title, 30, 406);
	ctx.font = '25px segoeUI';
	ctx.fillText(data.artist, 30, 446);

	// star rating
	const star = await Canvas.loadImage('assets/star.png');
	if (data.difficultyrating > 11) {

		const plus = await Canvas.loadImage('assets/plus.png');
		for (var i = 0; i < 9; i++) {
			ctx.drawImage(star, 30 + 40 * i, 460, 40, 40);
		}

		ctx.drawImage(plus, 30 + 40 * i + 1, 460, 40, 40);
	} else {
		for (var i = 0; i < Math.floor(data.difficultyrating); i++) {
			ctx.drawImage(star, 30 + 40 * i, 460, 40, 40);
		}

		var lastStarSize = 40 * (data.difficultyrating - Math.floor(data.difficultyrating));
		ctx.drawImage(star, 30 + 40 * Math.floor(data.difficultyrating + 1) + ((40 - lastStarSize) / 2), 460 + ((40 - lastStarSize) / 2), lastStarSize, lastStarSize);
	}
	//CS / AR /HP / OD

	ctx.fillStyle = '#ffffff';
	ctx.fillText('CS', 30, 540);
	ctx.fillText('AR', 30, 580);
	ctx.fillText('HP', 30, 620);
	ctx.fillText('OD', 30, 660);
	ctx.fillText(data.diff_size, 385, 540);
	ctx.fillText(data.diff_approach, 385, 580);
	ctx.fillText(data.diff_drain, 385, 620);
	ctx.fillText(data.diff_overall, 385, 660);

	ctx.beginPath();
	ctx.fillStyle = '#343434';
	for (var i = 0; i < 4; i++) {
		ctx.rect(70, 540 + 40 * i - 15, 300, 13);
	}
	ctx.fill();
	ctx.beginPath();
	ctx.fillStyle = '#ffffff';
	ctx.rect(70, 540 - 15, 300 / 8 * (data.diff_size - 2), 13);
	ctx.rect(70, 580 - 15, 30 * data.diff_approach, 13);
	ctx.rect(70, 620 - 15, 30 * data.diff_drain, 13);
	ctx.rect(70, 660 - 15, 30 * data.diff_overall, 13);
	ctx.fill();

	// ctx.font = '42px segoeUI';
	// ctx.fillText('---pp', 1100, 420);
	// ctx.font = '17px segoeUI';
	// ctx.fillText('100% Full Combo', 1100, 450);

	// ctx.font = '42px segoeUI';
	// ctx.fillText('---pp', 1100, 520);
	// ctx.font = '17px segoeUI';
	// ctx.fillText('95% Full Combo', 1100, 550);

	// ctx.font = '42px segoeUI';
	// ctx.fillText('---pp', 1100, 620);
	// ctx.font = '17px segoeUI';
	// ctx.fillText('90% Full Combo', 1100, 650);

	const totalLength = await Canvas.loadImage('assets/total_length.png');
	const bpm = await Canvas.loadImage('assets/bpm.png');
	const totalCircles = await Canvas.loadImage('assets/count_circles.png');
	const totalSliders = await Canvas.loadImage('assets/count_sliders.png');

	ctx.drawImage(totalLength, 450, 430, 50, 50);
	ctx.drawImage(bpm, 450, 495, 50, 50);
	ctx.drawImage(totalCircles, 450, 560, 50, 50);
	ctx.drawImage(totalSliders, 450, 625, 50, 50);

	ctx.font = '25px segoeUI';
	var time = Math.floor(data.total_length / 60) + ':' + (data.total_length % 60 < 10 ? '0' + (data.total_length % 60) : data.total_length % 60);

	ctx.fillText(time, 510, 465);
	ctx.fillText(data.bpm, 510, 530);
	ctx.fillText(data.count_normal, 510, 595);
	ctx.fillText(data.count_slider, 510, 660);
	data.difficulties.sort();
	for (var i = 0; i < data.difficulties.length; i++) {
		ctx.globalAlpha = 0.33;
		if (data.difficulties[i] == data.difficultyrating) {
			ctx.globalAlpha = 1;
			ctx.beginPath();
			ctx.fillStyle = '#ffffff21';
			rrect(ctx, 630 + ((i % 7) * 83) - 5, 390 + (Math.floor(i / 7) * 83) - 5, 81, 81, 5);
			ctx.fill();
		}
		var icon;
		if (data.difficulties[i] < 2) {
			icon = await Canvas.loadImage('assets/easy.png');
		} else if (data.difficulties[i] < 2.7) {
			icon = await Canvas.loadImage('assets/normal.png');
		} else if (data.difficulties[i] < 4) {
			icon = await Canvas.loadImage('assets/hard.png');
		} else if (data.difficulties[i] < 5.3) {
			icon = await Canvas.loadImage('assets/insane.png');
		} else if (data.difficulties[i] < 6.5) {
			icon = await Canvas.loadImage('assets/expert.png');
		} else {
			icon = await Canvas.loadImage('assets/extra.png');
		}
		ctx.drawImage(icon, 630 + ((i % 7) * 83), 390 + (Math.floor(i / 7) * 83), 71, 71);
	}

	const attachment = new Discord.Attachment(canvas.toBuffer(), 'beatmap_stats.png');
	const embed = {
		'title': `${data.title} - ${data.artist} [Download]`,
		'url': data.url,
		'color': 2065919,
		'footer': {
			'icon_url': 'https://cdn.discordapp.com/avatars/647218819865116674/30bf8360b8a5adef5a894d157e22dc34.png?size=128',
			'text': 'Always Remember, The beautiful bot loves you <3'
		}
	};
	msg.channel.send({
		embed
	});
	msg.channel.send(attachment);
}


function rrect(ctx, x, y, width, height, radius = 5) {
	if (typeof radius === 'number') {
		radius = {
			tl: radius,
			tr: radius,
			br: radius,
			bl: radius
		};
	}
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	ctx.fill();
}

function roundedImage(ctx, x, y, width, height, radius) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}


function createUserCard(msg, id) {
	var now = new Date(Date.now());
	request('https://osu.ppy.sh/api/get_user?k=' + process.env.osuAPI + '&u=' + id, {
		json: true
	}, async (err, res, body) => {
		var afterFetch = new Date(Date.now());
		console.log((afterFetch - now) + 'ms');
		if (body.length == 0) {
			errorMessage(msg, 4041);
			return;
		}
		// init the canvas
		var canvas = Canvas.createCanvas(1080, 538);
		var ctx = canvas.getContext('2d');

		ctx.beginPath();
		ctx.fillStyle = '#121212';
		ctx.rect(0, 0, canvas.width, canvas.height);
		ctx.fill();
		// background
		var background = await Canvas.loadImage(`./assets/background-${Math.round(Math.random() * 7)}.png`);
		ctx.drawImage(background, 0, 0, canvas.width, 300);
		ctx.save();
		var userPicture;
		try {
			userPicture = await Canvas.loadImage(`https://a.ppy.sh/${body[0].user_id}`);
		} catch (err) {
			userPicture = await Canvas.loadImage('https://osu.ppy.sh/images/layout/avatar-guest.png');
		}
		roundedImage(ctx, 30, 30, 280, 280, 47);
		ctx.clip();
		ctx.drawImage(userPicture, 30, 30, 280, 280);
		ctx.restore();

		ctx.fillStyle = '#ffffff';
		ctx.font = '51px segoeUIBold';
		ctx.fillText(body[0].username, 330, 95);

		ctx.font = '40px segoeUI';
		let country = countryCodes[body[0].country];
		ctx.fillText(country, 330, 140);

		var gradeA = await Canvas.loadImage('assets/grade_a.png');
		var gradeS = await Canvas.loadImage('assets/grade_s.png');
		var gradeSS = await Canvas.loadImage('assets/grade_ss.png');
		var gradeSH = await Canvas.loadImage('assets/grade_sh.png');
		var gradeSSH = await Canvas.loadImage('assets/grade_ssh.png');

		ctx.drawImage(gradeSSH, 370, 180, 95, 48);
		ctx.drawImage(gradeSS, 500, 180, 95, 48);
		ctx.drawImage(gradeSH, 630, 180, 95, 48);
		ctx.drawImage(gradeS, 760, 180, 95, 48);
		ctx.drawImage(gradeA, 890, 180, 95, 48);

		ctx.font = '25px segoeUIBold';
		ctx.textAlign = 'center';
		ctx.fillText(body[0].count_rank_ssh, 417, 260, 95, 48);
		ctx.fillText(body[0].count_rank_ss, 549, 260, 95, 48);
		ctx.fillText(body[0].count_rank_sh, 679, 260, 95, 48);
		ctx.fillText(body[0].count_rank_s, 809, 260, 95, 48);
		ctx.fillText(body[0].count_rank_a, 939, 260, 95, 48);
		ctx.textAlign = 'left';
		ctx.font = '37px segoeUIBold';
		ctx.fillText('Global Rank', 50, 350);
		ctx.font = '65px segoeUI';
		ctx.fillText('#' + format(body[0].pp_rank), 50, 420);

		ctx.font = '20px segoeUIBold';
		ctx.fillText('Country Rank', 50, 450);
		ctx.font = '42px segoeUI';
		ctx.fillText('#' + format(body[0].pp_country_rank), 50, 500);

		var hexagon = await Canvas.loadImage('./assets/hexagon.png');
		ctx.drawImage(hexagon, 340, 271, 70, 76);

		ctx.textAlign = 'center';
		ctx.font = '33px segoeUI';
		ctx.fillText(Math.floor(body[0].level), 375, 320);

		rrect(ctx, 440, 305, 462, 11, 7);
		ctx.fillStyle = '#FFCC22';
		rrect(ctx, 440, 305, 462 * (body[0].level - Math.floor(body[0].level)), 11, 7);
		ctx.textAlign = 'left';
		ctx.fillStyle = '#ffffff';
		ctx.font = '21px segoeUI';
		ctx.fillText(Math.floor(100 * (body[0].level - Math.floor(body[0].level))) + '%', 920, 317);

		// ctx.beginPath();
		// ctx.fillStyle = '#242424';
		var backgroundpp = await Canvas.loadImage('assets/background-pp.png');
		var backgroundAccuracy = await Canvas.loadImage('assets/background-accuracy.png');
		var backgroundHours = await Canvas.loadImage('assets/background-hours.png');
		ctx.drawImage(backgroundpp, 350, 380, 150, 115);
		ctx.drawImage(backgroundAccuracy, 580, 380, 150, 115);
		ctx.drawImage(backgroundHours, 800, 380, 220, 115);

		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'center';
		ctx.font = '30px segoeUIBold';
		ctx.fillText('pp', 425, 418);
		ctx.fillText('Accuracy', 655, 418);
		ctx.fillText('hours played', 905, 418);
		ctx.font = '35px segoeUI';
		ctx.fillText(Math.floor(body[0].pp_raw), 425, 468);
		ctx.fillText(Math.floor(body[0].accuracy * 100) / 100 + '%', 655, 468);
		ctx.fillText(format(Math.floor(body[0].total_seconds_played / 60 / 60)) + 'h', 905, 468);

		const attachment = new Discord.Attachment(canvas.toBuffer(), 'user_stats.png');
		msg.channel.send(attachment);
		console.log((new Date(Date.now()) - afterFetch) + 'ms');

	});

}

function format(number) {
	return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

function recent(msg, user) {
	request(`https://osu.ppy.sh/api/get_user_recent?k=${process.env.osuAPI}&u=${user}`, {
		json: true
	}, (err, res, body) => {
		if (body.length == 0) {
			errorMessage(msg, 4044);
			return;
		}

		const grade = client.emojis.find(emoji => emoji.name === 'grade_' + body[0].rank.toLowerCase());
		request(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${body[0].beatmap_id}`, {
			json: true
		}, (err, res, beatmapData) => {
			var accuracy = (50 * parseInt(body[0].count50) + 100 * parseInt(body[0].count100) + 300 * parseInt(body[0].count300)) / (300 * (parseInt(body[0].count50) + parseInt(body[0].count100) + parseInt(body[0].count300) + parseInt(body[0].countmiss)));
			accuracy = Math.floor(accuracy * 10000) / 100;
			console.log();
			exec(`curl -s https://osu.ppy.sh/osu/${body[0].beatmap_id} | node pp.js +${getMods(body[0].enabled_mods)} ${accuracy}% ${body[0].maxcombo}x ${body[0].countmiss}m`, (err, stdout, stderr) => {
				if (err) {
					// node couldn't execute the command
					return;
				}

				// the *entire* stdout and stderr (buffered)
				var ppAndDiff = stdout.replace('\n', '').split('$')
				console.log(ppAndDiff)
				console.log(`stdout: ${stdout}`);
				console.log(`stderr: ${stderr}`);


				var datebefore = new Date(body[0].date);
				var datenow = new Date();
				datenow = new Date(datenow.getUTCFullYear(), datenow.getUTCMonth(), datenow.getUTCDate(), datenow.getUTCHours(), datenow.getUTCMinutes(), datenow.getUTCSeconds(), datenow.getUTCMilliseconds());
				console.log(datenow);

				var difference = new Date(datenow - datebefore);
				var formattedDate = `${difference.getMonth() == 0 ? '' : ' ' + difference.getMonth() + ' Months'}${difference.getDate() - 1 == 0 ? '' : ' ' + difference.getDate() - 1 + ' Days'}${difference.getHours() - 1 == 0 ? '' : ' ' + difference.getHours() - 1 + ' Hours'}${difference.getMinutes() == 0 ? '' : ' ' + difference.getMinutes() + ' Minutes'}${difference.getSeconds() == 0 ? '' : ' ' + difference.getSeconds() + ' Seconds'} ago`;
				console.log(formattedDate);

				var colour = 0;
				if (body[0].rank.toLowerCase() == 'f' || body[0].rank.toLowerCase() == 'd') colour = 15158332;
				else if (body[0].rank.toLowerCase() == 'c') colour = 10181046;
				else if (body[0].rank.toLowerCase() == 'b') colour = 3447003;
				else if (body[0].rank.toLowerCase() == 'a') colour = 3066993;
				else if (body[0].rank.toLowerCase() == 's') colour = 15844367;
				else if (body[0].rank.toLowerCase() == 'sh') colour = 12370112;
				else if (body[0].rank.toLowerCase() == 'ss') colour = 15844367;
				else if (body[0].rank.toLowerCase() == 'ssh') colour = 12370112;



				var accuracy = (50 * parseInt(body[0].count50) + 100 * parseInt(body[0].count100) + 300 * parseInt(body[0].count300)) / (300 * (parseInt(body[0].count50) + parseInt(body[0].count100) + parseInt(body[0].count300) + parseInt(body[0].countmiss)));
				accuracy = Math.floor(accuracy * 10000) / 100;

				const embed = {
					'description': `${grade} - **${ppAndDiff[0]}pp** - ${accuracy}%${body[0].perfect == 1 ? ' - __**[Full Combo!]**__' : ''}\n${'★'.repeat(Math.floor(beatmapData[0].difficultyrating))} **[${Math.floor(beatmapData[0].difficultyrating * 100)/100}★]${ppAndDiff[1] != Math.floor(beatmapData[0].difficultyrating * 100)/100 ? ` (${ppAndDiff[1]}★ with Mods)` : ''}**\nCombo: **x${format(body[0].maxcombo)}/x${format(beatmapData[0].max_combo)}**	Score: **${format(body[0].score)}**\n[${body[0].count300}/${body[0].count100}/${body[0].count50}/${body[0].countmiss}]`, //\nAchieved: **${formattedDate}**
					'url': 'https://discordapp.com',
					'color': colour,
					'thumbnail': {
						'url': `https://b.ppy.sh/thumb/${beatmapData[0].beatmapset_id}.jpg`
					},
					'author': {
						'name': `${beatmapData[0].title} [${beatmapData[0].version}] +${getMods(body[0].enabled_mods)}`,
						'url': `https://osu.ppy.sh/beatmapsets/${beatmapData[0].beatmapset_id}#osu/${beatmapData[0].beatmap_id}`,
						'icon_url': `https://a.ppy.sh/${body[0].user_id}?1566997187.jpeg`
					},
					'footer': {
						'icon_url': 'https://cdn.discordapp.com/avatars/647218819865116674/30bf8360b8a5adef5a894d157e22dc34.png?size=128',
						'text': 'Always Remember, The beautiful bot loves you <3'
					}
				};
				msg.channel.send({
					embed
				});

			});


		});

	});
}


async function best(msg, user) {

	request(`https://osu.ppy.sh/api/get_user_best?k=${process.env.osuAPI}&u=${user}&limit=5`, {
		json: true
	}, (err, res, body) => {
		console.log(res.statusCode);
		if (body.length == 0) {
			errorMessage(msg, 4041);
			return;
		}
		var plays = [];
		var playString = [];
		var playpp = [];
		var urls = [];
		const embed = {
			'title': `Here are the top 5 plays for ${user}`,
			'description': '',
			'url': `https://osu.ppy.sh/users/${body.user_id}`,
			'color': 12352831,
			'thumbnail': {
				'url': `https://a.ppy.sh/${body[0].user_id}?1566997187.jpeg`
			},
			'footer': {
				'icon_url': 'https://cdn.discordapp.com/avatars/647218819865116674/30bf8360b8a5adef5a894d157e22dc34.png?size=128',
				'text': 'Always Remember, The beautiful bot loves you <3'
			}
		};
		for (var i = 0; i < body.length; i++) {
			urls.push(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${body[i].beatmap_id}`);
			plays.push(requestPromiseNative(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${body[i].beatmap_id}`, {
				json: true
			}, (err, res, beatmapData) => {
				let index = urls.indexOf(res.request.href);

				var grade = client.emojis.find(emoji => emoji.name === 'grade_' + body[index].rank.toLowerCase());
				var pp = Math.floor(body[index].pp * 100) / 100;
				var accuracy = Math.floor((50 * parseInt(body[index].count50) + 100 * parseInt(body[index].count100) + 300 * parseInt(body[index].count300)) / (300 * (parseInt(body[index].count50) + parseInt(body[index].count100) + parseInt(body[index].count300) + parseInt(body[index].countmiss))) * 10000) / 100;

				playString.push(`__**[${beatmapData[0].title} [${beatmapData[0].version} - ${Math.floor(beatmapData[0].difficultyrating * 100) /100}★] +${getMods(body[index].enabled_mods)}](${`https://osu.ppy.sh/beatmapsets/${beatmapData[0].beatmapset_id}#osu/${beatmapData[0].beatmap_id}`})**__\n${grade} - **${pp}pp** - ${accuracy}%\nCombo: **x${format(body[index].maxcombo)}/x${format(beatmapData[0].max_combo)}**	Score: **${format(body[index].score)}**\n[${body[index].count300}/${body[index].count100}/${body[index].count50}/${body[index].countmiss}]\nAchieved: **${body[index].date}**\n`);
				playpp.push(pp);
			}));
		}
		Promise.all(plays).then(() => {

			var sortedpp = playpp.slice(0).sort((a, b) => {
				return (b - a);
			});
			var sortedString = [];
			for (i = 0; i < sortedpp.length; i++) {
				sortedString.push(playString[playpp.indexOf(sortedpp[i])]);
			}
			embed.description = sortedString.join(' ');
			msg.channel.send({
				embed
			});
		});

	});
}

function getMods(number) { // Rewrite using a two lists and a for loop
	if (number == 0) {
		return ('No Mod');
	}
	var modsNames = ['PF', 'SO', 'FL', 'NC', 'HT', 'RX', 'DT', 'SD', 'HR', 'HD', 'EZ', 'NF'];
	var modsValues = [16416, 4096, 1024, 576, 256, 128, 64, 32, 16, 8, 2, 1];
	var mods = [];
	for (var i = 0; i < modsNames.length; i++) {
		if (number >= modsValues[i]) {
			number -= modsValues[i];
			mods.push(modsNames[i]);
		}
	}
	return (mods.reverse().join(''));
}
console.log(process.env.discordAPI);
client.login(process.env.discordAPI);

function readDB(msg, id, callback) {
	MongoClient.connect(url, function (err, client) {

		const db = client.db(dbName);
		// Get the documents collection
		const collection = db.collection('users');
		// Find some documents
		collection.find({
			discordID: id
		}).toArray(function (err, docs) {
			if (docs.length == 0) {
				console.log(msg.author)
				msg.reply(`I could not find you/user in the Database. Use the command \`${prefix}osuset [Your osu username]\` to link your osu account.`)
				return;
			}
			callback(docs[0]);
		});
		client.close();
	});

}

function writedb(data) {
	MongoClient.connect(url, function (err, client) {

		const db = client.db(dbName);
		// Get the documents collection
		const collection = db.collection('users');
		// Find some documents
		collection.insertOne(data, function (err, result) {

		});
		client.close();
	});
}

function updatedb(msg, osuUsername, callback) {
	MongoClient.connect(url, function (err, client) {

		const db = client.db(dbName);
		// Get the documents collection
		const collection = db.collection('users');
		// Find some documents
		collection.updateOne({
			discordID: msg.author.id
		}, {
			$set: {
				osuUsername: osuUsername
			}
		}, function (err, result) {

		});
		callback(msg);
		client.close();
	});
}

function checkUser(msg, data, callback) {
	request(`https://osu.ppy.sh/api/get_user?k=${process.env.osuAPI}&u=${data.osuUsername}`, {
		json: true
	}, (err, res, body) => {
		if (body.length == 0) {
			errorMessage(msg, 4041);
			return;
		} else {
			msg.channel.send('**Your osu Username has been successfully connected!**\nType `' + prefix + 'help` to see the list of commands available');
			callback(data);
		}
	});
}

function getRepoData(msg) {
	request({
		url: 'https://api.github.com/repos/moorad/the-beautiful-bot/commits',
		headers: {
			'User-Agent': 'Moorad'
		}
	}, (err, res, body) => {
		body = JSON.parse(body)
		msg.channel.send({
			'embed': {
				'title': 'Latest activity on The Beautiful Bot\'s Github repo',
				'description': '[Github repository](https://github.com/Moorad/the-beautiful-bot)',
				'color': 16580705,
				'footer': {
					'icon_url': 'https://cdn.discordapp.com/avatars/647218819865116674/30bf8360b8a5adef5a894d157e22dc34.png?size=128',
					'text': 'Always Remember, The beautiful bot loves you <3'
				},
				'fields': [{
						'name': '-',
						'value': '**' + body[0].commit.message + '**\ncommit [' + body[0].sha.slice(0, 7) + '](' + body[0].html_url + ') by ' + body[0].committer.login + ' on ' + timeSince(Date.parse(body[0].commit.committer.date))
					},
					{
						'name': '-',
						'value': '**' + body[1].commit.message + '**\ncommit [' + body[1].sha.slice(0, 7) + '](' + body[1].html_url + ') by ' + body[1].committer.login + ' on ' + timeSince(Date.parse(body[1].commit.committer.date)),

					},
					{
						'name': '-',
						'value': '**' + body[2].commit.message + '**\ncommit [' + body[2].sha.slice(0, 7) + '](' + body[2].html_url + ') by ' + body[2].committer.login + ' on ' + timeSince(Date.parse(body[2].commit.committer.date)),

					},
					{
						'name': '-',
						'value': '**' + body[3].commit.message + '**\ncommit [' + body[3].sha.slice(0, 7) + '](' + body[3].html_url + ') by ' + body[3].committer.login + ' on ' + timeSince(Date.parse(body[3].commit.committer.date)),

					},
					{
						'name': '-',
						'value': '**' + body[4].commit.message + '**\ncommit [' + body[4].sha.slice(0, 7) + '](' + body[4].html_url + ') by ' + body[4].committer.login + ' on ' + timeSince(Date.parse(body[4].commit.committer.date)),

					}
				]
			}
		})
	})
}

function timeSince(date) {

	var seconds = Math.floor((new Date() - date) / 1000);

	var interval = Math.floor(seconds / 31536000);

	if (interval > 1) {
		return interval + ' years';
	}
	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
		return interval + ' months';
	}
	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
		return interval + ' days';
	}
	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
		return interval + ' hours';
	}
	interval = Math.floor(seconds / 60);
	if (interval > 1) {
		return interval + ' minutes';
	}
	return Math.floor(seconds) + ' seconds';
}
var aDay = 24 * 60 * 60 * 1000;
console.log(timeSince(new Date(Date.now() - aDay)));
console.log(timeSince(new Date(Date.now() - aDay * 2)));

function errorMessage(msg, errCode) {
	if (errCode == 4041) {
		console.log('Error 4041');
		msg.channel.send('**Unknown username!** This username doesn\'t seem to exist, check if you spelled the name correctly');
	} else if (errCode == 4042) {
		console.log('Error 4042');
		msg.channel.send('**Unknown beatmap!** Sadly I couldn\'t find the map your are searching for :(, check if you spelled the name of the beatmap correctly');
	} else if (errCode == 4043) {
		console.log('Error 4043');
		msg.channel.send('File is not recognised\nCheck if the file is uploaded coreectly, it  is a json file and isn\'t corrupted');
	} else if (errCode == 4044) {
		console.log('Error 4044');
		msg.channel.send('There were no recent plays in the last 24h or Invalid username\nCheck if you spelled the name correctly or click some circles :)');
	} else {
		console.log('Error 4040');
		msg.channel.send('Error 4040');
	}
}