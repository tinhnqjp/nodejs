'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Law = mongoose.model('Law'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  law;

/**
 * Law routes tests
 */
describe('Law CRUD tests', function () {

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

    // Save a user to the test db and create new law
    user.save()
      .then(function () {
        law = {
          title: 'Law title',
          hourei_nasuta: 'Law hourei_nasuta'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an law if logged in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/laws')
          .send(law)
          .expect(403)
          .end(function (lawSaveErr, lawSaveRes) {
            // Call the assertion callback
            done(lawSaveErr);
          });

      });
  });

  it('should not be able to save an law if not logged in', function (done) {
    agent.post('/api/laws')
      .send(law)
      .expect(403)
      .end(function (lawSaveErr, lawSaveRes) {
        // Call the assertion callback
        done(lawSaveErr);
      });
  });

  it('should not be able to update an law if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/laws')
          .send(law)
          .expect(403)
          .end(function (lawSaveErr, lawSaveRes) {
            // Call the assertion callback
            done(lawSaveErr);
          });
      });
  });

  it('should be able to get a list of laws if not signed in', function (done) {
    // Create new law model instance
    var lawObj = new Law(law);

    // Save the law
    lawObj.save(function () {
      // Request laws
      agent.get('/api/laws')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single law if not signed in', function (done) {
    // Create new law model instance
    var lawObj = new Law(law);

    // Save the law
    lawObj.save(function () {
      agent.get('/api/laws/' + lawObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', law.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single law with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/laws/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Law is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single law which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent law
    agent.get('/api/laws/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No law with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should not be able to delete an law if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/laws')
          .send(law)
          .expect(403)
          .end(function (lawSaveErr, lawSaveRes) {
            // Call the assertion callback
            done(lawSaveErr);
          });
      });
  });

  it('should not be able to delete an law if not signed in', function (done) {
    // Set law user
    law.user = user;

    // Create new law model instance
    var lawObj = new Law(law);

    // Save the law
    lawObj.save(function () {
      // Try deleting law
      agent.delete('/api/laws/' + lawObj._id)
        .expect(403)
        .end(function (lawDeleteErr, lawDeleteRes) {
          // Set message assertion
          (lawDeleteRes.body.message).should.match('User is not authorized');

          // Handle law error error
          done(lawDeleteErr);
        });

    });
  });

  it('should be able to get a single law that has an orphaned user reference', function (done) {
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

          // Save a new law
          agent.post('/api/laws')
            .send(law)
            .expect(200)
            .end(function (lawSaveErr, lawSaveRes) {
              // Handle law save error
              if (lawSaveErr) {
                return done(lawSaveErr);
              }

              // Set assertions on new law
              (lawSaveRes.body.title).should.equal(law.title);
              should.exist(lawSaveRes.body.user);
              should.equal(lawSaveRes.body.user._id, orphanId);

              // force the law to have an orphaned user reference
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

                    // Get the law
                    agent.get('/api/laws/' + lawSaveRes.body._id)
                      .expect(200)
                      .end(function (lawInfoErr, lawInfoRes) {
                        // Handle law error
                        if (lawInfoErr) {
                          return done(lawInfoErr);
                        }

                        // Set assertions
                        (lawInfoRes.body._id).should.equal(lawSaveRes.body._id);
                        (lawInfoRes.body.title).should.equal(law.title);
                        should.equal(lawInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single law if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new law model instance
    var lawObj = new Law(law);

    // Save the law
    lawObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/laws/' + lawObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', law.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single law, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'lawowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Law
    var _lawOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _lawOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Law
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

          // Save a new law
          agent.post('/api/laws')
            .send(law)
            .expect(200)
            .end(function (lawSaveErr, lawSaveRes) {
              // Handle law save error
              if (lawSaveErr) {
                return done(lawSaveErr);
              }

              // Set assertions on new law
              (lawSaveRes.body.title).should.equal(law.title);
              should.exist(lawSaveRes.body.user);
              should.equal(lawSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the law
                  agent.get('/api/laws/' + lawSaveRes.body._id)
                    .expect(200)
                    .end(function (lawInfoErr, lawInfoRes) {
                      // Handle law error
                      if (lawInfoErr) {
                        return done(lawInfoErr);
                      }

                      // Set assertions
                      (lawInfoRes.body._id).should.equal(lawSaveRes.body._id);
                      (lawInfoRes.body.title).should.equal(law.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (lawInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Law.remove().exec()
      .then(User.remove().exec())
      .then(done())
      .catch(done);
  });
});
