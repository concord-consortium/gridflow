function setCookie(value) {
    document.cookie = "cookie-msg-test=" + value + "; path=/";
    return true;
}

function getCookie() {
    var cname = "cookie-msg-test=";
    var ca = document.cookie.split(';');
    for (var i=0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(cname) == 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return null;
}

function getRandLoc(box) {
  var x = box.minX + (Math.random() * (box.maxX - box.minX)),
      y = box.minY + (Math.random() * (box.maxY - box.minY));
  return {x: x, y: y};
}

setCookie(0);

var canvas = new fabric.Canvas('main-canvas'),
    width = 500,
    height = 700,
    town = [ {minX: 225, maxX: 245, minY: 180, maxY: 190}, {minX: 235, maxX: 235, minY: 140, maxY: 140} ],
    externalTown1 = [ {minX: 140, maxX: 170, minY: 360, maxY: 360}, {minX: -10, maxX: -10, minY: 370, maxY: 370} ],
    externalTown2 = [ {minX: 330, maxX: 330, minY: 360, maxY: 360}, {minX: 510, maxX: 510, minY: 370, maxY: 370} ],
    solarEntry = {minX: 85, maxX: 190, minY: 620, maxY: 620},
    coalEntry =  {minX: 300, maxX: 370, minY: 620, maxY: 620},
    pipeBottom = {minX: 235, maxX: 235, minY: 500, maxY: 520},
    pipeCenter = {minX: 220, maxX: 250, minY: 350, maxY: 390},
    percentOpen1 = 0,
    percentOpen2 = 0,
    handle1 = new fabric.Rect({ left: 145, top: 340, height: 80, width: 35, fill: '#CCE', stroke: 'black', strokeWidth: 3, lockScalingX: true, lockScalingY: true, lockMovementX: true, hasBorders: false, hasControls: false}),
    handle2 = new fabric.Rect({ left: 300, top: 340, height: 80, width: 35, fill: '#CCE', stroke: 'black', strokeWidth: 3, lockScalingX: true, lockScalingY: true, lockMovementX: true, hasBorders: false, hasControls: false});


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

if(window.location.hash) {
  var window2 = true;
} else {
  window2 = false;
}

canvas.renderAll();

if (!window2) {
mainLoop = function() {
  if (Math.random() < 0.2) {
    var isSolar = Math.random() < 0.5,
        joulie;
    if (isSolar) {
      loc = getRandLoc(solarEntry);
      joulie = new fabric.Circle({ radius: 8, fill: new fabric.Color('rgb(50, 50, 255)').toHex(), stroke: 'black', top: loc.y, left: loc.x, selectable: false, _rgb: 50, _solar: true });
    } else {
      loc = getRandLoc(coalEntry);
      joulie = new fabric.Circle({ radius: 8, fill: new fabric.Color('rgb(255, 50, 50)').toHex(), stroke: 'black', top: loc.y, left: loc.x, selectable: false, _rgb: 50, _solar: false });
    }
    canvas.add(joulie);

    canvas.sendToBack(joulie);

    // bottom of the bottom pipe
    loc = getRandLoc(pipeBottom);
    joulie.animate({top: loc.y, left: loc.x},
      { easing: fabric.util.ease.easeInSine,
        duration: 3000,
        onChange: function() {
          _rgb = Math.min(joulie.get('_rgb') + 1, 220);
          if (joulie.get('_solar')) {
            joulie.set({fill: new fabric.Color('rgb('+_rgb+', '+_rgb+', 255)').toHex(), _rgb: _rgb});
          } else {
            joulie.set({fill: new fabric.Color('rgb(255, '+_rgb+', '+_rgb+')').toHex(), _rgb: _rgb});
          }
        },
        onComplete: function() {
          // center
          loc = getRandLoc(pipeCenter);
          joulie.animate({top: loc.y, left: loc.x},
            { duration: 1100,
              onChange: function() {
                _rgb = Math.min(joulie.get('_rgb') + 1, 220);
                if (joulie.get('_solar')) {
                  joulie.set({fill: new fabric.Color('rgb('+_rgb+', '+_rgb+', 255)').toHex(), _rgb: _rgb});
                } else {
                  joulie.set({fill: new fabric.Color('rgb(255, '+_rgb+', '+_rgb+')').toHex(), _rgb: _rgb});
                }
              },
              onComplete: function() {
                // middle of the target pipe
                var target,
                    r = Math.random();
                if (r < Math.min((percentOpen1 + percentOpen2), 1) - 0.1){
                  p1 = percentOpen1 * (1/(percentOpen1 + percentOpen2));
                  if (Math.random() < p1) {
                    target = externalTown1;
                  } else {
                    target = externalTown2;
                  }
                } else {
                  target = town;
                }
                loc = getRandLoc(target[0]);
                joulie.animate({top: loc.y, left: loc.x},
                  { easing: fabric.util.ease.easeOutSine,
                    duration: 1000,
                    onComplete: function() {
                      // end of the target pipe
                      loc = getRandLoc(target[1]);
                      joulie.animate({top: loc.y, left: loc.x},
                        { easing: fabric.util.ease.easeInSine,
                          duration: 900,
                          onComplete: function() {
                            if (target ==externalTown2) {
                              total = 1 * getCookie();
                              setCookie(total+1);
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
        }
      });
  }



  canvas.renderAll();
}
} else {
  mainLoop = function() {
    var numjoulies = 1 * getCookie();
    setCookie(0);

    if (numjoulies) {
      loc = getRandLoc(externalTown1[1]);
      joulie = new fabric.Circle({ radius: 8, fill: new fabric.Color('rgb(255, 255, 255)').toHex(), stroke: 'black', top: loc.y, left: loc.x, selectable: false, _rgb: 50, _solar: false });
      canvas.add(joulie);

      canvas.sendToBack(joulie);

      (function(joulie) {
        if (percentOpen1 > 0.5) {
          loc = getRandLoc(externalTown1[0]);
          joulie.animate({top: loc.y, left: loc.x},
          { easing: fabric.util.ease.easeOutSine,
            duration: 2000,
            onComplete: function() {
              // center
              loc = getRandLoc(pipeCenter);
              joulie.animate({top: loc.y, left: loc.x},
                { duration: 1100,
                  onComplete: function() {
                    // middle of the target pipe
                    target = town;
                    loc = getRandLoc(target[0]);
                    joulie.animate({top: loc.y, left: loc.x},
                      { easing: fabric.util.ease.easeOutSine,
                        duration: 2000,
                        onComplete: function() {
                          // end of the target pipe
                          loc = getRandLoc(target[1]);
                          joulie.animate({top: loc.y, left: loc.x},
                            { easing: fabric.util.ease.easeInSine,
                              duration: 900,
                              onComplete: function() {
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
            }
          });
        } else {
          loc = getRandLoc({minX: 40, maxX: 90, minY: 365, maxY: 370});
          joulie.animate({top: loc.y, left: loc.x},
          { easing: fabric.util.ease.easeOutElastic,
            duration: 4000,
            onComplete: function() {
              loc = getRandLoc({minX: -10, maxX: 60, minY: 360, maxY: 380});
              joulie.animate({top: loc.y, left: loc.x},
                { duration: 1000,
                  onComplete: function() {
                    canvas.remove(joulie);
                  }
                }
              );
            }
          });
        }
      })(joulie);
    }
    canvas.renderAll();
  }
}

setInterval(mainLoop, 100);
