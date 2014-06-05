
function getRandLoc(box) {
  var x = box.minX + (Math.random() * (box.maxX - box.minX)),
      y = box.minY + (Math.random() * (box.maxY - box.minY));
  return {x: x, y: y};
}

Math.nrand = function() {
  var x1, x2, rad, y1;
  do {
    x1 = 2 * this.random() - 1;
    x2 = 2 * this.random() - 1;
    rad = x1 * x1 + x2 * x2;
  } while(rad >= 1 || rad == 0);
  var c = this.sqrt(-2 * Math.log(rad) / rad);
  return x1 * c;
};

var canvas = new fabric.Canvas('main-canvas'),
    width = 500,
    height = 700,
    town = [ {minX: 235, maxX: 235, minY: 140, maxY: 140}, {minX: 225, maxX: 245, minY: 180, maxY: 190} ],
    leftTown = [ {minX: -10, maxX: -10, minY: 370, maxY: 370}, {minX: 140, maxX: 170, minY: 360, maxY: 360} ],
    rightTown = [ {minX: 510, maxX: 510, minY: 370, maxY: 370}, {minX: 330, maxX: 330, minY: 360, maxY: 360} ],
    solarEntry = [ {minX: 85, maxX: 190, minY: 620, maxY: 620}, {minX: 235, maxX: 235, minY: 500, maxY: 520} ],
    coalEntry =  [ {minX: 300, maxX: 370, minY: 620, maxY: 620}, {minX: 235, maxX: 235, minY: 500, maxY: 520} ],
    pipeCenter = {minX: 220, maxX: 250, minY: 350, maxY: 390},
    percentOpenLeft = 0,
    percentOpenRight = 0,
    handle1 = new fabric.Rect({ left: 145, top: 340, height: 80, width: 35, fill: '#CCE', stroke: 'black', strokeWidth: 3, lockScalingX: true, lockScalingY: true, lockMovementX: true, hasBorders: false, hasControls: false}),
    handle2 = new fabric.Rect({ left: 300, top: 340, height: 80, width: 35, fill: '#CCE', stroke: 'black', strokeWidth: 3, lockScalingX: true, lockScalingY: true, lockMovementX: true, hasBorders: false, hasControls: false}),
    sun = new fabric.Circle({ top: 50, left: 50, radius: 20, fill: '#eee400', stroke: 'white', selectable: false}),
    factory = new fabric.Rect({ left: 250, top: 600, height: 100, width: 150, fill: 'rgba(0,0,0,0)', selectable: false}),
    coalPile = [],
    maxCoal = 30,
    converyor = new fabric.Rect({ left: 230, top: 130, height: 170, width: 26, fill: '#b4d1d2', stroke: 'black', selectable: false}),
    gaps = [],
    converyorSpeed = 2,
    arrivedFromLeft = 0,
    arrivedFromRight = 0,
    initialized = false,
    toTop = 0,
    toLeft = 0,
    toRight = 0,
    time = 0,
    timeStep = 0.01,
    coalProduction = 0,
    twoPi = Math.PI * 2,
    totalProduced = 0,
    productionCounter = 16,
    frownyFaces = 0,
    frownyText = null,
    frownyBuffer = 3,
    townName,
    townNumber,
    datastore;


if(window.location.hash) {
  townName = window.location.hash.substr(1);
  townNumber = 1 * /.$/.exec(townName)[0];
  worldName = window.prompt("What's the name of your island?","");
  datastore = new DataStore(worldName, townName);
  datastore.init(function() {
    initialized = true;
  });
}

addCoal = function() {
  if (coalPile.length > maxCoal) return;
  x = 425 + (Math.nrand() * 15);
  y = 685 + -Math.abs((Math.nrand() * 8));
  coal = new fabric.Circle({ top: y, left: x, radius: 5, fill: '#333', stroke: 'black', selectable: false});
  canvas.add(coal);
  coalPile.push(coal);
}

powerShortageCount = 0;

powerTexts = [
  new fabric.Text("We need power!", { left: 290, top: 50, angle: 20, fill: '#F00', fontSize: 19, shadow: 'rgba(0,0,0,0.4) 0 0 5px', selectable: false}),
  new fabric.Text("We need power!", { left: 90, top: 50, angle: -20, fill: '#F00', fontSize: 19, shadow: 'rgba(0,0,0,0.4) 0 0 5px', selectable: false}),
  new fabric.Text("We need power!", { left: 110, top: 70, angle: -7, fill: '#F00', fontSize: 22, shadow: 'rgba(0,0,0,0.4) 0 0 5px', selectable: false})
]

