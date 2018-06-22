sap.ui.define([
	"sap/ui/innoweek/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
"use strict";

	var JS_DELIMITER = "//{codeeditor}",
		XML_DELIMITER = "<!-- {codeeditor} -->";


	return BaseController.extend("sap.ui.innoweek.controller.Edit", {
		onInit: function () {
			this.oRouter = this.getRouter();
			this.oRouter.getRoute("edit").attachMatched(this._onEditRouteMatched, this);
			this.oEditPage = this.getView().byId("editPage");

			this.sDelimiter = JS_DELIMITER;
		},
		_onEditRouteMatched : function (oEvent) {
			this.sToken = oEvent.getParameter("arguments").token;

			// Load config
			jQuery.get("resources/token_applications/" + this.sToken + "/config.json", function (oConfig) {

				// Modify page title
				this.oEditPage.setTitle("Edit file: " + oConfig.app.editURL);

				var bEditJs = /[.]js$/.test(oConfig.app.editURL),
					bEditXml = /[.]xml$/.test(oConfig.app.editURL),
					bEditHtml = /[.]html$/.test(oConfig.app.editURL);

					this.sDelimiter = bEditJs ? JS_DELIMITER : XML_DELIMITER;
					this.bHasMarkupContent = bEditXml || bEditHtml;

				// We force text as we need static resource
				jQuery.ajax("resources/token_applications/" + this.sToken + "/" + oConfig.app.editURL, {
						dataType: "text",
						success: this.createContent.bind(this)
					}
				);
			}.bind(this));
		},
		_emptyPageContent: function () {
			this.oEditPage.getContent().forEach(function (oItem) {
				oItem.destroy();
			});
		},
		createContent: function(sData) {
			// Empty previous page content
			this._emptyPageContent();

			this.aData = sData.split(this.sDelimiter);

			this.aData.forEach(function (sContent, i) {
				var oCE;

				if ((i % 2) === 1) {

					// Every odd item should be editable part
					oCE = new sap.ui.codeeditor.CodeEditor({
						value: sap.ui.base.ManagedObject.escapeSettingsValue(sContent),
						lineNumbers: false,
						height: "auto",
						maxLines: 150
					});

					// Add it to the page also
					this.oEditPage.addContent(oCE);

					// Replace it in the original content array with the instance of the codeeditor
					this.aData[i] = oCE;

				} else {
					if (this.bHasMarkupContent) {
						sContent = jQuery.sap.escapeHTML(sContent);
					}

					// Every even is only displayed
					this.oEditPage.addContent(new sap.ui.core.HTML({content: sap.ui.base.ManagedObject.escapeSettingsValue("<pre>" + sContent + "</pre>")}));

				}
			}.bind(this))
		},
		handleSave: function () {
			var aResult = [],
				sFileContent,
				sCEContent;

			// Loading indicator
			this.oEditPage.setBusy(true);

			this.aData.forEach(function (vContent, i) {
				if (typeof vContent === "string") {
					// Static part
					aResult.push(vContent);
				} else {
					// Code editor instance
					sCEContent = vContent.getValue();

					if (i > 0 && !(/^\s*(\r|\n)/.exec(sCEContent))) {
						sCEContent = "\n" + sCEContent;
					}

					aResult.push(sCEContent);
				}
			}.bind(this));

			sFileContent = aResult.join(this.sDelimiter);

			jQuery.ajax("/api/save", {
				method: "POST",
				data: {
					token: this.sToken,
					content: sFileContent
				},
				dataType: "json",
				success: function (oResponse) {
					this.oEditPage.setBusy(false);
					if (oResponse.saved) sap.m.MessageToast.show("Saved!");
				}.bind(this),
				error: function (oError) {
					this.oEditPage.setBusy(true);
					sap.m.MessageToast.show("FAILURE - Could not save file!");
				}.bind(this)
			});
		},
		handleCancel: function () {
			// Nav back
			this.oRouter.navTo("tasksWithToken", {
				token: this.sToken,
				taskCategory: "security"
			})
		},
		handleOpen: function () {
			var sBaseUrl = "/resources/token_applications/" + this.sToken;
			jQuery.get(sBaseUrl + "/config.json")
				.done(function (oConfig) {
					window.open(sBaseUrl + "/" + oConfig.app.mainURL);
				}.bind(this))
				.fail(function () {
					this.oRouter.getTargets().display("notFound");
				}.bind(this));
		}
	});

});