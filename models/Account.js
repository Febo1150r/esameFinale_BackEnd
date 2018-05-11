const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AccountSchema = new Schema({
  name: {type: String, required: true},
  surname: {type: String, required: true},
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  balance: {type: Number, required: true, default: 500},
  transactionInFavor: [{type: Schema.Types.ObjectId, ref: 'Transaction'}],
  transactionPassive: [{type: Schema.Types.ObjectId, ref: 'Transaction'}],
  iban: {type: String, required: true}
})

module.exports = mongoose.model('Account', AccountSchema)