addFrownyFace = function() {
  if (frownyBuffer) {
    frownyBuffer--;
    return;
  };
  if (!frownyFaces) {
    frowny = new fabric.Image(document.getElementById('frowny'), {
      left: 400,
      top: 10
    });
    frownyText = new fabric.Text("0", { left: 450, top: 14, angle: 0, fontSize: 20, fill: '#F00', selectable: false});
    canvas.add(frowny);
    canvas.add(frownyText);
  }
  frownyFaces++;
  frownyText.text = ""+frownyFaces;
}

powerShortage = function() {
  if (powerShortageCount < powerTexts.length) {
    canvas.add(powerTexts[powerShortageCount++]);
  } else {
    addFrownyFace();
  }
}

regainPower = function() {
  canvas.remove(powerTexts[--powerShortageCount]);
}

createGaps = function() {
  for (i = 0; i < 8; i++) {
    var top = 134 + (i * 25);
    gap = new fabric.Circle({ top: top, left: 235, radius: 9, fill: '#666', stroke: 'white', selectable: false, _targeted: false, _filled: null});
    canvas.add(gap);
    gaps.push(gap);
  }
}

cropGaps = function() {
  var top = gaps[0].top - 130;
  gaps[0].clipTo = function (ctx) {
    ctx.rect(-10, -9-top, 20, 30);
  }

  var bottom = gaps[6].top - 282;
  gaps[6].clipTo = function (ctx) {
    ctx.rect(-10, -10, 20, 18-bottom);
  }

  _bottom = gaps[7].top - 282;
  gaps[7].clipTo = function (ctx) {
    ctx.rect(-10, -10, 20, 18-_bottom);
  }
}

moveGaps = function() {
  for (i in gaps) {
    gaps[i].top -= converyorSpeed;
    if (gaps[i]._filled) {
      gaps[i]._filled.top = gaps[i].top + 2;
    }
  }
  if (gaps[0].top < 112) {
    gap = gaps.shift();

    if (gap._filled) {
      if (powerShortageCount) {
        regainPower();
      }
      canvas.remove(gap._filled);
      gap._filled = null;
    } else {
      powerShortage();
    }
    gap._targeted = false;

    gaps.push(gap);
    gap.top = gaps[6].top + 25;
  }
  cropGaps();
}


canvas.add(handle1);
canvas.add(handle2);
canvas.add(sun);
canvas.add(factory);
canvas.add(converyor);

createGaps();
cropGaps();


for (i = 0; i < maxCoal; i++){
  addCoal();
}

canvas.setBackgroundImage('images/gridflowpipes-dawn.png');

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
    percentOpenLeft = percentOpen;
    if (datastore) {
      datastore.setCapacity('left', percentOpen*10)
    }
  } else {
    percentOpenRight = percentOpen;
    if (datastore) {
      datastore.setCapacity('right', percentOpen*10)
    }
  }
});

canvas.on('mouse:down', function(e) {
  var obj = e.target;
  // simple bounding
  if (obj == factory) {
    coalProduction = 28;
  }
});

canvas.renderAll();

