(function (app) {
  'use strict';

  app.registerModule('docs', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('docs.admin', ['core.admin']);
  app.registerModule('docs.admin.routes', ['core.admin.routes']);
  app.registerModule('docs.services');
  app.registerModule('docs.routes', ['ui.router', 'core.routes', 'docs.services']);
}(ApplicationConfiguration));
