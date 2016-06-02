//-module utils
//-export functions to use in all the application

// [addHours/1, addMins/1, log/2, error/2, info/2, close/0 ]
//


// add hours
Date.prototype.addHours = function (h) {
  var copiedDate = new Date(this.getTime());
  copiedDate.setHours(copiedDate.getHours() + h);
  return copiedDate;
};

// add minutes
Date.prototype.addMins = function (m) {
  var copiedDate = new Date(this.getTime());
  copiedDate.setMinutes(copiedDate.getMinutes() + m);
  return copiedDate;
};


var log = function (message, object) {
  console.log(message, object || "");
};


var error = function (message, object) {
  console.error(message, object);
};


var info = function (message, object) {
  console.info(message, object);
};


var close = function() {
  localStorage.clear();
};