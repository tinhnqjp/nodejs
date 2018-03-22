'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  chalk = require('chalk');

/**
 * Law Schema
 */
var LawSchema = new Schema({
  year: {
    type: Number,
    required: '年度が選択されていません。'
  },
  name: {
    type: String,
    trim: true,
    required: '名称が入力されていません。'
  },
  created: {
    type: Date,
    default: Date.now
  },
  law_details: {
    type: Schema.ObjectId, ref: 'LawDetail'
  },
  todoufuken_regulations: {
    type: Schema.ObjectId, ref: 'LawRegulation'
  }
});

LawSchema.statics.seed = seed;

mongoose.model('Law', LawSchema);

/**
* Seeds the User collection with lawument (Law)
* and provided options.
*/
function seed(doc, options) {
  var Law = mongoose.model('Law');

  return new Promise(function (resolve, reject) {

    skipDocument()
      .then(findAdminUser)
      .then(add)
      .then(function (response) {
        return resolve(response);
      })
      .catch(function (err) {
        return reject(err);
      });

    function findAdminUser(skip) {
      var User = mongoose.model('User');

      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve(true);
        }

        User
          .findOne({
            roles: { $in: ['admin'] }
          })
          .exec(function (err, admin) {
            if (err) {
              return reject(err);
            }

            doc.user = admin;

            return resolve();
          });
      });
    }

    function skipDocument() {
      return new Promise(function (resolve, reject) {
        Law
          .findOne({
            title: doc.title
          })
          .exec(function (err, existing) {
            if (err) {
              return reject(err);
            }

            if (!existing) {
              return resolve(false);
            }

            if (existing && !options.overwrite) {
              return resolve(true);
            }

            // Remove Law (overwrite)

            existing.remove(function (err) {
              if (err) {
                return reject(err);
              }

              return resolve(false);
            });
          });
      });
    }

    function add(skip) {
      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve({
            message: chalk.yellow('Database Seeding: Law\t' + doc.title + ' skipped')
          });
        }

        var law = new Law(doc);

        law.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Law\t' + law.title + ' added'
          });
        });
      });
    }
  });
}
