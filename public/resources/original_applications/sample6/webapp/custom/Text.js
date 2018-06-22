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
			//{codeeditor}
			rm.write("<span");
			rm.writeControlData(oControl);
			rm.write(">");

			rm.write(oControl.getText()); // should use rm.writeEscaped(oControl.getText());

			rm.write("</span>");
			//{codeeditor}
		}
	});

	Text.prototype.setText = function(sText) {
		//{codeeditor}
		if (sText) {
			sText = sText.replace(/<script\s/, '').replace('</script>', '');
		}
		if (this.$()[0]) {
			this.$().html(sText); // should use this.$().html(jQuery.sap.encodeHTML(text))

								// OR this.getDomRef().textContent = sText (safe API)
		}
		this.setProperty("text", sText, true);
		//{codeeditor}
	};

    return Text;

}, /* bExport= */ true);
