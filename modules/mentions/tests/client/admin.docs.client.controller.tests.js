(function () {
  'use strict';

  describe('Mentions Admin Controller Tests', function () {
    // Initialize global variables
    var MentionsAdminController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      MentionsService,
      mockMention,
      Notification;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _MentionsService_, _Notification_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      MentionsService = _MentionsService_;
      Notification = _Notification_;

      // Ignore parent template get on state transitions
      $httpBackend.whenGET('/modules/core/client/views/home.client.view.html').respond(200, '');

      // create mock mention
      mockMention = new MentionsService({
        _id: '525a8422f6d0f87f0e407a33',
        meishou: 'An Mention about MEAN',
        hourei_nasuta: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Mentions controller.
      MentionsAdminController = $controller('MentionsAdminController as vm', {
        $scope: $scope,
        mentionResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
      spyOn(Notification, 'error');
      spyOn(Notification, 'success');
    }));

    describe('vm.save() as create', function () {
      var sampleMentionPostData;

      beforeEach(function () {
        // Create a sample mention object
        sampleMentionPostData = new MentionsService({
          meishou: 'An Mention about MEAN',
          hourei_nasuta: 'MEAN rocks!'
        });

        $scope.vm.mention = sampleMentionPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (MentionsService) {
        // Set POST response
        $httpBackend.expectPOST('/api/mentions', sampleMentionPostData).respond(mockMention);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test Notification success was called
        expect(Notification.success).toHaveBeenCalledWith({ message: '<i class="glyphicon glyphicon-ok"></i> Mention saved successfully!' });
        // Test URL redirection after the mention was created
        expect($state.go).toHaveBeenCalledWith('admin.mentions.list');
      }));

      it('should call Notification.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('/api/mentions', sampleMentionPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect(Notification.error).toHaveBeenCalledWith({ message: errorMessage, title: '<i class="glyphicon glyphicon-remove"></i> Mention save error!' });
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock mention in $scope
        $scope.vm.mention = mockMention;
      });

      it('should update a valid mention', inject(function (MentionsService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/mentions\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test Notification success was called
        expect(Notification.success).toHaveBeenCalledWith({ message: '<i class="glyphicon glyphicon-ok"></i> Mention saved successfully!' });
        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('admin.mentions.list');
      }));

      it('should  call Notification.error if error', inject(function (MentionsService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/mentions\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect(Notification.error).toHaveBeenCalledWith({ message: errorMessage, title: '<i class="glyphicon glyphicon-remove"></i> Mention save error!' });
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup mentions
        $scope.vm.mention = mockMention;
      });

      it('should delete the mention and redirect to mentions', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/mentions\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect(Notification.success).toHaveBeenCalledWith({ message: '<i class="glyphicon glyphicon-ok"></i> Mention deleted successfully!' });
        expect($state.go).toHaveBeenCalledWith('admin.mentions.list');
      });

      it('should should not delete the mention and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
}());
