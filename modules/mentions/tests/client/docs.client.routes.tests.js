(function () {
  'use strict';

  describe('Mentions Route Tests', function () {
    // Initialize global variables
    var $scope,
      MentionsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _MentionsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      MentionsService = _MentionsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('mentions');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/mentions');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('List Route', function () {
        var liststate;
        beforeEach(inject(function ($state) {
          liststate = $state.get('mentions.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/mentions/client/views/list-mentions.client.view.html');
        });
      });

      describe('View Route', function () {
        var viewstate,
          MentionsController,
          mockMention;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('mentions.view');
          $templateCache.put('/modules/mentions/client/views/view-mention.client.view.html', '');

          // create mock mention
          mockMention = new MentionsService({
            _id: '525a8422f6d0f87f0e407a33',
            meishou: 'An Mention about MEAN',
            hourei_nasuta: 'MEAN rocks!'
          });

          // Initialize Controller
          MentionsController = $controller('MentionsController as vm', {
            $scope: $scope,
            mentionResolve: mockMention
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:mentionId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.mentionResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            mentionId: 1
          })).toEqual('/mentions/1');
        }));

        it('should attach an mention to the controller scope', function () {
          expect($scope.vm.mention._id).toBe(mockMention._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('/modules/mentions/client/views/view-mention.client.view.html');
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/mentions/client/views/list-mentions.client.view.html', '');

          $state.go('mentions.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('mentions/');
          $rootScope.$digest();

          expect($location.path()).toBe('/mentions');
          expect($state.current.templateUrl).toBe('/modules/mentions/client/views/list-ments.client.view.html');
        }));
      });
    });
  });
}());
