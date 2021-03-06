(function () {
  'use strict';

  angular
    .module('core')
    .factory('Excel', Excel);

  Excel.$inject = ['$window'];

  function Excel($window) {
    var uri = 'data:application/vnd.ms-excel;charset=UTF-8;base64,',
      template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"' +
      ' xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>' +
      '<x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>' +
      '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table>' +
      '</body></html>',
      base64 = function (s) {
        return $window.btoa(unescape(encodeURIComponent(s)));
      },
      format = function (s, c) {
        return s.replace(/{(\w+)}/g, function (m, p) {
          return c[p];
        });
      };

    return {
      tableToExcel: function (tableId, worksheetName) {
        var exTable = $(tableId).clone();
        // remove the action th/td
        exTable.find('.ignore-excel-export').remove();
        var ctx = {
          worksheet: worksheetName,
          table: exTable.html()
        };

        if (window.navigator.msSaveOrOpenBlob) {
          return format(template, ctx);
        } else {
          return uri + base64(format(template, ctx));
        }
      }
    };
  }
}());
