'use strict';

import { IOptions, IAPIBest } from '../handlers/interfaces';
import { Client, Message, Emoji } from 'discord.js';
import * as score from '../handlers/score';

import * as mods from '../handlers/mods';
import * as argument from '../handlers/argument';
import * as format from '../handlers/format';
import * as gatari from '../handlers/gatari';
import * as akatsuki from '../handlers/akatsuki';
import * as error from '../handlers/error';

const axios = require('axios');

function execute(client: Client, msg: Message, args: Array<string>) {
	argument.determineUser(msg, args, (username, options) => {
		sendRequest(client, msg, username, options);
	});
}

function sendRequest(client: Client, msg: Message, user: string | undefined, options: IOptions) {
	if (options.type == 0) {
		axios.get(`https://osu.ppy.sh/api/get_user_best?k=${process.env.osuAPI}&u=${user}&limit=100&m=${options.mode}`)
			.then((res: any) => {

				if (res.data.length == 0) {
					msg.channel.send(`:red_circle: **The username \`${user}\` is not valid**\nThe username used or linked does not exist on the \`offical osu! servers\`. Try using the id of the user instead of the username`);
					return;
				}

				sendBest(client, msg, user, res.data, options);
			}).catch((err: Error) => { error.sendUnexpectedError(err, msg); });
	} else if (options.type == 1) {
		axios.get(`https://api.gatari.pw/users/get?u=${user}`)
			.then((res: any) => {

				if (res.data.users.length == 0) {
					msg.channel.send(`:red_circle: **The username \`${user}\` is not valid**\nThe username used or linked does not exist on \`Gatari servers\`. Try using the id of the user instead of the username`);
					return;
				}

				axios.get(`https://api.gatari.pw/user/scores/best?id=${res.data.users[0].id}&l=100`)
					.then((resScore: any) => {
						sendBest(client, msg, user, gatari.best(res.data, resScore.data), options);
					}).catch((err: Error) => { error.sendUnexpectedError(err, msg); });

			}).catch((err: Error) => { error.sendUnexpectedError(err, msg); });
	} else if (options.type == 2) {
		axios.get(`https://akatsuki.pw/api/v1/users?name=${user}`)
			.then((res: any) => {
				if (res.data.code == 404) {
					msg.channel.send(`:red_circle: **The username \`${user}\` is not valid**\nThe username used or linked does not exist on \`Akatasuki servers\`.`);
					return;
				}


				axios.get(`https://akatsuki.pw/api/v1/users/scores/best?name=${user}&rx=${options.relax ? 1 : 0}&l=100`)
					.then((resScore: any) => {
						sendBest(client, msg, user, akatsuki.best(res.data, resScore.data), options);
					}).catch((err: Error) => { error.sendUnexpectedError(err, msg); });
			}).catch((err: Error) => { error.sendUnexpectedError(err, msg); });
	}
}

function sendBest(client: Client, msg: Message, user: string | undefined, body: Array<IAPIBest>, options: IOptions) {
	let scores: any = [];
	let beatmaps: any = [];

	let userPictureUrl = `https://a.ppy.sh/${body[0].user_id}?${Date.now().toString()}`;
	let userUrl = `https://osu.ppy.sh/users/${body[0].user_id}`;

	if (options.type == 1) {
		userPictureUrl = `https://a.gatari.pw/${body[0].user_id}?${Date.now().toString()}`;
		userUrl = `https://osu.gatari.pw/u/${body[0].user_id}`;
	} else if (options.type == 2) {
		userPictureUrl = `https://a.akatsuki.pw/${body[0].user_id}?${Date.now().toString()}`;
		userUrl = `https://akatsuki.pw/u/${body[0].user_id}`;
	}

	const embed: any = {
		'title': '',
		'author': {
			'url': userUrl
		},
		'description': 'No plays were found	:flushed:',
		'color': 3066993,
		'thumbnail': {
			'url': userPictureUrl
		}
	};

	for (let i = 0; i < body.length && scores.length != 5; i++) {
		if (options.mods![1] != '-1') {
			if (options.mods![0]) {
				if (!mods.has(body[i].enabled_mods, options.mods![1])) {
					continue;
				}
			} else if (options.mods![1] != mods.toString(parseInt(body[i].enabled_mods))) {
				continue;
			}
		}
		
		var difficultyIncreasingMods = 0;
		if (mods.has(body[i].enabled_mods, 'EZ')) difficultyIncreasingMods += 2;
		if (mods.has(body[i].enabled_mods, 'HR')) difficultyIncreasingMods += 16;
		if (mods.has(body[i].enabled_mods, 'DT')) difficultyIncreasingMods += 64;
		if (mods.has(body[i].enabled_mods, 'HT')) difficultyIncreasingMods += 256;

		scores.push(body[i]);
		beatmaps.push(axios.get(`https://osu.ppy.sh/api/get_beatmaps?k=${process.env.osuAPI}&b=${body[i].beatmap_id}&a=1&m=${options.mode}&mods=${difficultyIncreasingMods}`));
	}

	Promise.all(beatmaps).then((values: Array<any>) => {
		const scoresToString: Array<string> = [];
		scores.map((x: any, i: number) => {
			const grade = client.emojis.find((emoji: Emoji) => emoji.name === 'rank_' + x.rank.toLowerCase());
			const pp = Math.floor(parseFloat(x.pp) * 100) / 100;
			const accuracy = score.getAccuracy(options.mode!, x.count300, x.count100, x.count50, x.countmiss, x.countkatu, x.countgeki);
			scoresToString.push(`**[${values[i].data[0].title} [${values[i].data[0].version}]](${`https://osu.ppy.sh/beatmapsets/${values[i].data[0].beatmapset_id}#osu/${values[i].data[0].beatmap_id}`}) +${mods.toString(parseInt(x.enabled_mods))}**\n| ${grade} • **${pp}pp** • ${accuracy}% • [${Math.round(values[i].data[0].difficultyrating * 100) / 100}★]\n| (**${format.number(parseInt(x.maxcombo))}x${values[i].data[0].max_combo ? '**/**' + format.number(values[i].data[0].max_combo) + 'x' : ''}**) • **${format.number(parseInt(x.score))}** • [${x.count300}/${x.count100}/${x.count50}/${x.countmiss}]\n| Achieved: **${format.time(Date.parse(x.date + (options.type == 0 ? ' UTC' : '')))}**\n`);
		});

		embed.author.name = `Here is ${user}'s top ${scores.length} osu! ${score.getRuleset(options.mode?.toString() ?? '0')} plays:`;
		embed.description = scoresToString.join(' ');

		msg.channel.send({
			embed
		});
		console.log(`BEST : ${msg.author.id} : https://osu.ppy.sh/users/${body[0].user_id}`);
	}).catch((err: Error) => { error.sendUnexpectedError(err, msg); });
}

module.exports = {
	name: 'best',
	description: 'Displays the top 5 plays of a user',
	aliases: ['top', 'bt'],
	group: 'osu',
	options: argument.getArgumentDetails(['mods', 'standard', 'taiko', 'catch', 'mania', 'type']),
	arguments: argument.getOtherArgumentDetails(['Username']),
	example: 'https://i.imgur.com/GkL4mJV.jpg',
	execute: execute
};