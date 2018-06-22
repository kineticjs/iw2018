/*global history*/

sap.ui.define([
	'jquery.sap.global',
	'sap/ui/demo/bulletinboard/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/demo/bulletinboard/model/formatter',
	'sap/ui/demo/bulletinboard/model/FlaggedType',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (jQuery, BaseController, JSONModel, formatter, FlaggedType, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("sap.ui.demo.bulletinboard.controller.Create", {
		types : {
			flagged: new FlaggedType()
		},

		formatter: formatter,

		onSave: function() {

			var oModel = this.getModel(),
				iIndex = new Date().getTime(),
				sId = "PostID_" + iIndex,
				sTitle = this.getView().byId("title").getValue(),
				sDescription = this.getView().byId("description").getValue(),
				iPrice = this.getView().byId("price").getValue();
			sDescription = "<p>" + sDescription + "</p>";

			if (sTitle && sDescription && iPrice) {
				oModel.createEntry("/Posts", {properties: {"PostID": sId,
					"Title": sTitle,
					"Timestamp": "/Date(" + iIndex + ")/",
					"Description": sDescription,
					"Category": "Miscellaneous",
					"Contact": "contact.me07@gmail.com",
					"Currency": "USD",
					"Price": iPrice,
					"Flagged": 0,
					"Recommended": 0,
					"Recommendations": 1}, batchGroupId: sId});

				// tmp workaround to persist posts
				jQuery.ajax("/api/posts", {
					method: "POST",
					data: {
						token: location.pathname.split("/")[3], //TODO
						"PostID": sId,
						"Title": sTitle,
						"Description": sDescription,
						"Price": iPrice,
						"Timestamp": "/Date(" + iIndex + ")/"
					},
					dataType: "json",
					success: function (oResponse) {
						// ignore
					}.bind(this),
					error: function (oError) {
						// ignore
					}.bind(this)
				});

				this.toListView();
			}
		},

		onCancel: function() {
			this.toListView();
		},
		onNavBack: function() {
			this.toListView();
		},

		toListView: function() {
			this.myNavBack("searchWorklist", {
				query: {
					searchTerm : ""
				}
			});
		}
	});

});
