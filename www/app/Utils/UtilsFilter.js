'use strict';

angular
  .module('callpal.utils')
  .filter('usFirst', usFirst)
  .filter('joinByProperty', joinByProperty)
  .filter('timeToSecondAndMinutes', timeToSecondAndMinutes)
  .filter('createDate', createDate)
  .filter('dateFormat', dateFormat)
  .filter('datetimeFormat', datetimeFormat)
;


function usFirst() {
  return function(countries) {
      var countriesSorted = [];
      for(var i = 0; i < countries.length; i++){
          if(countries[i].code === 'US'){
              countriesSorted.unshift(countries[i]);
          }else{
              countriesSorted.push(countries[i]);
          }
      }
    return countriesSorted;
  };
}


function joinByProperty() {
  return function (input, delimiter, property) {
    return input.map(function (item) {
      return item[property];
    }).join(delimiter || ',');
  };
}

function timeToSecondAndMinutes(Utils) {
  return function (input, labels) {
    return Utils.timeToSecondAndMinutes(input, labels);
  }
}

function createDate() {
  return function (string) {
    if (string) {
      return new Date(string);
      //var parts = string.split('-');
      //return new Date(parts[2], parts[0] - 1, parts[1]);
    }
  }
}

function dateFormat() {
  return function (date) {
    return moment(date).format("LL");
  }
}

function datetimeFormat() {
  return function (date) {
    return moment(date).format("lll");
  }
}
