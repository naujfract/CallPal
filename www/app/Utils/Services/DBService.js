'use strict';

angular
  .module('callpal.utils')
  .factory('CallPalDbSvc', CallPalDbSvc)
  .factory('DBA', DBA)
;

function CallPalDbSvc($cordovaSQLite, ConfigurationSvc, $window) {
  return {

    db: function () {
      var conn = null;

      if (window.cordova) {
        conn = window.sqlitePlugin.openDatabase({name: "callpalapp.db", location: 1}, function (success) {
          console.log('SQLite success', success);
        }, function (err) {
          console.log('SQLite err', err);
        });
      } else {
        conn = window.openDatabase("callpalapp.db", "1.0", "CallPal App", -1);
      }

      return conn;
    },

    init: function () {


      //this.deleteTables(); // TODO Remove this method from here
      this.createTables();


      // TODO Refactor the Storage Service
      // Load the configuration files just here
      ConfigurationSvc.initialize_notifications_storage().then(function (done) {
        // console.log(done);
      });

    },

    createTables: function () {
      // Calls
      $cordovaSQLite.execute(this.db(), "CREATE TABLE IF NOT EXISTS calls (json text);");
      // Groups
      $cordovaSQLite.execute(this.db(), "CREATE TABLE IF NOT EXISTS groups (json text);");
      // VoiceMails
      $cordovaSQLite.execute(this.db(), "CREATE TABLE IF NOT EXISTS voiceMails (json text);");
      // MediaContent
      $cordovaSQLite.execute(this.db(), "CREATE TABLE IF NOT EXISTS mediaContent (key text);");
    },


    deleteTables: function () {
      // To manage calls
        if($window.sqlitePlugin){
            $cordovaSQLite.deleteDB({name: 'callpalapp.db', location: 1}, function(){
                console.log('done deleting database: callpalapp.db');
            }, function(){
                console.log('error deleting database: callpalapp.db');
            });
        }else{
            $cordovaSQLite.execute(this.db(), "DROP TABLE IF EXISTS calls;");
            $cordovaSQLite.execute(this.db(), "DROP TABLE IF EXISTS groups;");
            $cordovaSQLite.execute(this.db(), "DROP TABLE IF EXISTS voiceMails;");
            $cordovaSQLite.execute(this.db(), "DROP TABLE IF EXISTS mediaContent;");
        }
    },

    deleteMedia: function()
    {
      $cordovaSQLite.execute(this.db(), "DROP TABLE IF EXISTS mediaContent;");
    }



  };

}

/**
 * @name : DBA
 * @description : SQLite DBA, extend this guy here to use SQLite
 * @link: https://gist.github.com/borissondagh/29d1ed19d0df6051c56f#file-app-js-L1
 **/
function DBA($ionicPlatform, $cordovaSQLite, $q, CallPalDbSvc) {

  var self = this;

  // Handle query's and potential errors
   function query (query, parameters) {

    var db = CallPalDbSvc.db();
    parameters = parameters || [];
    var q = $q.defer();

    $cordovaSQLite.execute(db, query, parameters)
      .then(function (result) {
        q.resolve(result);
      }, function (error) {
        console.warn('I found an error');
        console.warn(error);
        q.reject(error);
      });

    return q.promise;
  };

  // Process a result set
  function getAll (result) {
    var output = [];
    for (var i = 0; i < result.rows.length; i++) {
      output.push(JSON.parse(result.rows.item(i).json));
    }
    return output;
  };

  // return the json collection
  self.getCollection = function (collection) {
    var defer = $q.defer();

    $ionicPlatform.ready(function() {
      query("SELECT json from " + collection /*+ " order by rowid asc"*/)
        .then(function (result) {
          defer.resolve(getAll(result));
        }, function(err) {
          console.error('error in getCollection', err);
          defer.reject(err);
        });
    });

    return defer.promise;
  };
  // set a whole collection
  self.setCollection = function (collection, list) {

  };

  self.delCollection = function (collection) {
    return query('DELETE FROM ' + collection);
  };

  self.addDocument = function (collection, data) {
    return query('INSERT INTO ' + collection + '(json) VALUES (?)', [JSON.stringify(data)]);
  };

  self.addDocumentContent = function (collection, key) {
    return query('INSERT INTO ' + collection + '(key) VALUES (?)', [key]);
  };

  self.getDocumentContent = function (collection, key) {
    return query("SELECT * FROM " + collection + " WHERE key =?", [key])
        .then(function (result) {
          //console.log('result', result);
          return result;
        });
  };

  self.getAllDocumentsContent = function (collection) {
    return query("SELECT * FROM " + collection + ";", [])
        .then(function (result) {
          //console.log('result', result);
          return result;
        });
  };

  self.removeDocumentContent = function (collection, key) {
    return query("delete FROM " + collection + " WHERE key =?", [key])
        .then(function (result) {
          //console.log('result', result);
          return result;
        });
  };

  self.getDocument = function (collection, index) {
    return query("select json from " + collection + " where rowid in " +
        "(select rowid from " + collection + " limit ?) order by rowid desc limit 1", [index + 1])
        .then(function (result) {
          return JSON.parse(result.rows.item(i0).json);
        });
  };


  // del document by index
  self.delDocument = function (collection, index) {
    return query("delete from " + collection + " where rowid in " +
        "(select rowid from " + collection + " where rowid in " +
        "(select rowid from " + collection + " limit ?) order by rowid desc limit 1)", [index + 1]);
  };


  // update a document
  self.updateDocument = function (collection, property, value, object) {
    var dfd = $q.defer();
    var foundedPos = -1;
    var self = this;

    query("select * from " + collection).then(function (res) {

      for (var i = 0; i < res.rows.length; i++) {
        var currentJson = JSON.parse(res.rows.item(i).json);
        console.log('currentJson', currentJson);
        if (currentJson[property] == value) {
          foundedPos = i;
          break;
        }
      }

      if (foundedPos != -1) {
        self.delDocument(collection, foundedPos);
        self.addDocument(collection, object);
        dfd.resolve(object);
      }
      else
        dfd.reject("error document not found");
    }, function (error) {
      dfd.reject();
      console.error('DEBUG: ERR, There is an error updating the doc', error)
    });

    return dfd.promise;
  };


  // return the index of document in collection given the fieldId
  self.delDocumentSelf = function (collection, document, fieldId) {
    var defer = $q.defer(),
        index = -1;

    self.getCollection(collection)
      .then(function(documents) {
         angular.forEach(documents, function (_document, _index) {
           if (_document[fieldId] == document[fieldId]) {
             index = _index;
             self.delDocument(collection, _index)
               .then(function (suc) {
                 return defer.resolve(_index);
               }, function (err) {
                 return defer.reject(err);
               });
           }
         });
        if (index == -1) {
          return defer.reject(-1);
        }
      }, function(err) {
        return defer.reject(err);
      });

    return defer.promise;
  }

  return self;
}
