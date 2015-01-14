'use strict';

/* global Firebase */
window.addEventListener('load', function() {
  var FIREBASE_URL = "https://gridflow.firebaseio.com/";

  var islandName = window.location.hash.replace(/[^a-z]+/g, '') || 'default';
  var numPlayersDisplay = document.getElementById('num-players-display');
  var newSessionButton = document.getElementById('new-session-button');

  var islandFirebase = new Firebase(FIREBASE_URL + islandName + '/session');
  var sessionFirebase;

  function connectToSession(updateSessionNumber) {
    islandFirebase.transaction(updateSessionNumber, function(err, committed, session) {
      if (err) {
        window.alert("Couldn't connect; try again!");
        return;
      }

      if (sessionFirebase) {
        sessionFirebase.off('value');
      }
      sessionFirebase = new Firebase(FIREBASE_URL + islandName + '/sessions/' + session.val());
      sessionFirebase.on('value', function(sessionSnapshot) {
        numPlayersDisplay.innerText = sessionSnapshot.numChildren();
      });
    });
  }

  sessionFirebase = connectToSession(function(session) { return session || 1; });

  newSessionButton.addEventListener('click', function() {
    if (sessionFirebase) {
      connectToSession(function(session) { return (session || 0) + 1; });
    }
  });
});
