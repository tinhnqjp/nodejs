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
describe('Law Admin CRUD tests', function () {
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

  it('should be able to save an law if logged in', function (done) {
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

        // Save a new law
        agent.post('/api/laws')
          .send(law)
          .expect(200)
          .end(function (lawSaveErr, lawSaveRes) {
            // Handle law save error
            if (lawSaveErr) {
              return done(lawSaveErr);
            }

            // Get a list of laws
            agent.get('/api/laws')
              .end(function (lawsGetErr, lawsGetRes) {
                // Handle law save error
                if (lawsGetErr) {
                  return done(lawsGetErr);
                }

                // Get laws list
                var laws = lawsGetRes.body;

                // Set assertions
                (laws[0].user._id).should.equal(userId);
                (laws[0].title).should.match('Law title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to update an law if signed in', function (done) {
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

        // Save a new law
        agent.post('/api/laws')
          .send(law)
          .expect(200)
          .end(function (lawSaveErr, lawSaveRes) {
            // Handle law save error
            if (lawSaveErr) {
              return done(lawSaveErr);
            }

            // Update law title
            law.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing law
            agent.put('/api/laws/' + lawSaveRes.body._id)
              .send(law)
              .expect(200)
              .end(function (lawUpdateErr, lawUpdateRes) {
                // Handle law update error
                if (lawUpdateErr) {
                  return done(lawUpdateErr);
                }

                // Set assertions
                (lawUpdateRes.body._id).should.equal(lawSaveRes.body._id);
                (lawUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an law if no title is provided', function (done) {
    // Invalidate title field
    law.title = '';

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

        // Save a new law
        agent.post('/api/laws')
          .send(law)
          .expect(422)
          .end(function (lawSaveErr, lawSaveRes) {
            // Set message assertion
            (lawSaveRes.body.message).should.match('title cannot be blank');

            // Handle law save error
            done(lawSaveErr);
          });
      });
  });

  it('should be able to delete an law if signed in', function (done) {
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

        // Save a new law
        agent.post('/api/laws')
          .send(law)
          .expect(200)
          .end(function (lawSaveErr, lawSaveRes) {
            // Handle law save error
            if (lawSaveErr) {
              return done(lawSaveErr);
            }

            // Delete an existing law
            agent.delete('/api/laws/' + lawSaveRes.body._id)
              .send(law)
              .expect(200)
              .end(function (lawDeleteErr, lawDeleteRes) {
                // Handle law error error
                if (lawDeleteErr) {
                  return done(lawDeleteErr);
                }

                // Set assertions
                (lawDeleteRes.body._id).should.equal(lawSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single law if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new law model instance
    law.user = user;
    var lawObj = new Law(law);

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

        // Save a new law
        agent.post('/api/laws')
          .send(law)
          .expect(200)
          .end(function (lawSaveErr, lawSaveRes) {
            // Handle law save error
            if (lawSaveErr) {
              return done(lawSaveErr);
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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                (lawInfoRes.body.isCurrentUserOwner).should.equal(true);

                // Call the assertion callback
                done();
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
