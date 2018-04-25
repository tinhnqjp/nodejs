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
 * Mention Schema
 */
var MentionSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    trim: true,
    required: '名称が入力されていません。'
  },
  contents: [{
    clause: { type: String, trim: true },
    headline: { type: String, trim: true },
    time1_check: { type: Boolean, default: false },
    time2_check: { type: Boolean, default: false },
    final_check: { type: Boolean, default: false }
  }]
});

MentionSchema.statics.seed = seed;

mongoose.model('Mention', MentionSchema);

/**
* Seeds the User collection with mentionument (Mention)
* and provided options.
*/
function seed(mentionx, options) {
  var Mention = mongoose.model('Mention');

  return new Promise(function (resolve, reject) {

    skipMentionument()
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

            mentionx.user = admin;

            return resolve();
          });
      });
    }

    function skipMentionument() {
      return new Promise(function (resolve, reject) {
        Mention
          .findOne({
            meishou: mentionx.title
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

            // Remove Mention (overwrite)

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
            message: chalk.yellow('Database Seeding: Mention\t' + mentionx.title + ' skipped')
          });
        }

        var mention = new Mention(mentionx);

        mention.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Mention\t' + mention.meishou + ' added'
          });
        });
      });
    }
  });
}
