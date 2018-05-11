const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TransactionSchema = new Schema({
  debtor: [{type: Schema.Types.ObjectId, ref: 'Account'}],
  receiver: [{type: Schema.Types.ObjectId, ref: 'Account'}],
  valueTransaction: {type: Number, required: true},
  dateTransaction: {type: Date, required: true, default: Date.now()}
})

module.exports = mongoose.model('Transaction', TransactionSchema)
