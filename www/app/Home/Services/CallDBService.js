'use strict';

angular
  .module('callpal.home')
  .factory('CallsDbSvc', CallsDbSvc)
  .factory('MembersDbSvc', MembersDbSvc)
;


function CallsDbSvc(DBA, $q) {

  var self = this;

  /**
   * @function: @get_calls_by_call_type from json
   * @description: Get the call based on the call_id
   * @param: The id of the call
   **/
  self.get_times = function () {
    var deferred = $q.defer();

    DBA.getCollection('calls')
      .then(function (calls) {
        var obj = {'incoming' : 0, 'outgoing' : 0};
        //var calls = [{'duration' : 1000, 'type': 'incoming'}, {'duration' : 2000, 'type': 'incoming'}, {'duration' : 2000, 'type': 'outgoing'}];
        angular.forEach(calls, function (call) {
          if (! obj[call.type]) { obj[call.type] = 0 }
          obj[call.type] += call.duration;
        });

        deferred.resolve(obj);
      }, function(err) {
        deferred.reject(err);
      });

    return deferred.promise;
  }

  return self;
}

function MembersDbSvc(DBA,  $q) {

  var self = this;
  /**
   * @function: @all
   * @description: Get all the members for all the calls
   **/
  self.get_all_grouped_by_country = function () {
    //return DBA.query("SELECT country, count(country) as count FROM members GROUP BY country ORDER BY count(country) DESC");
    var deferred = $q.defer();

    DBA.getCollection('groups')
      .then(function (groups) {
        var obj = {};
        //var groups = [{members: [{country: 'cuba'}, {country: 'cuba'}]}, {members: [{country: 'usa'}]}];
        angular.forEach(groups, function (group) {
          angular.forEach(group.members, function (member) {
            if (! obj[member.country]) { obj[member.country] = 0 }
            obj[member.country] += 1;
          });
        });

        deferred.resolve(obj);
      }, function(err) {
        deferred.reject(err);
      });

    return deferred.promise;
  }

  return self;
}
