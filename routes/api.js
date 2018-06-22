const express = require('express');
const router = express.Router();

const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(); // Default is a 128-bit UID encoded in base58

const fs = require('fs-extra');
const path = require("path");
const aResources = ['keylogger.js', "bgworker.js", 'loginspoofer.js'];

router.get('/api', function(req, res, next) {
	res.send("Hello from the API!");
});

/**
 * Create a token and clone original app provided in the token specific directory
 */
router.get('/api/openApp/:appId', function(req, res, next) {
	let originalAppName = req.param("appId"),
		uid;

	uidgen.generate() // Generate UID
		.then(genUID => {uid = genUID})
		.then(cloneApplication)
		.then(outputURL)
		.catch(oError => {
			res.send(JSON.stringify({error: oError.toString()}));
		});

	function cloneApplication() {
		return fs.copy('public/resources/original_applications/' + originalAppName,
			'public/resources/token_applications/' + uid);
	}

	function outputURL() {
		res.send(JSON.stringify({success: true, url: "/token_applications/" + uid, token: uid}));
	}
});

/**
 * Save post response in provided file
 */
router.post('/api/save', function (req, res, next) {
	let sToken = req.param("token"),
		content = req.param("content");
	
	getApplicationConfig(sToken)
		.then((oConfig) => {
			let editFilePath = path.normalize("public/resources/token_applications/" + sToken + "/" + oConfig.app.editURL);

			// Basic check for empty file
			if (content.trim() === "") return Promise.reject("Empty content");

			return new Promise ((resolve, reject) => {
				fs.writeFile(editFilePath, content, 'utf8', err => {
					if (err) reject(err);
					resolve();
				});
			});
		})
		.then(() => {
			res.send(JSON.stringify({saved: true}));
		})
		.catch(oError => {
			res.send(oError.toString());
		});
});


/**
 * Post new comment
 */
router.post('/api/comments', function (req, res, next) {

	let sToken = req.param("token"),
		sId = req.param("CommentID"),
		sPostId = req.param("PostID"),
		sUserName = req.param("Username"),
		sText = req.param("Text");

	var sCommentsDataPath = "public/resources/token_applications/" + sToken + "/webapp/localService/mockdata/Comments.json";

	fs.readFile(sCommentsDataPath, (err, data) => {
		if (err) {
			console.log(err);
		} else {
			var aData = JSON.parse(data);
			aData.push( {
				CommentID: sId,
				PostID: sPostId,
				Text: sText,
				Username: sUserName,
				Timestamp: "/Date(" + Date.now() + ")/"
			});
			fs.writeFile(sCommentsDataPath, JSON.stringify(aData), 'utf8', err => {
				if (err) res.send(err.toString());
			});
		}
	});

});

/**
 * Update user profile
 */
router.post('/api/users', function (req, res, next) {

	let sToken = req.param("token"),
		sUserName = req.param("Username"),
		sName = req.param("Name"),
		sEmail = req.param("Email"),
		sUrl = req.param("Url");

	var sCommentsDataPath = "public/resources/token_applications/" + sToken + "/webapp/localService/mockdata/Users.json";

	fs.readFile(sCommentsDataPath, (err, data) => {
		if (err) {
			console.log(err);
		} else {
			var aData = JSON.parse(data);
				aData.forEach(function(oUserData) {
					if (oUserData.Username === sUserName) {
						oUserData.Name = sName;
						oUserData.Email = sEmail;
						oUserData.Url = sUrl;
					}
				});
			fs.writeFile(sCommentsDataPath, JSON.stringify(aData), 'utf8', err => {
				if (err) res.send(err.toString());
			});
		}
	});

});

/**
 * Publish new posting
 */
router.post('/api/posts', function (req, res, next) {

	let sToken = req.param("token"),
		sPostID = req.param("PostID"),
		sTitle = req.param("Title"),
		sTimestamp = req.param("Timestamp"),
		sDescription = req.param("Description"),
		sPrice = req.param("Price");

	var sCommentsDataPath = "public/resources/token_applications/" + sToken + "/webapp/localService/mockdata/Posts.json";

	fs.readFile(sCommentsDataPath, (err, data) => {
		if (err) {
			console.log(err);
		} else {
			var aData = JSON.parse(data),
				oNewPost = {
					"PostID": sPostID,
					"Title": sTitle,
					"Timestamp": sTimestamp,
					"Description": sDescription,
					"Category": "Miscellaneous",
					"Contact": "contact.me07@gmail.com",
					"Currency": "USD",
					"Price": sPrice,
					"Flagged": 0,
					"Recommended": 0,
					"Recommendations": 1
				};
			aData.push(oNewPost);
			fs.writeFile(sCommentsDataPath, JSON.stringify(aData), 'utf8', err => {
				if (err) res.send(err.toString());
			});
		}
	});

});

/**
 * Get list of available tasks
 */
router.get('/api/tasks', function (req, res, next) {
	fs.readdir("public/resources/original_applications", (err, files) => {
		let tasks = [];

		files.forEach(sDir => {
			let oConfig = JSON.parse(fs.readFileSync("public/resources/original_applications/" + sDir + "/config.json"));

			tasks.push({
				id: sDir,
				title: oConfig.title,
				category: oConfig.category,
				description: ""
			});
		});

		res.send(JSON.stringify({tasks: tasks}));
	});
});


