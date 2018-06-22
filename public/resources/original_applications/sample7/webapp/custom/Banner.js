/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/m/library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";

	var Banner = Control.extend("custom.Banner", {
		metadata : {
			properties : {
				homepageUrl : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},
				sendStatistics : {type : "boolean", group : "Data", defaultValue : true}
			}
		},
		renderer: function(rm, oControl) {

			rm.write("<div");
			rm.writeControlData(oControl);
			rm.writeAttribute("style", "margin-left:1rem");
			rm.writeClasses();
			rm.write(">");
			rm.write("<a");
			rm.writeAttribute("style", "color:white");

			var sHomepageUrl = oControl.getHomepageUrl();

			if (oControl.getSendStatistics()) {
				sHomepageUrl += "?referrer=" + decodeURIComponent(document.referrer);
			}

			rm.writeAttribute("href", sHomepageUrl);

			rm.write(">");
			rm.write("More Offers (50% OFF)");
			rm.write("</a>");
			rm.write("</div>");
		}
	});

    return Banner;

}, /* bExport= */ true);
