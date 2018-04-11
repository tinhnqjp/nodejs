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
 * Doc Schema
 */
var DocSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  form1_ro: [],
  form1_ha: [],
  form1_item: [],
  form4_ro: [],
  form4_ha: [],
  form4_item: [],
  property: {
    type: Schema.ObjectId,
    ref: 'Property'
  }
});

DocSchema.statics.seed = seed;

mongoose.model('Doc', DocSchema);

/**
* Seeds the User collection with document (Doc)
* and provided options.
*/
function seed(docx, options) {
  var Doc = mongoose.model('Doc');

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

            docx.user = admin;

            return resolve();
          });
      });
    }

    function skipDocument() {
      return new Promise(function (resolve, reject) {
        Doc
          .findOne({
            meishou: docx.title
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

            // Remove Doc (overwrite)

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
            message: chalk.yellow('Database Seeding: Doc\t' + docx.title + ' skipped')
          });
        }

        var doc = new Doc(docx);

        doc.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Doc\t' + doc.meishou + ' added'
          });
        });
      });
    }
  });
}
