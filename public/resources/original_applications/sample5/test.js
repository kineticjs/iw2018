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
			oTestObject.getUI5ObjectPromise(".HTML", oFrameWindow).then(function(oVBox) {
				resolve(oVBox.getItems()[0].getSanitizeContent());
			});
		});
		
	},

	getUI5ObjectPromise: function(sClassName, oFrameWindow) {

		return new Promise(function(resolve, reject) {

			var iTrys = 0,
				oUI5Object;

			function waitForObject() {
				oUI5Object = oFrameWindow.jQuery && oFrameWindow.jQuery(sClassName).control()[0];
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
