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
describe('Mention Admin CRUD tests', function () {
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

  it('should be able to save an mention if logged in', function (done) {
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

        // Save a new mention
        agent.post('/api/mentions')
          .send(mention)
          .expect(200)
          .end(function (mentionSaveErr, mentionSaveRes) {
            // Handle mention save error
            if (mentionSaveErr) {
              return done(mentionSaveErr);
            }

            // Get a list of mentions
            agent.get('/api/mentions')
              .end(function (mentionsGetErr, mentionsGetRes) {
                // Handle mention save error
                if (mentionsGetErr) {
                  return done(mentionsGetErr);
                }

                // Get mentions list
                var mentions = mentionsGetRes.body;

                // Set assertions
                (mentions[0].user._id).should.equal(userId);
                (mentions[0].meishou).should.match('Mention meishou');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to update an mention if signed in', function (done) {
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

        // Save a new mention
        agent.post('/api/mentions')
          .send(mention)
          .expect(200)
          .end(function (mentionSaveErr, mentionSaveRes) {
            // Handle mention save error
            if (mentionSaveErr) {
              return done(mentionSaveErr);
            }

            // Update mention meishou
            mention.meishou = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing mention
            agent.put('/api/mentions/' + mentionSaveRes.body._id)
              .send(mention)
              .expect(200)
              .end(function (mentionUpdateErr, mentionUpdateRes) {
                // Handle mention update error
                if (mentionUpdateErr) {
                  return done(mentionUpdateErr);
                }

                // Set assertions
                (mentionUpdateRes.body._id).should.equal(mentionSaveRes.body._id);
                (mentionUpdateRes.body.meishou).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an mention if no meishou is provided', function (done) {
    // Invalidate meishou field
    mention.meishou = '';

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

        // Save a new mention
        agent.post('/api/mentions')
          .send(mention)
          .expect(422)
          .end(function (mentionSaveErr, mentionSaveRes) {
            // Set message assertion
            (mentionSaveRes.body.message).should.match('meishou cannot be blank');

            // Handle mention save error
            done(mentionSaveErr);
          });
      });
  });

  it('should be able to delete an mention if signed in', function (done) {
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

        // Save a new mention
        agent.post('/api/mentions')
          .send(mention)
          .expect(200)
          .end(function (mentionSaveErr, mentionSaveRes) {
            // Handle mention save error
            if (mentionSaveErr) {
              return done(mentionSaveErr);
            }

            // Delete an existing mention
            agent.delete('/api/mentions/' + mentionSaveRes.body._id)
              .send(mention)
              .expect(200)
              .end(function (mentionDeleteErr, mentionDeleteRes) {
                // Handle mention error error
                if (mentionDeleteErr) {
                  return done(mentionDeleteErr);
                }

                // Set assertions
                (mentionDeleteRes.body._id).should.equal(mentionSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single mention if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new mention model instance
    mention.user = user;
    var mentionObj = new Mention(mention);

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

        // Save a new mention
        agent.post('/api/mentions')
          .send(mention)
          .expect(200)
          .end(function (mentionSaveErr, mentionSaveRes) {
            // Handle mention save error
            if (mentionSaveErr) {
              return done(mentionSaveErr);
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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                (mentionInfoRes.body.isCurrentUserOwner).should.equal(true);

                // Call the assertion callback
                done();
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
