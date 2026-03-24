const mongoose = require('mongoose');

const User = require('./User');
const Room = require('./Room');
const Contract = require('./Contract');
const Review = require('./Review');
const SavedRoom = require('./SavedRoom');
const Payment = require('./Payment');
const Revenue = require('./Revenue');
const ChatSession = require('./ChatSession');
const Message = require('./Message');
const AIGeneration = require('./AIGeneration');

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
