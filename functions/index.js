const functions = require("firebase-functions");
const { askGemini } = require("./node_logic");

exports.askGemini = functions.https.onRequest(askGemini);
