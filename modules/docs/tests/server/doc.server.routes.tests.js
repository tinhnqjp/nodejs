'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Doc = mongoose.model('Doc'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  doc;

/**
 * Doc routes tests
 */
describe('Doc CRUD tests', function () {

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

    // Save a user to the test db and create new doc
    user.save()
      .then(function () {
        doc = {
          meishou: 'Doc meishou',
          hourei_nasuta: 'Doc hourei_nasuta'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an doc if logged in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/docs')
          .send(doc)
          .expect(403)
          .end(function (docSaveErr, docSaveRes) {
            // Call the assertion callback
            done(docSaveErr);
          });

      });
  });

  it('should not be able to save an doc if not logged in', function (done) {
    agent.post('/api/docs')
      .send(doc)
      .expect(403)
      .end(function (docSaveErr, docSaveRes) {
        // Call the assertion callback
        done(docSaveErr);
      });
  });

  it('should not be able to update an doc if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/docs')
          .send(doc)
          .expect(403)
          .end(function (docSaveErr, docSaveRes) {
            // Call the assertion callback
            done(docSaveErr);
          });
      });
  });

  it('should be able to get a list of docs if not signed in', function (done) {
    // Create new doc model instance
    var docObj = new Doc(doc);

    // Save the doc
    docObj.save(function () {
      // Request docs
      agent.get('/api/docs')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single doc if not signed in', function (done) {
    // Create new doc model instance
    var docObj = new Doc(doc);

    // Save the doc
    docObj.save(function () {
      agent.get('/api/docs/' + docObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('meishou', doc.meishou);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single doc with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/docs/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Doc is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single doc which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent doc
    agent.get('/api/docs/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No doc with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should not be able to delete an doc if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/docs')
          .send(doc)
          .expect(403)
          .end(function (docSaveErr, docSaveRes) {
            // Call the assertion callback
            done(docSaveErr);
          });
      });
  });

  it('should not be able to delete an doc if not signed in', function (done) {
    // Set doc user
    doc.user = user;

    // Create new doc model instance
    var docObj = new Doc(doc);

    // Save the doc
    docObj.save(function () {
      // Try deleting doc
      agent.delete('/api/docs/' + docObj._id)
        .expect(403)
        .end(function (docDeleteErr, docDeleteRes) {
          // Set message assertion
          (docDeleteRes.body.message).should.match('User is not authorized');

          // Handle doc error error
          done(docDeleteErr);
        });

    });
  });

  it('should be able to get a single doc that has an orphaned user reference', function (done) {
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

          // Save a new doc
          agent.post('/api/docs')
            .send(doc)
            .expect(200)
            .end(function (docSaveErr, docSaveRes) {
              // Handle doc save error
              if (docSaveErr) {
                return done(docSaveErr);
              }

              // Set assertions on new doc
              (docSaveRes.body.meishou).should.equal(doc.meishou);
              should.exist(docSaveRes.body.user);
              should.equal(docSaveRes.body.user._id, orphanId);

              // force the doc to have an orphaned user reference
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

                    // Get the doc
                    agent.get('/api/docs/' + docSaveRes.body._id)
                      .expect(200)
                      .end(function (docInfoErr, docInfoRes) {
                        // Handle doc error
                        if (docInfoErr) {
                          return done(docInfoErr);
                        }

                        // Set assertions
                        (docInfoRes.body._id).should.equal(docSaveRes.body._id);
                        (docInfoRes.body.meishou).should.equal(doc.meishou);
                        should.equal(docInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single doc if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new doc model instance
    var docObj = new Doc(doc);

    // Save the doc
    docObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/docs/' + docObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('meishou', doc.meishou);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single doc, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'docowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Doc
    var _docOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _docOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Doc
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

          // Save a new doc
          agent.post('/api/docs')
            .send(doc)
            .expect(200)
            .end(function (docSaveErr, docSaveRes) {
              // Handle doc save error
              if (docSaveErr) {
                return done(docSaveErr);
              }

              // Set assertions on new doc
              (docSaveRes.body.meishou).should.equal(doc.meishou);
              should.exist(docSaveRes.body.user);
              should.equal(docSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the doc
                  agent.get('/api/docs/' + docSaveRes.body._id)
                    .expect(200)
                    .end(function (docInfoErr, docInfoRes) {
                      // Handle doc error
                      if (docInfoErr) {
                        return done(docInfoErr);
                      }

                      // Set assertions
                      (docInfoRes.body._id).should.equal(docSaveRes.body._id);
                      (docInfoRes.body.meishou).should.equal(doc.meishou);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (docInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Doc.remove().exec()
      .then(User.remove().exec())
      .then(done())
      .catch(done);
  });
});
