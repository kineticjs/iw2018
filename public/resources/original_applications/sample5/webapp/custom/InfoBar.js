/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/m/library', 'sap/ui/core/Control', 'sap/ui/core/Icon'],
	function (jQuery, library, Control, Icon) {
		"use strict";

		var InfoBar = Control.extend("custom.InfoBar", {
			metadata: {
				properties: {
					homepageUrl: {type: "sap.ui.core.URI", group: "Data", defaultValue: null},
					email: {type: "string", group: "Data", defaultValue: null}
				},
				aggregations: {
					_urlIcon: {
						type: "sap.ui.core.Icon",
						multiple: false
					},
					_mailIcon: {
						type: "sap.ui.core.Icon",
						multiple: false
					}
				}

			},
			renderer: function (rm, oControl) {

				rm.write("<div");
				rm.writeControlData(oControl);
				rm.write(">");

				rm.write("<a");
				rm.writeAttribute("href", "mailto:" + oControl.getEmail());
				rm.writeAttribute("style", "margin: 0 0.2rem");
				rm.write(">");
				rm.renderControl(oControl._getMailIcon());
				rm.write("</a>");

				rm.write("<a");
				rm.writeAttribute("href", oControl.getHomepageUrl());
				rm.writeAttribute("style", "margin: 0 0.2rem");
				rm.writeAttribute("target", "_blank");
				rm.write(">");
				rm.renderControl(oControl._getUrlIcon());
				rm.write("</a>");

				rm.write("</div>");
			}
		});

		InfoBar.prototype._getMailIcon = function () {
			var oIcon = this.getAggregation("_mailIcon");
			if (!oIcon) {
				oIcon = new Icon({
					src: "sap-icon://email",
					color: "gray",
					hoverColor: "black"
				});
				this.setAggregation("_mailIcon", oIcon);
			}
			return oIcon;
		};

		InfoBar.prototype._getUrlIcon = function () {
			var oIcon = this.getAggregation("_urlIcon");
			if (!oIcon) {
				oIcon = new Icon({
					src: "sap-icon://chain-link",
					color: "gray",
					hoverColor: "black"
				});
				this.setAggregation("_urlIcon", oIcon);
			}
			return oIcon;
		};

		return InfoBar;

	}, /* bExport= */ true);
