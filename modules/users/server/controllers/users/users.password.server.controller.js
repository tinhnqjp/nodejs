'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  async = require('async'),
  crypto = require('crypto');


/**
 * Change Password
 */
exports.changePassword = function (req, res, next) {
  // Init Variables
  var passwordDetails = req.body;

  if (req.user) {
    if (passwordDetails.newPassword) {
      User.findById(req.user.id, function (err, user) {
        if (!err && user) {
          if (user.authenticate(passwordDetails.currentPassword)) {
            if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
              user.password = passwordDetails.newPassword;

              user.save(function (err) {
                if (err) {
                  return res.status(422).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                } else {
                  req.login(user, function (err) {
                    if (err) {
                      res.status(400).send(err);
                    } else {
                      res.send({
                        message: 'パスワードの変更が完了しました。'
                      });
                    }
                  });
                }
              });
            } else {
              res.status(422).send({
                message: 'パスワードが一致しません。'
              });
            }
          } else {
            res.status(422).send({
              message: 'パスワードに誤りがあります。'
            });
          }
        } else {
          res.status(400).send({
            message: 'ユーザが見つかりません。'
          });
        }
      });
    } else {
      res.status(422).send({
        message: '新しいスワードを入力してください。'
      });
    }
  } else {
    res.status(401).send({
      message: 'ユーザのログインが必要です。'
    });
  }
};
