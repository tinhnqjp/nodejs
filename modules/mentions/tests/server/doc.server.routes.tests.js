'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Mention = mongoose.model('Mention'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  mention;

/**
 * Mention routes tests
 */
describe('Mention CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose.connection.db);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      usernameOrEmail: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.usernameOrEmail,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new mention
    user.save()
      .then(function () {
        mention = {
          meishou: 'Mention meishou',
          hourei_nasuta: 'Mention hourei_nasuta'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an mention if logged in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/mentions')
          .send(mention)
          .expect(403)
          .end(function (mentionSaveErr, mentionSaveRes) {
            // Call the assertion callback
            done(mentionSaveErr);
          });

      });
  });

  it('should not be able to save an mention if not logged in', function (done) {
    agent.post('/api/mentions')
      .send(mention)
      .expect(403)
      .end(function (mentionSaveErr, mentionSaveRes) {
        // Call the assertion callback
        done(mentionSaveErr);
      });
  });

  it('should not be able to update an mention if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/mentions')
          .send(mention)
          .expect(403)
          .end(function (mentionSaveErr, mentionSaveRes) {
            // Call the assertion callback
            done(mentionSaveErr);
          });
      });
  });

  it('should be able to get a list of mentions if not signed in', function (done) {
    // Create new mention model instance
    var mentionObj = new Mention(mention);

    // Save the mention
    mentionObj.save(function () {
      // Request mentions
      agent.get('/api/mentions')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single mention if not signed in', function (done) {
    // Create new mention model instance
    var mentionObj = new Mention(mention);

    // Save the mention
    mentionObj.save(function () {
      agent.get('/api/mentions/' + mentionObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('meishou', mention.meishou);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single mention with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/mentions/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Mention is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single mention which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent mention
    agent.get('/api/mentions/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No mention with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should not be able to delete an mention if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/mentions')
          .send(mention)
          .expect(403)
          .end(function (mentionSaveErr, mentionSaveRes) {
            // Call the assertion callback
            done(mentionSaveErr);
          });
      });
  });

  it('should not be able to delete an mention if not signed in', function (done) {
    // Set mention user
    mention.user = user;

    // Create new mention model instance
    var mentionObj = new Mention(mention);

    // Save the mention
    mentionObj.save(function () {
      // Try deleting mention
      agent.delete('/api/mentions/' + mentionObj._id)
        .expect(403)
        .end(function (mentionDeleteErr, mentionDeleteRes) {
          // Set message assertion
          (mentionDeleteRes.body.message).should.match('User is not authorized');

          // Handle mention error error
          done(mentionDeleteErr);
        });

    });
  });

  it('should be able to get a single mention that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      usernameOrEmail: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin']
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new mention
          agent.post('/api/mentions')
            .send(mention)
            .expect(200)
            .end(function (mentionSaveErr, mentionSaveRes) {
              // Handle mention save error
              if (mentionSaveErr) {
                return done(mentionSaveErr);
              }

              // Set assertions on new mention
              (mentionSaveRes.body.meishou).should.equal(mention.meishou);
              should.exist(mentionSaveRes.body.user);
              should.equal(mentionSaveRes.body.user._id, orphanId);

              // force the mention to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the mention
                    agent.get('/api/mentions/' + mentionSaveRes.body._id)
                      .expect(200)
                      .end(function (mentionInfoErr, mentionInfoRes) {
                        // Handle mention error
                        if (mentionInfoErr) {
                          return done(mentionInfoErr);
                        }

                        // Set assertions
                        (mentionInfoRes.body._id).should.equal(mentionSaveRes.body._id);
                        (mentionInfoRes.body.meishou).should.equal(mention.meishou);
                        should.equal(mentionInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single mention if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new mention model instance
    var mentionObj = new Mention(mention);

    // Save the mention
    mentionObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/mentions/' + mentionObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('meishou', mention.meishou);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single mention, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'mentionowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Mention
    var _mentionOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _mentionOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Mention
      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = _user._id;

          // Save a new mention
          agent.post('/api/mentions')
            .send(mention)
            .expect(200)
            .end(function (mentionSaveErr, mentionSaveRes) {
              // Handle mention save error
              if (mentionSaveErr) {
                return done(mentionSaveErr);
              }

              // Set assertions on new mention
              (mentionSaveRes.body.meishou).should.equal(mention.meishou);
              should.exist(mentionSaveRes.body.user);
              should.equal(mentionSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the mention
                  agent.get('/api/mentions/' + mentionSaveRes.body._id)
                    .expect(200)
                    .end(function (mentionInfoErr, mentionInfoRes) {
                      // Handle mention error
                      if (mentionInfoErr) {
                        return done(mentionInfoErr);
                      }

                      // Set assertions
                      (mentionInfoRes.body._id).should.equal(mentionSaveRes.body._id);
                      (mentionInfoRes.body.meishou).should.equal(mention.meishou);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (mentionInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
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
