angular
  .module('callpal.contacts')
  .filter('getInitials', getInitials);

function getInitials() {
  return function(displayName) {
    try {
      var matches = displayName.match(/\b(\w)/g);
      if (matches) {
        return matches.join('').substr(0, 2).toUpperCase();
      } else {
        return "CP";
      }
    } catch(err) {
      return "CP";
    }
  }
}
