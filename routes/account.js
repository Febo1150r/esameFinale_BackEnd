var express = require('express')
var router = express.Router()
var bcrypt = require('bcrypt')
var jwt = require('jwt-simple')
var Account = require('../models/Account')
var Transaction = require('../models/Transaction')
var auth = require('../middlewares/auth')
var checks = require('../middlewares/checks')

router.post('/signup', function (req, res) {
  var account = new Account()
  account.name = req.body.name
  account.surname = req.body.surname
  account.email = req.body.email
  account.password = bcrypt.hashSync(req.body.password, 10)
  account.iban = req.body.iban
  account.save(function (err, accountCreated) {
    if (err) return res.status(400).json(err)
    res.status(201).json(accountCreated)
  })
})

router.post('/login', function (req, res) {
  Account.findOne({email: req.body.email}, function (err, account) {
    if (account === null) {
      return res.status(404).json({message: 'account not found', err})
    } else if (bcrypt.compareSync(req.body.password, account.password)) {
      var token = jwt.encode(account._id, auth.secret)
      return res.json({token: token})
    } else {
      return res.status(401).json({message: 'password not valid'})
    }
  })
})

router.get('/me', auth.verify, function (req, res, next) {
  res.json(req.account)
})

router.get('/myTransaction/:id/', auth.verify, function (req, res, next) {
  if (req.query.type === undefined) {
    Account.findOne({_id: req.params.id})
      .populate('transactionInFavor transactionPassive').exec(function (err, account) {
        if (err) return res.status(500).json({error: err})
        if (!account) return res.status(404).json({message: 'account not found'})
        res.json(account)
      })
  } else if (req.query.type === 'send') {
    Account.findOne({_id: req.params.id})
      .populate('transactionPassive').exec(function (err, account) {
        if (err) return res.status(500).json({error: err})
        if (!account) return res.status(404).json({message: 'account not found'})
        res.json(account)
      })
  } else if (req.query.type === 'received') {
    Account.findOne({_id: req.params.id})
      .populate('transactionInFavor').exec(function (err, account) {
        if (err) return res.status(500).json({error: err})
        if (!account) return res.status(404).json({message: 'account not found'})
        res.json(account)
      })
  }
})

router.post('/transaction/:iban', auth.verify, checks.accountVerify, function (req, res, next) {
  var transaction = new Transaction()
  transaction.accountSend = req.account._id
  transaction.accountReceived = req.accountReceived._id
  transaction.valueTransaction = req.body.valueTransaction
  if (req.account.balance >= req.body.valueTransaction) {
    transaction.save(function (err, transactionSaved) {
      if (err) return res.status(500).json({message: err})
      req.account.transactionPassive.push(transactionSaved._id)
      req.account.balance = req.account.balance - req.body.valueTransaction
      req.account.save(function (err, accountSaved) {
        if (err) return res.status(500).json({message: err})
        req.accountReceived.transactionInFavor.push(transactionSaved._id)
        req.accountReceived.balance = req.accountReceived.balance + req.body.valueTransaction
        req.accountReceived.save(function (err, accountReceivedSaved) {
          if (err) return res.status(500).json({message: err})
          res.status(201).json(transactionSaved)
        })
      })
    })
  }
})

module.exports = router
