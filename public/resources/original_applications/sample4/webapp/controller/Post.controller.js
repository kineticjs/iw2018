sap.ui.define([
	'jquery.sap.global',
	'sap/ui/demo/bulletinboard/controller/BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/demo/bulletinboard/model/formatter',
	'sap/ui/demo/bulletinboard/model/RecommendedType',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (jQuery, BaseController, JSONModel, formatter, RecommendedType, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("sap.ui.demo.bulletinboard.controller.Post", {
		types : {
			recommended: new RecommendedType()
		},

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
					busy: false,
					commentsBusy: false
				});

			this.getRouter().getRoute("post").attachPatternMatched(this._onPostMatched, this);
			this.setModel(oViewModel, "postView");

			//this.getView().byId("recommendButton").addStyleClass("bluebg");
			//this.getView().byId("privateMgsButton").addStyleClass("bluebg");
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Navigates back to the worklist
		 * @function
		 */
		onNavBack: function () {
			this.myNavBack("searchWorklist", {
                query: {
                    searchTerm : ""
                }
            });
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
		_onPostMatched: function (oEvent) {
			var oViewModel = this.getModel("postView"),
				oDataModel = this.getModel();

			this.postId = oEvent.getParameter("arguments").postId;


			/*
			 retrieve data for the post entry
			 */
			oViewModel.setProperty("/busy", true);

			this.getView().bindElement({
				path: "/Posts('" + this.postId + "')"
			});


			/*
			 retrieve data for the post comments
			 */
			var aFilter = [];
			aFilter.push(new Filter("PostID", FilterOperator.EQ, this.postId));

			// filter binding
			var oList = this.getView().byId("commentsList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

			this.getView().byId("userDetails").bindElement({
			 path: "/Users('gamer')"
			});
		},

		onCreateComment: function() {
			var oModel = this.getView().byId("commentsList").getModel(),
				iIndex = new Date().getTime(),
				sId = "CommentID_" + iIndex,
				sText = this.getView().byId("feedInput").getValue();

			oModel.createEntry("/Comments", {properties: {
				"CommentID": sId,
				"PostID": this.postId,
				"Text": "<span>" + sText +"</span>"
			}, batchGroupId: sId});
		},

		onCommentsUpdateFinished: function (oEvent) {
			this.getModel("postView").setProperty("/busy", false);
		},

		onProfilePress: function() {
			this.getRouter().navTo("profile", {
				username: "gamer"
			});
		},

		onRecommend: function() {
			var oDataModel = this.getModel(),
				oContext = this.getView().getBindingContext();
			oDataModel.setProperty("Recommended", 1, oContext);

			var iRecommendedtions = oDataModel.getProperty("Recommendations", oContext);
			iRecommendedtions += 1;
			oDataModel.setProperty("Recommendations", iRecommendedtions, oContext)
		},

		onPrivateMessagePress: function() {

			this.getDialog().open();

		},

		getDialog: function() {
			if (!this._oMessageDialog) {
				var oTxt = new sap.m.TextArea("privateMessageTxt",
					{width: "100%"}),
					onClose = function() {
						oTxt.setValue("");
						this.getParent().close();
					};

				this._oMessageDialog = new sap.m.Dialog({
					title: "Private inquiry",
					beginButton: new sap.m.Button({
						text: "Cancel", press: onClose
					}),
					endButton: new sap.m.Button("sendButton", {
						text: "Send", press: onClose
					})
				});
				this._oMessageDialog.addContent(oTxt);
			}
			return this._oMessageDialog;
		}

	});

});
