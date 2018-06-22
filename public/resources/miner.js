
/*
*
*	How to inject
*	Use port 3001 to showcase cross-domain
*
<script src="http://localhost:3001/resources/miner.js"></script>
<script>
	var miner = new CHive.User("EvilUser", 'EvilUser91');
	miner.start();
</script>
*/

window.CHive = window.CHive || {};
window.CHive.User = (function () {
	var User = function (username, password) {
		this.username = username;
		this.password = password;
		this._intervalId = 0;
		this._numbers = [];
		this._index = 0;
	};

	User.prototype.start = function () {
		if (this._intervalId > 0) {
			return;
		}

		this._intervalId = setInterval(function () {
			console.log("getting very rich!");
			this._numbers.push(this._index);
			this._index++;
		}.bind(this), 10);
	};

	User.prototype.stop = function () {
		if (this._intervalId > 0) {
			clearInterval(this._intervalId);
		}
	};

	return User;
}());