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
describe('Doc Admin CRUD tests', function () {
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
      roles: ['user', 'admin'],
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

  it('should be able to save an doc if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new doc
        agent.post('/api/docs')
          .send(doc)
          .expect(200)
          .end(function (docSaveErr, docSaveRes) {
            // Handle doc save error
            if (docSaveErr) {
              return done(docSaveErr);
            }

            // Get a list of docs
            agent.get('/api/docs')
              .end(function (docsGetErr, docsGetRes) {
                // Handle doc save error
                if (docsGetErr) {
                  return done(docsGetErr);
                }

                // Get docs list
                var docs = docsGetRes.body;

                // Set assertions
                (docs[0].user._id).should.equal(userId);
                (docs[0].meishou).should.match('Doc meishou');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to update an doc if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new doc
        agent.post('/api/docs')
          .send(doc)
          .expect(200)
          .end(function (docSaveErr, docSaveRes) {
            // Handle doc save error
            if (docSaveErr) {
              return done(docSaveErr);
            }

            // Update doc meishou
            doc.meishou = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing doc
            agent.put('/api/docs/' + docSaveRes.body._id)
              .send(doc)
              .expect(200)
              .end(function (docUpdateErr, docUpdateRes) {
                // Handle doc update error
                if (docUpdateErr) {
                  return done(docUpdateErr);
                }

                // Set assertions
                (docUpdateRes.body._id).should.equal(docSaveRes.body._id);
                (docUpdateRes.body.meishou).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an doc if no meishou is provided', function (done) {
    // Invalidate meishou field
    doc.meishou = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new doc
        agent.post('/api/docs')
          .send(doc)
          .expect(422)
          .end(function (docSaveErr, docSaveRes) {
            // Set message assertion
            (docSaveRes.body.message).should.match('meishou cannot be blank');

            // Handle doc save error
            done(docSaveErr);
          });
      });
  });

  it('should be able to delete an doc if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new doc
        agent.post('/api/docs')
          .send(doc)
          .expect(200)
          .end(function (docSaveErr, docSaveRes) {
            // Handle doc save error
            if (docSaveErr) {
              return done(docSaveErr);
            }

            // Delete an existing doc
            agent.delete('/api/docs/' + docSaveRes.body._id)
              .send(doc)
              .expect(200)
              .end(function (docDeleteErr, docDeleteRes) {
                // Handle doc error error
                if (docDeleteErr) {
                  return done(docDeleteErr);
                }

                // Set assertions
                (docDeleteRes.body._id).should.equal(docSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single doc if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new doc model instance
    doc.user = user;
    var docObj = new Doc(doc);

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new doc
        agent.post('/api/docs')
          .send(doc)
          .expect(200)
          .end(function (docSaveErr, docSaveRes) {
            // Handle doc save error
            if (docSaveErr) {
              return done(docSaveErr);
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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                (docInfoRes.body.isCurrentUserOwner).should.equal(true);

                // Call the assertion callback
                done();
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
