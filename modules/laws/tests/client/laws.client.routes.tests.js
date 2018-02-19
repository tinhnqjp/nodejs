(function () {
  'use strict';

  describe('Laws Route Tests', function () {
    // Initialize global variables
    var $scope,
      LawsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _LawsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      LawsService = _LawsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('laws');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/laws');
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
          liststate = $state.get('laws.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/laws/client/views/list-laws.client.view.html');
        });
      });

      describe('View Route', function () {
        var viewstate,
          LawsController,
          mockLaw;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('laws.view');
          $templateCache.put('/modules/laws/client/views/view-law.client.view.html', '');

          // create mock law
          mockLaw = new LawsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Law about MEAN',
            hourei_nasuta: 'MEAN rocks!'
          });

          // Initialize Controller
          LawsController = $controller('LawsController as vm', {
            $scope: $scope,
            lawResolve: mockLaw
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:lawId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.lawResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            lawId: 1
          })).toEqual('/laws/1');
        }));

        it('should attach an law to the controller scope', function () {
          expect($scope.vm.law._id).toBe(mockLaw._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('/modules/laws/client/views/view-law.client.view.html');
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/laws/client/views/list-laws.client.view.html', '');

          $state.go('laws.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('laws/');
          $rootScope.$digest();

          expect($location.path()).toBe('/laws');
          expect($state.current.templateUrl).toBe('/modules/laws/client/views/list-laws.client.view.html');
        }));
      });
    });
  });
}());
