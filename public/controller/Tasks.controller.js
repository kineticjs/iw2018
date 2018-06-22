sap.ui.define([
	"sap/ui/innoweek/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, Filter, FilterOperator) {
"use strict";

return BaseController.extend("sap.ui.innoweek.controller.Tasks", {
	onInit: function () {
		var oRouter = this.getRouter();
		oRouter.getRoute("tasks").attachMatched(this._onTaskRouteMatched, this);
	},
	_onTaskRouteMatched: function (oEvent) {
		var oArgs, oView;
		oArgs = oEvent.getParameter("arguments");
		oView = this.getView();

		function filterCategory(sCategory) {
			var sControlId = sCategory.toLowerCase() + "Tasks";
			var oList = oView.byId(sControlId);
				if (oList) {
					oList.getBinding("items").filter([new Filter("category", FilterOperator.Contains, sCategory)])
				}
		}

		// Hard-code for simplicity
		if (oArgs.taskCategory === "security") {
			var oModel = new JSONModel("api/tasks");
			oModel.attachRequestCompleted(function () {
				oView.setModel(oModel);
				// Hard-code for simplicity
				filterCategory("URL");
				filterCategory("Clickjacking");
				filterCategory("XSS");
			});
			
		} else {
			this.getRouter().getTargets().display("notFound");
		}
	},
	onPress: function (oEvent) {
		var oSource = oEvent.getSource(),
			oBindingContext = oSource.getBindingContext();

		jQuery.get("api/openApp/" + oBindingContext.getProperty("id"))
			.done(function (sData) {
				var oData = sData && JSON.parse(sData);

				if (oData && oData.success) {
					this.getRouter().navTo("tasksWithToken", {
						token: oData.token
					});
				}
			}.bind(this));
	}
});
});