/**
 * Test object - should contain either fix or exploit functions. If one is not available for the sample it should be removed.
 * @type {{exploit: function(): boolean, fix: function(): boolean}}
 */
var oTestObject = {
	/**
	 * Test if the fix is working
	 * @returns {boolean}
	 */
	fix: function () {
		var oFrameWindow = window.document.getElementById("sap-ui-TestFrame").contentWindow,
			sPayload = "https://example.com&gibberish=1234@localhost:3000/";

		return new Promise(function(resolve, reject) {

			oTestObject.getUI5ObjectPromise("__component0---profile", oFrameWindow).then(function (oProfileView) {
				var bValidUrl = oProfileView.getController().validateURL(sPayload);
				resolve(bValidUrl === false);
				
			}.bind(this));
		});
	},
	getUI5ObjectPromise: function(sUI5ObjectId, oFrameWindow) {

		return new Promise(function(resolve, reject) {

			var iTrys = 0,
				oUI5Object;

			function waitForObject() {
				oUI5Object = oFrameWindow.sap && oFrameWindow.sap.ui.getCore().byId(sUI5ObjectId);
				if (oUI5Object) {
					resolve(oUI5Object);

				} else if (iTrys++ < 400) {
					setTimeout(waitForObject, 10);

				} else {
					reject();
				}
			}
			setTimeout(waitForObject, 10);
		});
	}
};
