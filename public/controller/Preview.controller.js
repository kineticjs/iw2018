sap.ui.define([
	"sap/ui/innoweek/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/Label",
	"sap/ui/core/HTML",
	"sap/m/FormattedText",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, SimpleForm, Label, HTML, FormattedText, MessageBox) {
"use strict";

	return BaseController.extend("sap.ui.innoweek.controller.Preview", {
		onInit: function () {
			this.oRouter = this.getRouter();
			this.oRouter.getRoute("tasksWithToken").attachMatched(this._onTokenRouteMatched, this);
			this.oModel = new JSONModel();
			this.oView = this.getView();
			this.oView.setModel(this.oModel);
		},
		_onTokenRouteMatched: function (oEvent) {
			this.sToken = oEvent.getParameter("arguments").token;

			this._updateContent();
		},
		_updateContent: function () {
			var sBaseUrl = window.location.origin + "/resources/token_applications/" + this.sToken + "/",
				oData;

			jQuery.get(sBaseUrl + "config.json")
				.done(function (oConfig) {
					oData = oConfig;

					oData.baseUrl = sBaseUrl;
					oData.token = this.sToken;

					// Modify data
					oData.taskDescription = "<div>" + this._correctHREFs(oConfig.task) + "</div>";

					jQuery.ajax("/api/getScore/" + this.sToken, {
						dataType: "json",
						success: function (oResponse) {
							// Current score
							oData.currentScore = oResponse.score;

							oData.scoreState = "None";
							if (oResponse.score < 0) {
								oData.scoreState = "Error";
							} else if (oResponse.score > 0 && oResponse.score < oData.score.success) {
								oData.scoreState = "Warning";
							} else if (oResponse.score === oData.score.success) {
								oData.scoreState = "Success";
							}

							// Hints
							if (oResponse.hints > 0) {
								oData.hintsList = [];

								for (var i = 0, iLen = oResponse.hints; i < iLen; i++) {
									if (oData.hints[i]) {
										oData.hintsList.push({content: "<div class='hint'>" + oData.hints[i] + "</div>"})
									}
								}
							}

							// Answer
							oData.bAnswerButtonEnabled = true;
							if (oResponse.showAnswer || oResponse.success) {
								oData.answerContent = "<div>" + this._correctHREFs(oData.answer) + "</div>";
								oData.bAnswerButtonEnabled = false;
							}

							// Hint button availability
							oData.bHintButtonStatus = oResponse.hints < oData.hints.length;

							// Success
							oData.bSuccess = oResponse.success;

							// Update the model
							this.oModel.setData(oData);
						}.bind(this),
						error: function (oError) {
							console.log(oError);
						}
					});
				}.bind(this))
				.fail(function () {
					this.getRouter().getTargets().display("notFound");
				}.bind(this));
		},
		handleHintRequest: function () {
			jQuery.ajax("/api/requestHint/" + this.sToken, {
				dataType: "json",
				success: function (oData) {
					this._updateContent();
				}.bind(this)
			});
		},
		handleRequestAnswer: function () {
			jQuery.ajax("/api/requestAnswer/" + this.sToken, {
				dataType: "json",
				success: function (oData) {
					this._updateContent();
				}.bind(this)
			});
		},
		onEdit: function (oEvent) {
			this.oRouter.navTo("edit", {
				token: this.sToken
			});
		},
		onNavBack: function (oEvent) {
			this.oRouter.navTo("tasks", {
				taskCategory: "security"
			});
		},
		onTest: function (oEvent) {
			var oModel = this.getView().getModel(),
				sTestViewUrl = oModel.getProperty("/app/testURL") || oModel.getProperty("/app/mainURL"),
				sBaseUrl = oModel.getProperty("/baseUrl"),
				oUrl = new window.URL(sTestViewUrl, sBaseUrl),
				oFrame = document.createElement("IFRAME"),
				oStyle = oFrame.style,
				that = this;

			oFrame.id = "sap-ui-TestFrame";
			oFrame.src = oUrl;

			oStyle.position = "absolute";
			oStyle.left = "-10000px";
			oStyle.top = "-10000px";
			oStyle.zIndex = "-1000";

			this.getView().setBusy(true);

			document.body.appendChild(oFrame);

			jQuery.when(
				jQuery(oFrame.contentWindow.document).ready(),
				jQuery.getScript(sBaseUrl + "test.js")
			).done(function () {
				//setTimeout(function () {
					window.oTestObject.fix().then(function(bResult) {
						oFrame.parentNode.removeChild(oFrame);
						that.getView().setBusy(false);

						if (bResult) {

							jQuery.ajax("/api/recordSuccess/" + this.sToken, {
								dataType: "json",
								success: function (oData) {
									MessageBox.success("Test passed!");
									this._updateContent();
								}.bind(this)
							});

						} else {
							MessageBox.error("Test failed!");
						}
					}.bind(this));
					
				//}.bind(this), 2000);
			}.bind(this));
		},
		onOpen: function (oEvent) {
			var oModel = this.getView().getModel(),
				sAppUrl = oModel.getProperty("/app/mainURL"),
				oUrl = new window.URL(sAppUrl, oModel.getProperty("/baseUrl"));

			window.open(oUrl, oModel.getProperty("/token")/* , "height=800,width=1400" */);
		},
		_correctHREFs: function (sContent) {
			// Handle image tags
			sContent = sContent.replace(/src=['"](\S*?)['"]/g, function (sMatch, sContent) {
				if (sContent !== "" && sContent.indexOf("http") !== 0) {
					return 'src="/resources/token_applications/' + this.sToken + '/' + sContent + '"';
				}
			}.bind(this));

			// Handle links tags
			sContent = sContent.replace(/href=['"](\S*?)['"]/g, function (sMatch, sContent) {
				if (sContent !== "" && (sContent.indexOf("http") !== 0) && (sContent.indexOf("data") !== 0)) {
					return 'href="/resources/token_applications/' + this.sToken + '/' + sContent + '"';
				}
				return 'href="' + sContent + '"';
			}.bind(this));

			return sContent;
		},
		_createContent: function (oConfig) {
			var aHints = oConfig.hints,
				i = 0,
				oForm;

			oForm = new SimpleForm({
				editable: true,
				layout: "ResponsiveGridLayout"
			});
			oForm.addContent(new Label({ text: "Task"}));
			oForm.addContent(new HTML({ content: this._correctHREFs(oConfig.task)}));

			// if (aHints.length) {
			// 	aHints.forEach(function(sHint) {
			// 		oForm.addContent(new Label({ text: "Hint " + ++i}));
			// 		oForm.addContent(new FormattedText({ htmlText: this._correctHREFs(sHint)}));
			// 	}.bind(this));
			// }

			// oForm.addContent(new Label({ text: "Answer"}));
			// oForm.addContent(new HTML({ content: this._correctHREFs(oConfig.answer)}));

			return oForm;
		}
	});
});