addJoulie = function(origin) {
  loc = getRandLoc(origin[0]);
  if (origin == solarEntry) {
    joulie = new fabric.Circle({ radius: 7, fill: new fabric.Color('rgb(50, 50, 255)').toHex(), stroke: 'black', top: loc.y, left: loc.x, selectable: false, _rgb: 50, _origin: origin });
  } else if (origin == coalEntry) {
    joulie = new fabric.Circle({ radius: 7, fill: new fabric.Color('rgb(255, 50, 50)').toHex(), stroke: 'black', top: loc.y, left: loc.x, selectable: false, _rgb: 50, _origin: origin });
  } else {
    joulie = new fabric.Circle({ radius: 7, fill: new fabric.Color('rgb(255, 255, 255)').toHex(), stroke: 'black', top: loc.y, left: loc.x, selectable: false, _rgb: 50, _origin: origin });
  }
  canvas.add(joulie);

  //canvas.sendBackwards(joulie);
  canvas.sendToBack(converyor);

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
                if (r < Math.min((percentOpenLeft + percentOpenRight), 1) - 0.1){
                  p1 = percentOpenLeft * (1/(percentOpenLeft + percentOpenRight));
                  if (Math.random() < p1) {
                    target = leftTown;
                  } else {
                    target = rightTown;
                  }
                } else {
                  target = town;
                }
              }
              if (target == town) {
                success = false;
                for (i in gaps) {
                  gap = gaps[i];
                  if (gap.top > 134 && gap.top < 305 && !gap._targeted) {
                    gap._targeted = true;
                    (function(gap){
                      joulie.animate({top: gap.top+converyorSpeed, left: gap.left},
                        { duration: 250,
                          onComplete: function() {
                            gap._filled = joulie;
                            joulie.top = gap.top+2;
                            joulie.left = gap.left+2;
                          }
                        }
                      );
                    })(gap);
                    success = true;
                    break
                  }
                }
                if (!success) {
                  // dissipate
                  loc = getRandLoc({minX: 330, maxX: 380, minY: 190, maxY: 260})
                  joulie.animate({top: loc.y, left: loc.x},
                    { easing: fabric.util.ease.easeInSine,
                      duration: 2100,
                      onComplete: function() {
                        canvas.remove(joulie);
                      }
                    }
                  );
                }
              } else {
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


  leftNode = townNumber == 1 ? 6 : townNumber + 2;
  rightNode = townNumber == 3 ? 4 : townNumber + 4;

  capacity[0][1] = capacity[1][0] = data.town1.powerProduction || 10;
  capacity[0][2] = capacity[2][0] = data.town2.powerProduction || 10;
  capacity[0][3] = capacity[3][0] = data.town3.powerProduction || 10;

  capacity[4][7] = capacity[7][4] = data.town1.powerNeed || 10;
  capacity[5][7] = capacity[7][5] = data.town2.powerNeed || 10;
  capacity[6][7] = capacity[7][6] = data.town3.powerNeed || 10;

  capacity[1][5] = capacity[2][4] = Math.min(data.town1.town2Capacity, data.town2.town1Capacity) || 0;
  capacity[1][6] = capacity[3][4] = Math.min(data.town1.town3Capacity, data.town3.town1Capacity) || 0;
  capacity[2][6] = capacity[3][5] = Math.min(data.town2.town3Capacity, data.town3.town2Capacity) || 0;

  flow = edmondsKarp(edges, capacity, 0, 7).flow;

  _toTop   = Math.max(flow[townNumber][townNumber+3], 0);
  _toLeft  = Math.max(flow[townNumber][leftNode]    , 0);
  _toRight = Math.max(flow[townNumber][rightNode]   , 0);
  sum = _toTop + _toLeft + _toRight;
  toTop   = _toTop / sum;
  toLeft  = _toLeft / sum;
  toRight = _toRight / sum;
}

setTimeOfDay = function() {
  angle = time * twoPi / 4;
  sun.set({left: 215 + (-180*Math.cos(angle)), top: 100 + (-110*Math.sin(angle))});
  sun.clipTo = function (ctx) {
    ctx.rect(-30, -30, 60, 70 + (90 * Math.sin(angle)));
  }
  if (time == 3.6) {
    canvas.setBackgroundImage('images/gridflowpipes-dawn.png');
  } else if (time == 0.3) {
    canvas.setBackgroundImage('images/gridflowpipes-day.png');
    converyorSpeed = 3.2;
  } else if (time == 1.7) {
    canvas.setBackgroundImage('images/gridflowpipes-dusk.png');
    converyorSpeed = 2;
  } else if (time == 2.4) {
    canvas.setBackgroundImage('images/gridflowpipes-night.png');
  }
}

mainLoop = function() {
  time = (Math.round(100*(time + timeStep))/100) % 4;
  setTimeOfDay();
  moveGaps();
  coalProduction = Math.max(coalProduction - 1, 0);
  solarProductionChance = 0.3 * Math.sin(time * twoPi / 4);
  if (townName == 'town3') solarProductionChance -= 0.1;
  if ((Math.abs(Math.floor(time*10) - (time / 0.1))) < 0.01) {
    addCoal();
  }
  if (Math.random() < solarProductionChance+0.1) {
    addJoulie(solarEntry);
    totalProduced++;
  }
  if ((coalProduction > 0 && coalProduction % 3 == 0)) {
    coal = coalPile.pop();
    if (coal) {
      (function(coal){
        coal.animate({left: 350, top: 650}, {duration: 350,
          onComplete: function() {
            canvas.remove(coal);
            addJoulie(coalEntry);
          }});
      })(coal);
      totalProduced++;
    }
  }
  productionCounter--;
  if (datastore && productionCounter == 0) {
    productionCounter = 16;
    datastore.setProduction(totalProduced);
    totalProduced = 0;
  }
  if (datastore && initialized) {
    datastore.update(function(val) {
      if (val.fromLeft < arrivedFromLeft) arrivedFromLeft = 0;
      if (val.fromRight < arrivedFromRight) arrivedFromRight = 0;
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
