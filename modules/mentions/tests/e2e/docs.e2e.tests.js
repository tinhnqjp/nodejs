'use strict';

describe('Mentions E2E Tests:', function () {
  describe('Test mentions page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/mentions');
      expect(element.all(by.repeater('mention in mentions')).count()).toEqual(0);
    });
  });
});
