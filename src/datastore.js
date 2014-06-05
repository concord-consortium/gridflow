if (typeof Firebase == "undefined") {
  DataObj = {
    val: function() {
      return {
        "town1" : {
          "powerProduction" : 10,
          "powerNeed" : 8,
          "town2" : 0,
          "town3" : 0
        },
        "town2" : {
          "powerProduction" : 5,
          "powerNeed" : 8,
          "town1" : 0,
          "town3" : 0
        },
        "town3" : {
          "powerProduction" : 5,
          "powerNeed" : 8,
          "town1" : 0,
          "town2" : 0
        }
      }
    }
  }
  Firebase = function() {}

  Firebase.prototype = {
    update: function(_, callback) {
      if (callback) callback();
    },
    once: function(_, callback) {
      if (callback) callback(DataObj);
    }
  }
}

var townTopology = {
  'town1': {left: 'town3', right: 'town2'},
  'town2': {left: 'town1', right: 'town3'},
  'town3': {left: 'town2', right: 'town1'}
};

var fbUrl = 'https://cc-gridflow.firebaseio.com';

DataStore = function(worldName, townName) {
  this.worldName = worldName;
  this.townName = townName;
  this.left  = townTopology[townName].left;
  this.right = townTopology[townName].right;
  this.model = {};

  worldUrl = fbUrl+'/'+worldName;

  this.fbRefs = {
    'top': new Firebase(worldUrl),
    'town1': new Firebase(worldUrl + '/town1'),
    'town2': new Firebase(worldUrl + '/town2'),
    'town3': new Firebase(worldUrl + '/town3')
  }
}

DataStore.prototype = {

  init: function (callback) {
    var initializationObj = {
      powerProduction: 7,
      powerNeed: 7
    };
    initializationObj[this.left] = 0;
    initializationObj[this.right] = 0;
    initializationObj[this.left+"Capacity"] = 0;
    initializationObj[this.right+"Capacity"] = 0;

    this.fbRefs[this.townName].update(initializationObj);
    this.model = initializationObj;

    resetFromValues = {};
    resetFromValues[this.townName] = 0;
    this.fbRefs[this.left].update(resetFromValues);
    this.fbRefs[this.right].update(resetFromValues, callback);
  },

  setProduction: function (val) {
    this.model.powerProduction = val;
    this.fbRefs[this.townName].update({powerProduction: val});
  },

  setNeed: function (val) {
    this.model.powerNeed = val;
    this.fbRefs[this.townName].update({powerNeed: val});
  },

  setCapacity: function (direction, val) {
    this.fbRefs[this.townName].child(this[direction]+"Capacity").set(val);
  },

  add: function (direction) {
    var key = this[direction];
    this.model[key]++;
    updateObj = {}; updateObj[key] = this.model[key];
    this.fbRefs[this.townName].update(updateObj);
  },

  update: function (callback) {
    _this = this;
    this.fbRefs.top.once('value', function(snapshot) {
      var data = snapshot.val();
      data.fromLeft = data[_this.left][_this.townName];
      data.fromRight = data[_this.right][_this.townName];
      callback(data);
    });
  }
}
