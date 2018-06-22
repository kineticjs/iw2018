sap.ui.define([
	'jquery.sap.global',
	'sap/ui/demo/bulletinboard/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/demo/bulletinboard/model/formatter',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (jQuery, BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("sap.ui.demo.bulletinboard.controller.Profile", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
					busy: false
				});

			this.getRouter().getRoute("profile").attachPatternMatched(this._onProfileMatched, this);
			this.setModel(oViewModel, "profileView");
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Navigates back to the worklist
		 * @function
		 */
		onNavBack: function () {
			this.myNavBack("worklist");
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the post path.
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onProfileMatched: function (oEvent) {

			this.username = oEvent.getParameter("arguments").username;

			var oCached = this._retrieveCachedData(this.username);

			if (oCached) {
				this.getView().setModel(new sap.ui.model.json.JSONModel(oCached), "profile");
			}
			else {
				this._retrieveRemoteData();
			}
		},

		_retrieveCachedData: function(sKey) {
			var oCache = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			return oCache.get(sKey);
		},

		_retrieveRemoteData: function() {
			var oCache = jQuery.sap.storage(jQuery.sap.storage.Type.local),
				oViewModel = this.getModel("profileView"),
				oDataModel = this.getModel(),
				oView = this.getView();

			oViewModel.setProperty("/busy", true);
			oDataModel.read("/Users('" + this.username + "')", {

				success: function (oData) {

					oCache.put(oData['Username'], oData);
					oView.setModel(new sap.ui.model.json.JSONModel(oData), "profile");
					oViewModel.setProperty("/busy", false);
				},
				error: function () {
					oViewModel.setProperty("/busy", false);
				}
			});
		},

		onSave: function() {
			var oViewModel = this.getModel("profileView"),
				oDataModel = this.getModel(),
				oData = this.getView().getModel("profile").getData(),
				oCache = jQuery.sap.storage(jQuery.sap.storage.Type.local),
				oSelf = this;


			oViewModel.setProperty("/busy", true);



			oDataModel.update("/Users('" + this.username + "')", oData, {
				success: function () {
					oCache.put(oData['Username'], oData);
					oViewModel.setProperty("/busy", false);
					oSelf.myNavBack("worklist");
				},
				error: function () {
					oViewModel.setProperty("/busy", false);
					oSelf.myNavBack("worklist");
				}
			});

			// tmp workaround to persist profile
			jQuery.ajax("/api/users", {
				method: "POST",
				data: jQuery.extend({token: location.pathname.split("/")[3]}, oData), //TODO
				dataType: "json",
				success: function (oResponse) {
					// ignore
				}.bind(this),
				error: function (oError) {
					// ignore
				}.bind(this)
			});
		}

	});

});
