Lightsquared
============

Lightsquared is a chess server.  Clients connect to it using
WebSockets to play against each other or against bots using the
Stockfish engine.

Installation
------------

- Download the code
- $npm install

**Note** - the `websocket` module requires the `node` command, which can be obtained by
installing the `node-legacy` package, or possibly by just symlinking /usr/bin/node
to /usr/bin/nodejs.

Running the server
------------------

Invoke main.js directly, or use [forever][3] to run it in the background (`#npm install
-g forever`).

Use the --bots N option to create computer players, e.g. `$js main.js --bots 5`.

**Example forever command:**

```
forever start /home/gus/projects/lightsquared/main.js --bots 5
```

[3]:https://github.com/nodejitsu/forever