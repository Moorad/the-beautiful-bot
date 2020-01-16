
require('dotenv').config({path:'../.env'});
const MongoClient = require('mongodb').MongoClient;

const url = `mongodb://${process.env.dbUsername}:${process.env.dbPassword}@ds121295.mlab.com:21295/thebeautifulbot`;
const dbName = 'thebeautifulbot';

function read(findObject,callback) {
	MongoClient.connect(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}, function (err, client) {

		const db = client.db(dbName);

		const collection = db.collection('users');

		collection.find(findObject).toArray(function (err, docs) {	
			if (docs.length == 0) {
				console.log(`FAILED TO READ : { ${Object.keys(findObject)[0]} : ${Object.values(findObject)[0]} }`);
				callback({
					error: 'Failed to read database'
				});
				return;
			}
			console.log(`READ : ${docs[0]._id}`);
			callback(docs[0]);
		});
		client.close();
	});
}

function write() {

}

function update() {

}


module.exports = {
	read: read,
	write: write,
	update: update
};