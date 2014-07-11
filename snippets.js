
		this._gamesPlayedAsWhite = 0;
		this._gamesPlayedAsBlack = 0;
		
		this._glicko2 = this._getInitialGlicko2();
		this._recentRatedResults = [];
		
		
		this.Replaced = new Event(this);
	
	User.prototype.getCurrentGames = function() {
		return this._currentGames.getShallowCopy();
	}
	
	User.prototype.getRating = function() {
		return this._glicko2.rating;
	}
	
	User.prototype.getGlicko2 = function() {
		return this._glicko2;
	}
	
	User.prototype.getGamesPlayedAsWhite = function() {
		return this._gamesPlayedAsWhite;
	}
	
	User.prototype.getGamesPlayedAsBlack = function() {
		return this._gamesPlayedAsBlack;
	}
	
	
	
	User.prototype.replace = function(user) {
		this._loadJson(user.getPersistentJson());
		
		user.replaceWith(this);
		
		user.getCurrentGames().forEach((function(game) {
			this._currentGames.push(game);
		}).bind(this));
	}
	
	User.prototype.replaceWith = function(user) {
		this.Replaced.fire(user);
		this._logout();
		this._user.send("/user/replaced");
		this._user.disconnect();
	}
	
	
	
	
	
	
	User.prototype.getGamesAsWhiteRatio = function() {
		return Math.max(1, this._gamesPlayedAsWhite) / Math.max(1, this._gamesPlayedAsBlack);
	}
	

		
		
		
	Game.prototype._setupPlayer = function(user, colour) {
		this._subscribeToPlayerMessages(user);
		
		user.Replaced.addHandler(this, function(newUser) {
			this._players[colour] = newUser;
			this._setupPlayer(newUser, colour);
			
			newUser.send("/game", this);
			
			this.spectate(user);
		});
		
		user.LoggingOut.addHandler(this, function() {
			this._resign(user);
		});
	}
	
	Game.prototype._setupSpectator = function(user) {
		this._subscribeToUserMessages(user);
		
		user.Replaced.addHandler(this, function(newUser) {
			this._spectators.remove(user);
			this._spectators.push(newUser);
			this._setupSpectator(newUser);
			
			newUser.send("/game", this);
		});
	}
	
	/*
	from Game.move
	
		this._sendToAllUsers("/game/" + this._id + "/move", this._getMoveJson(move, index));
	
	...
	
	Game.prototype._getMoveJson = function(move, index) {
		var promoteTo = move.getPromoteTo();
		
		return {
			from: move.getFrom().squareNo,
			to: move.getTo().squareNo,
			promoteTo: promoteTo === PieceType.queen ? undefined : promoteTo.sanString,
			index: index,
			time: move.getTime()
		};
	}
	User has to handle sending the move index
	
	var index = this._game.getHistory().length;
	*/
	
	/*
	from Game._offerDraw
	
		this._sendToAllUsers("/game/" + this._id + "/draw_offer", this.getPlayerColour(user).fenString);
	*/
	
	
	
	//players don't send themselves chat messages from other users
	
	Game.prototype._sendToAllUsers = function(url, data) {
		var players = [];
		
		for(var colour in this._players) {
			players.push(this._players[colour]);
		}
		
		players = players.concat(this._spectators);
		
		players.forEach(function(player) {
			player.send(url, data);
		});
	}
	
	Game.prototype._sendToSpectators = function(url, data) {
		this._spectators.forEach(function(player) {
			player.send(url, data);
		});
	}
	
	
	
	
	
	
	//from Game._gameOver
	this._sendToAllUsers("/game/" + this._id + "/game_over", {
			result: result
		});
	
	
	
	
	
	this._sendToAllUsers("/game/" + this._id + "/aborted");
	
	
	
	/*
	NOTE serverside user should still send /game/123/move so that the different
	games can listen on specific urls, but the client should now send /game/move, {id: 123}
	*/
	
	
	
	
	this._players[colour.opposite].send("/game/" + this._id + "/rematch_declined");
	this._players[colour.opposite].send("/game/" + this._id + "/rematch_offer");
	this._sendToAllUsers("/game/" + this._id + "/rematch", game);
	
	
	/*
	rematches could be handled just between the users mostly
		this.RematchOffered = new Event(this);
		this.RematchDeclined = new Event(this);
		
	Game.prototype.offerRematch = function(player) {
		if(this.playerIsPlaying(player) && this._rematchOfferedBy === null) {
			this._rematchOfferedBy = player;
			this.RematchOffered.fire(player);
		}
	}
	
	Game.prototype.acceptRematch = function(player) {
		if(this.playerIsPlaying(player) && this._rematchOfferedBy !== player && this._rematchOfferedBy !== null) {
			this._rematch();
		}
	}
	
	Game.prototype.declineRematch = function(player) {
		if(this.playerIsPlaying(player) && this._rematchOfferedBy !== player) {
			this.RematchDeclined.fire(player);
		}
	}
	*/
	
	
	/*
	*/
	
	
	
	/*
	
	user needs to handle deciding whether to move or premove - the check doesn't make any
	sense in Game anymore
	
	if(this.playerIsPlaying(player)) {
			if(this.getPlayerColour(player) === this.getActiveColour()) {
				this.move(player, premove.getFrom(), premove.getTo(), premove.getPromoteTo());
			}
			
			else if(premove.isValid() && this._pendingPremove === null) {
				this._pendingPremove = premove;
			}
		}
	*/