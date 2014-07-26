define(function(require) {
	var id = require("lib/id");
	var time = require("lib/time");
	var Event = require("lib/Event");
	var Game = require("./Game");
	var jsonChessConstants = require("jsonchess/constants");
	var Time = require("chess/Time");
	
	function Seek(owner, options) {
		this._id = id();
		this._owner = owner;
		
		this.Expired = new Event();
		this.Matched = new Event();
		
		this._options = {
			initialTime: "10m",
			timeIncrement: "0",
			acceptRatingMin: "-100",
			acceptRatingMax: "+100"
		};
		
		if(options) {
			for(var p in options) {
				this._options[p] = options[p];
			}
		}
		
		this._initialTime = Time.fromUnitString(this._options.initialTime, Time.minutes);
		this._timeIncrement = Time.fromUnitString(this._options.timeIncrement, Time.seconds);
		
		if(this._initialTime.getMilliseconds() === 0) {
			throw "Initial time must be at least 1s";
		}
		
		this._acceptRatingMin = this._getAbsoluteRating(this._options.acceptRatingMin);
		this._acceptRatingMax = this._getAbsoluteRating(this._options.acceptRatingMax);
		
		this._timeoutTimer = setTimeout((function() {
			this._timeout();
		}).bind(this), jsonChessConstants.SEEK_TIMEOUT);
		
		this._expiryTime = time() + jsonChessConstants.SEEK_TIMEOUT;
	}
	
	Seek.prototype.getId = function() {
		return this._id;
	}
	
	Seek.prototype.accept = function(player) {
		var game = null;
		
		if(player !== this._owner && this.matchesPlayer(player)) {
			var white, black;
			var ownerRatio = this._owner.getGamesAsWhiteRatio();
			var guestRatio = player.getGamesAsWhiteRatio();
			
			if(ownerRatio > guestRatio) {
				white = player;
				black = this._owner;
			}
			
			else {
				white = this._owner;
				black = player;
			}
			
			game = new Game(white, black, {
				initialTime: this._options.initialTime,
				timeIncrement: this._options.timeIncrement
			});
			
			this._clearTimeoutTimer();
			this.Matched.fire(game);
		}
		
		return game;
	}
	
	Seek.prototype.matchesPlayer = function(player) {
		var rating = player.getRating();
		
		return (rating >= this._acceptRatingMin && rating <= this._acceptRatingMax);
	}
	
	Seek.prototype.matchesOptions = function(options) {
		return (
			Time.fromUnitString(options.initialTime, Time.minutes).getMilliseconds() === this._initialTime.getMilliseconds()
			&& Time.fromUnitString(options.timeIncrement, Time.seconds).getMilliseconds() === this._timeIncrement.getMilliseconds()
		);
	}
	
	Seek.prototype.cancel = function() {
		this._clearTimeoutTimer();
		this.Expired.fire();
	}
	
	Seek.prototype._timeout = function() {
		this.Expired.fire();
	}
	
	Seek.prototype._clearTimeoutTimer = function() {
		if(this._timeoutTimer !== null) {
			clearTimeout(this._timeoutTimer);
			
			this._timeoutTimer = null;
		}
	}
	
	Seek.prototype._getAbsoluteRating = function(ratingSpecifier) {
		var firstChar = ratingSpecifier.charAt(0);
		
		if(firstChar === "-" || firstChar === "+") {
			return this._owner.getRating() + parseInt(ratingSpecifier);
		}
		
		else {
			return parseInt(ratingSpecifier);
		}
	}
	
	Seek.prototype.toJSON = function() {
		return {
			id: this._id,
			owner: this._owner,
			options: this._options,
			expiryTime: this._expiryTime
		};
	}
	
	return Seek;
});