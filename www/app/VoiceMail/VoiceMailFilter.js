angular
  .module('callpal.voicemail')
  .filter('getLastRange', getLastRange)
  .filter('timeToSecondAndMinutesFromMilisecondsString', timeToSecondAndMinutesFromMilisecondsString)
  .filter('getIntSeconds', getIntSeconds)
  .filter('getFirstRange', getFirstRange)
  .filter('timestampToDate', timestampToDate);


function getLastRange(Utils, VoiceMailSvc) {
  return function(voiceMailLength, currentProgress) {
    return Utils.timeToSecondAndMinutes(currentProgress - VoiceMailSvc.getIntSeconds(voiceMailLength));
  }
}

function getFirstRange(Utils) {
  return function(currentProgress) {
    return Utils.timeToSecondAndMinutes(currentProgress);
  }
}

function timeToSecondAndMinutesFromMilisecondsString(Utils, VoiceMailSvc) {
  return function (input, labels) {
    return Utils.timeToSecondAndMinutes(VoiceMailSvc.getIntSeconds(input), labels);
  }
}

function getIntSeconds(VoiceMailSvc) {
  return function(voiceMailLength) {
    return VoiceMailSvc.getIntSeconds(voiceMailLength);
  }
}

function timestampToDate(VoiceMailSvc) {
  return function(timestamp) {
    return VoiceMailSvc.getDateFromTimestamp(timestamp);
  }
}
