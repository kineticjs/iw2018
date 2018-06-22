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
		return new Promise(function(resolve, reject) {	
			var oFrameWindow = window.document.getElementById("sap-ui-TestFrame").contentWindow;
			oTestObject.getUI5ObjectPromise(oFrameWindow).then(function(sFrameOptions) {
				resolve(sFrameOptions === "deny");
			});
		});
		
	},
	getUI5ObjectPromise: function(oFrameWindow) {

		return new Promise(function(resolve, reject) {

			var iTrys = 0,
				sFrameOptions;

			function waitForObject() {
				sFrameOptions = oFrameWindow.sap && oFrameWindow.sap.ui.getCore().getConfiguration().getFrameOptions();
				if (sFrameOptions) {
					resolve(sFrameOptions);

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