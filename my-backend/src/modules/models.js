const mongoose = require('mongoose');

const User = require("./user/User.js");
const Room = require("./room/Room.js");
const Contract = require("./contract/Contract.js");
const Review = require("./review/Review.js");
const SavedRoom = require("./room/SavedRoom.js");
const Payment = require("./payment/Payment.js");
const Revenue = require("./payment/Revenue.js");
const ChatSession = require("./chatbot/ChatSession.js");
const Message = require("./chatbot/Message.js");
const AIGeneration = require("./ai/AIGeneration.js");

module.exports = {
  User,
  Room,
  Contract,
  Review,
  SavedRoom,
  Payment,
  Revenue,
  ChatSession,
  Message,
  AIGeneration
};
