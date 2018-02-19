'use strict';

describe('Laws E2E Tests:', function () {
  describe('Test laws page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/laws');
      expect(element.all(by.repeater('law in laws')).count()).toEqual(0);
    });
  });
});
