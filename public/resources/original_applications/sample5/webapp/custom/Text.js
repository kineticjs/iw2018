/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/m/library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";

	var Text = Control.extend("custom.Text", {
		metadata : {
			properties : {
				text : {type : "string", group : "Data", defaultValue : ''}
			}
		},
		renderer: function(rm, oControl) {

			rm.write("<span");
			rm.writeControlData(oControl);
			rm.write(">");

			rm.writeEscaped(oControl.getText());

			rm.write("</span>");
		}
	});

	Text.prototype.setText = function(sText) {
		if (this.$()[0]) {
			this.$().html(sText);
		}
		this.setProperty("text", sText, true);
	};

    return Text;

}, /* bExport= */ true);
