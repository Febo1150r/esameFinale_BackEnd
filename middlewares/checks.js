var Account = require('../models/Account')

var accountVerify = function (req, res, next) {
  Account.findOne({iban: req.params.iban}).exec(function (err, accountReceived) {
    if (err) return res.status(500).json({message: err})
    if (!accountReceived) return res.status(404).json({message: 'Account not found'})
    req.accountReceived = accountReceived
    next()
  })
}

module.exports.accountVerify = accountVerify
