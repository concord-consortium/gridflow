var townTopology = {
  'town1': {left: 'town3', right: 'town2'},
  'town2': {left: 'town1', right: 'town3'},
  'town3': {left: 'town2', right: 'town1'}
};

var fbUrl = 'https://cc-gridflow.firebaseio.com';

var fbRefs = {
  'town1': new Firebase(fbUrl + '/town1'),
  'town2': new Firebase(fbUrl + '/town2'),
  'town3': new Firebase(fbUrl + '/town3')
};

DataStore = function(townName) {
  this.townName = townName;
  this.left  = townTopology[townName].left;
  this.right = townTopology[townName].right;
  this.model = {};
}

DataStore.prototype = {

  init: function (callback) {
    var initializationObj = {
      powerProduction: 0,
      powerNeed: 0
    };
    initializationObj[this.left] = 0;
    initializationObj[this.right] = 0;

    fbRefs[this.townName].update(initializationObj);
    this.model = initializationObj;

    resetFromValues = {};
    resetFromValues[this.townName] = 0;
    fbRefs[this.left].update(resetFromValues);
    fbRefs[this.right].update(resetFromValues, callback);
  },

  add: function (direction) {
    var key = this[direction];
    this.model[key]++;
    updateObj = {}; updateObj[key] = this.model[key];
    fbRefs[this.townName].update(updateObj);
  },

  readIncoming: function (callback) {
    var incoming = {left: 0, right: 0};
    fbRefs[this.left].child(this.townName).once('value', function(snapshot) {
      callback('left', snapshot.val());
    });

    fbRefs[this.right].child(this.townName).once('value', function(snapshot) {
      callback('right', snapshot.val());
    });
  }
}




/** FireBase DB Schema

{
  "town1" : {
    "powerProduction" : 0,
    "powerNeed" : 0,
    "toTown2" : 0,
    "toTown3" : 0
  },
  "town3" : {
    "prowerProduction" : 0,
    "powerNeed" : 0,
    "toTown2" : 0,
    "toTown1" : 0
  },
  "town2" : {
    "powerProduction" : 0,
    "powerNeed" : 0,
    "toTown1" : 0,
    "toTown3" : 0
  }
}

*/

