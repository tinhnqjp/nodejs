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
    required: 'cannot be blank'
  },
  name: {
    type: String,
    trim: true,
    required: 'name cannot be blank'
  },
  created: {
    type: Date,
    default: Date.now
  },
  law_details: [
    {
      type: Schema.ObjectId, ref: 'LawDetail'
    }
  ],
  todoufuken_regulations: [
    {
      todoufuken: {
        type: String,
        enum: [
          '北海道',
          '青森県',
          '岩手県',
          '宮城県',
          '秋田県',
          '山形県',
          '福島県',
          '茨城県',
          '栃木県',
          '群馬県',
          '埼玉県',
          '千葉県',
          '東京都',
          '神奈川県',
          '新潟県',
          '富山県',
          '石川県',
          '福井県',
          '山梨県',
          '長野県',
          '岐阜県',
          '静岡県',
          '愛知県',
          '三重県',
          '滋賀県',
          '京都府',
          '大阪府',
          '兵庫県',
          '奈良県',
          '和歌山県',
          '鳥取県',
          '島根県',
          '岡山県',
          '広島県',
          '山口県',
          '徳島県',
          '香川県',
          '愛媛県',
          '高知県',
          '福岡県',
          '佐賀県',
          '長崎県',
          '熊本県',
          '大分県',
          '宮崎県',
          '鹿児島県',
          '沖縄県'
        ]
      },
      law_regulations: [{
        type: Schema.ObjectId, ref: 'LawRegulation'
      }]
    }
  ]
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
