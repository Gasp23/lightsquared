#!/usr/bin/js

var requirejs = require("requirejs");
var mongodb = require("mongodb");
var yargs = require("yargs");
var Server = require("websocket-server/Server");

requirejs.config({
	nodeRequire: require
});

var argv = yargs.default({
	bots: 0,
	port: 8080
}).argv;

requirejs(["./Application", "./Bot"], function(Application, Bot) {
	mongodb.MongoClient.connect("mongodb://localhost:27017/lightsquare", function(error, db) {
		if(db) {
			var server = new Server(argv.port);
			var app = new Application(server, db);
			
			for(var i = 0; i < argv.bots; i++) {
				new Bot(app);
			}
		}
		
		else {
			console.log("Cannot connect to mongodb");
			console.log(error);
			process.exit(1);
		}
	});
});