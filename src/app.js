
function getRandLoc(box) {
  var x = box.minX + (Math.random() * (box.maxX - box.minX)),
      y = box.minY + (Math.random() * (box.maxY - box.minY));
  return {x: x, y: y};
}

var canvas = new fabric.Canvas('main-canvas'),
    width = 500,
    height = 700,
    town = [ {minX: 235, maxX: 235, minY: 140, maxY: 140}, {minX: 225, maxX: 245, minY: 180, maxY: 190} ],
    leftTown = [ {minX: -10, maxX: -10, minY: 370, maxY: 370}, {minX: 140, maxX: 170, minY: 360, maxY: 360} ],
    rightTown = [ {minX: 510, maxX: 510, minY: 370, maxY: 370}, {minX: 330, maxX: 330, minY: 360, maxY: 360} ],
    solarEntry = [ {minX: 85, maxX: 190, minY: 620, maxY: 620}, {minX: 235, maxX: 235, minY: 500, maxY: 520} ],
    coalEntry =  [ {minX: 300, maxX: 370, minY: 620, maxY: 620}, {minX: 235, maxX: 235, minY: 500, maxY: 520} ],
    pipeCenter = {minX: 220, maxX: 250, minY: 350, maxY: 390},
    percentOpen1 = 0,
    percentOpen2 = 0,
    handle1 = new fabric.Rect({ left: 145, top: 340, height: 80, width: 35, fill: '#CCE', stroke: 'black', strokeWidth: 3, lockScalingX: true, lockScalingY: true, lockMovementX: true, hasBorders: false, hasControls: false}),
    handle2 = new fabric.Rect({ left: 300, top: 340, height: 80, width: 35, fill: '#CCE', stroke: 'black', strokeWidth: 3, lockScalingX: true, lockScalingY: true, lockMovementX: true, hasBorders: false, hasControls: false}),
    arrivedFromLeft = 0,
    arrivedFromRight = 0,
    initialized = false,
    toTop = 0,
    toLeft = 0,
    toRight = 0,
    townName,
    townNumber,
    datastore;


if(window.location.hash) {
  townName = window.location.hash.substr(1);
  townNumber = 1 * /.$/.exec(townName)[0]
  datastore = new DataStore(townName);
  datastore.init(function() {
    initialized = true;
  });
}

canvas.add(handle1);
canvas.add(handle2);

canvas.setBackgroundImage('images/gridflowpipes.png');

canvas.on('object:moving', function(e) {
  var handle = e.target;
  // simple bounding
  if (handle.top > 400) {
    handle.top = 400;
  } else if (handle.top < 340) {
    handle.top = 340;
  }
  if (handle.top > 370) {
    percentOpen = (handle.top - 365)/25;
  } else {
    percentOpen = 0;
  }
  handle.set('_targetY', 363 + (handle.top - 363) / 2);
  if (handle == handle1) {
    percentOpen1 = percentOpen;
  } else {
    percentOpen2 = percentOpen;
  }
});

canvas.renderAll();