/**
 * Get attack resource
 */
router.get('/api/attack/:resourceUri', function(req, res, next) {
	
	let sResource = req.param("resourceUri"),
		oReferer = req.headers.referer,
        aRefererSplit = oReferer && oReferer.split("/"),
        oRequestSplit = req.url.split("/"),
        sToken,
		sResponse = 'xss';

    if (aRefererSplit && aRefererSplit.length) {
        sToken = aRefererSplit[5]; //TODO make more presize
		// persist a record for successful exploit
		if (sToken) {
			fs.writeFile("public/resources/token_applications/" + sToken + "/exploits.json", JSON.stringify({exploits: true}), 'utf8');
		}
    }

    res.writeHead(200, {'Content-Type': 'text/plain'});

    if (aResources.indexOf(sResource) >= 0) {
		// get resource from the file system and return in response
        sResponse = fs.readFileSync("public/test_resources/api/" + sResource);
		sResponse = sResponse ? sResponse.toString() : "N/A";
    }

    res.end(sResponse);
});


/**
 * Get exploit results
 */
router.get('/api/exploits/:token', function(req, res, next) {

	let sToken = req.param("token");

	getExploits(sToken).then( exploits => {  res.end(JSON.stringify(exploits)); });
});

/**
 * Get score file
 */
router.get('/api/getScore/:token', function (req, res, next) {
	let sToken = req.param("token");

	let getScoreFile = function () {
		fs.readFile("public/resources/token_applications/" + sToken + "/score.json", (oError, oData) => {
			if (oError) {
				let sFileContent = JSON.stringify({score: 0, hints: 0, showAnswer: false, success: false});
				fs.writeFile("public/resources/token_applications/" + sToken + "/score.json", sFileContent, 'utf8', oError => {
					if (oError) res.send(oError.toString());
					res.send(sFileContent);
				});
			} else {
				res.send(oData);
			}
		});
	};

	getScoreFile();
});

/**
 * Request hint
 */
router.get('/api/requestHint/:token', function (req, res, next) {
	let sToken = req.param("token");

	let getScoreFile = function () {
		fs.readFile("public/resources/token_applications/" + sToken + "/score.json", (oError, oData) => {
			if (oError) {
				res.send(oError.toString());
			} else {
				oData = JSON.parse(oData);
				// getApplicationConfig(sToken)
				// 	.then(oConfig => {
				// 		if (Object.keys(oConfig.hints).length < Object.keys(oData).hints) {
				oData.hints++;
				let sFileContent = JSON.stringify(oData);
				fs.writeFile("public/resources/token_applications/" + sToken + "/score.json", sFileContent, 'utf8', oError => {
					if (oError) res.send(oError.toString());
					res.send(sFileContent);
				});
				// } else {
				// 	res.send(JSON.stringify({error: "No more hints available for task."}))
				// }
				// })
				// .catch(oError => {
				// 	res.send(oError.toString());
				// })
			}
		});
	};

	getScoreFile();
});

/**
 * Request answer
 */
router.get('/api/requestAnswer/:token', function (req, res, next) {
	let sToken = req.param("token");

	fs.readFile("public/resources/token_applications/" + sToken + "/score.json", (oError, oData) => {
		if (oError) {
			res.send(oError.toString());
		} else {
			getApplicationConfig(sToken)
				.then((oConfig) => {
					oData = JSON.parse(oData);

					if (oData.showAnswer === false) {
						oData.showAnswer = true;

						if (oData.success === false) {
							oData.score = oData.score - oConfig.score.answer;

							let sFileContent = JSON.stringify(oData);
							fs.writeFile("public/resources/token_applications/" + sToken + "/score.json", sFileContent, 'utf8', oError => {
								if (oError) res.send(oError.toString());
								res.send(sFileContent);
							});
						} else {
							let sFileContent = JSON.stringify(oData);
							res.send(sFileContent);
						}
					}
				});
		}
	});

});

/**
 * Record success
 */
router.get('/api/recordSuccess/:token', function (req, res, next) {
	let sToken = req.param("token");

	fs.readFile("public/resources/token_applications/" + sToken + "/score.json", (oError, oData) => {
		if (oError) {
			res.send(oError.toString());
		} else {
			getApplicationConfig(sToken)
				.then((oConfig) => {
					oData = JSON.parse(oData);

					if (oData.success === false) {
						oData.success = true;
						oData.score = oData.score + oConfig.score.success;

						let sFileContent = JSON.stringify(oData);
						fs.writeFile("public/resources/token_applications/" + sToken + "/score.json", sFileContent, 'utf8', oError => {
							if (oError) res.send(oError.toString());
							res.send(sFileContent);
						});
					} else {
						res.send(JSON.stringify(oData));
					}
				});
		}
	});

});

function getApplicationConfig (sToken) {
	return new Promise ((resolve, reject) => {
		fs.readFile("public/resources/token_applications/" + sToken + "/config.json", (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(JSON.parse(data));
			}
		});
	})
}

function getExploits (sToken) {
	return new Promise ((resolve, reject) => {
		fs.readFile("public/resources/token_applications/" + sToken + "/exploits.json", (err, data) => {
			if (err) {
				resolve({"exploits": false});
			} else {
				resolve(JSON.parse(data));
			}
		});
	})
}

module.exports = router;