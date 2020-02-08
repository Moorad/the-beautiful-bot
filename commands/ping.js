const request = require('request');
const {
	exec
} = require('child_process');

async function ping(client, msg) {
	var times = [
		[new Date(Date.now())]
	];

	const message = await msg.channel.send('Pinging');

	request(`https://osu.ppy.sh/api/get_user_recent?${process.env.osuAPI}&u=Moorad`, () => {
		times[0][1] = new Date(Date.now());
		times.push([new Date(Date.now())]);
		request(`https://the-beautiful-bot-api.herokuapp.com/api/player?osuKey=${process.env.osuAPI}&user=Moorad`, () => {
			times[1][1] = new Date(Date.now());
			times.push([new Date(Date.now())]);

			exec('curl -s https://osu.ppy.sh/osu/1192807 | node handlers/pp.js 100%', () => {
				times[2][1] = new Date(Date.now());
				times.push([new Date(Date.now())]);
				request('https://api.gatari.pw/user/stats?u=Moorad', () => {
					times[3][1] = new Date(Date.now());
					message.edit(`Discord API Latency is ${Math.round(client.ping)}ms\nosu! API latency is ${times[0][1] - times[0][0]}ms\nTBB API Latency is ${times[1][1] - times[1][0]}ms\nOjsama Latency is ${times[2][1] - times[2][0]}ms\nGatari Latency is ${times[3][1] - times[3][0]}ms`);
				});
			});
		});

	});
}

module.exports = {
	ping: ping
};