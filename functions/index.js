const admin = require("firebase-admin");
admin.initializeApp();

const { onRequest } = require("firebase-functions/v2/https");

const {
  askGemini,
  predictWaterPrice,
  createListing,
  getListings,
  getWaterNearIndustry
} = require("./node_logic/handlers");

exports.askGemini = onRequest(askGemini);
exports.predictWaterPrice = onRequest(predictWaterPrice);
exports.createListing = onRequest(createListing);
exports.getListings = onRequest(getListings);
exports.getWaterNearIndustry = onRequest(getWaterNearIndustry);
