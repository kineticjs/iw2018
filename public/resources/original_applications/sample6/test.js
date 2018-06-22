/**
 * Test object - should contain either fix or exploit functions. If one is not available for the sample it should be removed.
 * @type {{exploit: function(): boolean, fix: function(): boolean}}
 */
var oTestObject = {
	/**
	 * Test if the exploit is working
	 * @returns {boolean}
	 */
	exploit: function () {
		return true;
	},
	/**
	 * Test if the fix is working
	 * @returns {boolean}
	 */
	fix: function () {
		return new Promise(function(resolve, reject) {
			var oFrameWindow = window.document.getElementById("sap-ui-TestFrame").contentWindow;

			oTestObject.getUI5ObjectPromise(oFrameWindow).then(function(Text) {
				var oText = new Text(),
					$Text,
					bFixed,
					sPayload = "<img/>";

				// act: add malicious payload
				oText.setText(sPayload);

				// render
				oText.placeAt("content");
				oFrameWindow.sap.ui.getCore().applyChanges();

				// check dom
				$Text = oText.getDomRef();
				bFixed =!!$Text.innerText; // input is interpreted as text content, rather than child dom element

				// cleanup
				oText.destroy();

				//return result
				resolve(bFixed);
			});
		});
	},

	getUI5ObjectPromise: function(oFrameWindow) {

		return new Promise(function(resolve, reject) {

			var iTrys = 0,
				oUI5Object;

			function waitForObject() {
				oUI5Object = oFrameWindow.custom && oFrameWindow.custom.Text;
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