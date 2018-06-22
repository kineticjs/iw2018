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

	return BaseController.extend("sap.ui.demo.bulletinboard.controller.Search", {
		types : {
			flagged: new FlaggedType()
		},

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var oViewModel;


			// Model used to manipulate control states
			oViewModel = new JSONModel({
				searchTerm: ""
			});
			this.setModel(oViewModel, "searchView");

			//this.getRouter().getRoute("search").attachPatternMatched(this._onSearchMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onFilterItems: function(oEvent) {
			var sSearchTerm = oEvent.getParameter("query");
			this.getRouter().navTo("searchWorklist", {
				query: {
					searchTerm : sSearchTerm
				}
			});
		}
	});

});
