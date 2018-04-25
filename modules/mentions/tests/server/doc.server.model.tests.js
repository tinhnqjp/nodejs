'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Mention = mongoose.model('Mention');

/**
 * Globals
 */
var user,
  mention;

/**
 * Unit tests
 */
describe('Mention Model Unit Tests:', function () {

  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3',
      provider: 'local'
    });

    user.save()
      .then(function () {
        mention = new Mention({
          meishou: 'Mention meishou',
          hourei_nasuta: 'Mention hourei_nasuta',
          user: user
        });

        done();
      })
      .catch(done);
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(10000);
      mention.save(function (err) {
        should.not.exist(err);
        return done();
      });
    });

    it('should be able to show an error when try to save without meishou', function (done) {
      mention.meishou = '';

      mention.save(function (err) {
        should.exist(err);
        return done();
      });
    });
  });

  afterEach(function (done) {
    Mention.remove().exec()
      .then(User.remove().exec())
      .then(done())
      .catch(done);
  });
});