addJoulie = function(origin) {
  loc = getRandLoc(origin[0]);
  if (origin == solarEntry) {
    joulie = new fabric.Circle({ radius: 8, fill: new fabric.Color('rgb(50, 50, 255)').toHex(), stroke: 'black', top: loc.y, left: loc.x, selectable: false, _rgb: 50, _origin: origin });
  } else if (origin == coalEntry) {
    joulie = new fabric.Circle({ radius: 8, fill: new fabric.Color('rgb(255, 50, 50)').toHex(), stroke: 'black', top: loc.y, left: loc.x, selectable: false, _rgb: 50, _origin: origin });
  } else {
    joulie = new fabric.Circle({ radius: 8, fill: new fabric.Color('rgb(255, 255, 255)').toHex(), stroke: 'black', top: loc.y, left: loc.x, selectable: false, _rgb: 50, _origin: origin });
  }
  canvas.add(joulie);

  canvas.sendToBack(joulie);

  // start of the origin pipe
  loc = getRandLoc(origin[1]);
  joulie.animate({top: loc.y, left: loc.x},
    { easing: fabric.util.ease.easeInSine,
      duration: 3000,
      onChange: function() {
        _rgb = Math.min(joulie.get('_rgb') + 1, 220);
        if (joulie.get('_origin') == solarEntry) {
          joulie.set({fill: new fabric.Color('rgb('+_rgb+', '+_rgb+', 255)').toHex(), _rgb: _rgb});
        } else if (joulie.get('_origin') == coalEntry) {
          joulie.set({fill: new fabric.Color('rgb(255, '+_rgb+', '+_rgb+')').toHex(), _rgb: _rgb});
        }
      },
      onComplete: (function(joulie) { return function() {
        // center
        loc = getRandLoc(pipeCenter);
        joulie.animate({top: loc.y, left: loc.x},
          { duration: 1100,
            onChange: function() {
              _rgb = Math.min(joulie.get('_rgb') + 1, 220);
              if (joulie.get('_origin') == solarEntry) {
                joulie.set({fill: new fabric.Color('rgb('+_rgb+', '+_rgb+', 255)').toHex(), _rgb: _rgb});
              } else if (joulie.get('_origin') == coalEntry) {
                joulie.set({fill: new fabric.Color('rgb(255, '+_rgb+', '+_rgb+')').toHex(), _rgb: _rgb});
              }
            },
            onComplete: function() {
              // middle of the target pipe
              var target,
                  r = Math.random();
              if (datastore) {
                if (r < toTop) {
                  target = town;
                } else if (r < toTop + toLeft) {
                  target = leftTown;
                } else {
                  target = rightTown;
                }
              } else {
                if (r < Math.min((percentOpen1 + percentOpen2), 1) - 0.1){
                  p1 = percentOpen1 * (1/(percentOpen1 + percentOpen2));
                  if (Math.random() < p1) {
                    target = leftTown;
                  } else {
                    target = rightTown;
                  }
                } else {
                  target = town;
                }
              }
              loc = getRandLoc(target[1]);
              joulie.animate({top: loc.y, left: loc.x},
                { easing: fabric.util.ease.easeOutSine,
                  duration: 1000,
                  onComplete: function() {
                    // end of the target pipe
                    loc = getRandLoc(target[0]);
                    joulie.animate({top: loc.y, left: loc.x},
                      { easing: fabric.util.ease.easeInSine,
                        duration: 900,
                        onComplete: function() {
                          if (datastore && target == leftTown) {
                            datastore.add('left');
                          } else if (datastore && target == rightTown) {
                            datastore.add('right');
                          }
                          canvas.remove(joulie);
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }})(joulie)
    });
}

solveFlowNetwork = function(data) {
  var edges = [[1,2,3],[0,4,5,6],[0,4,5,6],[0,4,5,6],[1,2,3,7],[1,2,3,7],[1,2,3,7],[4,5,6]],
      capacity = [], i, j, flow;
  for (i = 0; i < 8; i++) {
    capacity[i] = [];
    for (j = 0; j < 8; j++) {
      capacity[i][j] = Infinity;
    }
  }

  capacity[0][1] = capacity[1][0] = data.town1.powerProduction;
  capacity[0][2] = capacity[2][0] = data.town2.powerProduction;
  capacity[0][3] = capacity[3][0] = data.town3.powerProduction;

  capacity[4][7] = capacity[7][4] = data.town1.powerNeed;
  capacity[5][7] = capacity[7][5] = data.town2.powerNeed;
  capacity[6][7] = capacity[7][6] = data.town3.powerNeed;

  flow = edmondsKarp(edges, capacity, 0, 7).flow;

  leftNode = townNumber == 1 ? 6 : townNumber + 2;
  rightNode = townNumber == 3 ? 4 : townNumber + 4;

  _toTop   = Math.max(flow[townNumber][townNumber+3], 0);
  _toLeft  = Math.max(flow[townNumber][leftNode]    , 0);
  _toRight = Math.max(flow[townNumber][rightNode]   , 0);
  sum = _toTop + _toLeft + _toRight;
  toTop   = _toTop / sum;
  toLeft  = _toLeft / sum;
  toRight = _toRight / sum;
}

mainLoop = function() {
  if (Math.random() < 0.2) {
    var origin = Math.random() < 0.5 ? solarEntry : coalEntry;
    addJoulie(origin);
  }
  if (datastore && initialized) {
    datastore.update(function(val) {
      while (arrivedFromLeft < val.fromLeft) {
        addJoulie(leftTown);
        arrivedFromLeft++;
      }
      while (arrivedFromRight < val.fromRight) {
        addJoulie(rightTown);
        arrivedFromRight++;
      }
      solveFlowNetwork(val);
    });
  }

  canvas.renderAll();
}

setInterval(mainLoop, 100);
