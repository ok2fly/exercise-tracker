const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser");
// const { customAlphabet } = require("nanoid");
require("dotenv").config();

// https://github.com/ai/nanoid#readme
// cjs load esm module
const loadNanoid = (cb) => {
	return import("nanoid").then((nano) => {
		customAlphabet = nano.customAlphabet;
		const nanoid = customAlphabet("1234567890abcdef", 24);
		cb(nanoid);
	});
};

const USER_STORE = {};

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users", (req, res) => {
	const ret = [];
	Object.keys(USER_STORE).forEach((key) => {
		const _id = key;
		const username = USER_STORE[key].username;
		ret.push({ _id, username });
	});
	res.json(ret);
});

app.post("/api/users", (req, res) => {
	const username = req.body.username;
	loadNanoid((nanoid) => {
		const _id = nanoid();
		USER_STORE[_id] = { username, log: [] };
		res.json({
			_id,
			username,
		});
	});
});

app.post("/api/users/:_id/exercises", (req, res) => {
	const _id = req.params._id;
	const description = req.body.description;
	const duration = parseInt(req.body.duration); // mins
	const date = req.body.date ? new Date(req.body.date) : new Date(); // yyyy-mm-dd
	debugger;
	USER_STORE[_id].log.push({
		description,
		duration,
		date: date.toDateString(),
	});
	res.json({
		_id,
		username: USER_STORE[_id].username,
		description,
		duration,
		date: date.toDateString(),
	});
});

app.get("/api/users/:_id/logs", (req, res) => {
	// /api/users/:_id/logs?[from][&to][&limit]
	const _id = req.params._id;
	const from = req.query.from ? new Date(req.query.from) : new Date(0); // yyyy-mm-dd
	const to = req.query.to ? new Date(req.query.to) : new Date(); // yyyy-mm-dd
	const limit = req.query.limit ? parseInt(req.query.limit) : 100;
	const log = USER_STORE[_id].log
		.filter((log) => {
			const logDate = new Date(log.date);
			return logDate >= from && logDate <= to;
		})
		.slice(0, limit);
	const count = log.length;
	res.json({
		_id,
		username: USER_STORE[_id].username,
		count,
		log,
	});
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
