sap.ui.define([
		"sap/ui/innoweek/controller/BaseController"
	], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.innoweek.controller.Home", {
		onPress: function (oEvent) {
			var oBindContext = oEvent.getSource().getBindingContext("tiles"),
				sPath = oBindContext.getPath(),
				oModel = oBindContext.getModel(),
				sCategory = oModel.getProperty(sPath + "/category");

			this.getRouter().navTo("tasks", {
				taskCategory: sCategory
			});
		},
		onNavBack: function (oEvent) {
			this.oRouter.navTo("home");
		}
	});
});