const functions = require("firebase-functions");
const { askGemini, predictWaterPrice, createListing, getListings } = require("./node_logic");

exports.askGemini = functions.https.onRequest(askGemini);
exports.predictWaterPrice = functions.https.onRequest(predictWaterPrice);
exports.createListing = functions.https.onRequest(createListing);
exports.getListings = functions.https.onRequest(getListings);
