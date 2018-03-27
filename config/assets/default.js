'use strict';

/* eslint comma-dangle:[0, "only-multiline"] */

module.exports = {
  client: {
    lib: {
      css: [
        // bower:css
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/angular-ui-notification/dist/angular-ui-notification.css',
        // add new
        'public/lib/common/css/common.css',
        'public/lib/common/css/w3.css',
        'public/lib/common/css/w3-theme-teal.css',
        'public/lib/font-awesome/web-fonts-with-css/css/fontawesome.css',
        'public/lib/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css',
        'public/lib/bootstrap-datepicker/dist/css/bootstrap-datepicker3.min.css',
        'public/lib/clockpicker/dist/bootstrap-clockpicker.min.css',
        'public/lib/font-awesome/web-fonts-with-css/css/fontawesome-all.min.css',
        'public/lib/angular-loading-bar/src/loading-bar.css',
        'public/lib//ng-dialog/css/ngDialog.min.css',
        'public/lib//ng-dialog/css/ngDialog-theme-default.min.css',
        // endbower
      ],
      js: [
        // bower:js
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/angular/angular.js',
        'public/lib/angular-i18n/angular-locale_ja-jp.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/ng-file-upload/ng-file-upload.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-mocks/angular-mocks.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-ui-notification/dist/angular-ui-notification.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        // add new
        'public/lib/common/js/common.js',
        'public/lib/common/js/dummy.js',
        'public/lib/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js',
        'public/lib/bootstrap-datepicker/dist/js/bootstrap-datepicker.ja.min.js',
        'public/lib/clockpicker/dist/bootstrap-clockpicker.js',
        'public/lib/bootstrap-slider/bootstrap-slider.js',
        'public/lib/jquery-csv/src/jquery.csv.js',
        'public/lib/checklist-model/checklist-model.js',
        'public/lib/jquery-ui/jquery-ui.min.js',
        'public/lib/angular-ui-sortable/sortable.min.js',
        'public/scripts/docs.js',
        'public/lib/underscore/underscore.js',
        'public/lib/angular-loading-bar/src/loading-bar.js',
        'public/lib/ng-dialog/js/ngDialog.min.js'
        // endbower
      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/{css,less,scss}/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
    img: [
      'modules/**/*/img/**/*.jpg',
      'modules/**/*/img/**/*.png',
      'modules/**/*/img/**/*.gif',
      'modules/**/*/img/**/*.svg'
    ],
    views: ['modules/*/client/views/**/*.html'],
    templates: ['build/templates.js']
  },
  server: {
    gulpConfig: ['gulpfile.js'],
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: ['modules/*/server/config/*.js'],
    policies: 'modules/*/server/policies/*.js',
    views: ['modules/*/server/views/*.html']
  }
};
