'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Laws Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/laws',
      permissions: '*'
    }, {
      resources: '/api/laws/:lawId',
      permissions: '*'
    }, {
      resources: '/api/laws/:lawId/*',
      permissions: '*'
    }]
  }, {
    roles: ['jaic'],
    allows: [{
      resources: '/api/laws',
      permissions: '*'
    }, {
      resources: '/api/laws/:lawId',
      permissions: '*'
    }, {
      resources: '/api/laws/:lawId/*',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/laws',
      permissions: ['get']
    }, {
      resources: '/api/laws/:lawId',
      permissions: ['get']
    }]
  }, {
    roles: ['admin', 'jaic', 'user'],
    allows: [{
      resources: '/api/laws/:lawId/requestDetail',
      permissions: ['post']
    }, {
      resources: '/api/laws/:lawId/requestRegulation',
      permissions: ['post']
    }, {
      resources: '/api/laws/:lawId/requestData',
      permissions: ['post']
    }, {
      resources: '/api/laws/:lawId/requestDataByLawId',
      permissions: ['post']
    }, {
      resources: '/api/laws/:lawId/postLawData',
      permissions: ['post']
    }, {
      resources: '/api/laws/:lawId/copyLaw',
      permissions: ['post']
    }, {
      resources: '/api/listMasterProperties',
      permissions: ['get']
    }, {
      resources: '/api/listMasterLawDetail',
      permissions: ['get']
    }, {
      resources: '/api/listMasterLawTdfk',
      permissions: ['get']
    }, {
      resources: '/api/listLawsByYear',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Laws Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an law is being processed and the current user created it then allow any manipulation
  if (req.law && req.user && req.law.user && req.law.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
