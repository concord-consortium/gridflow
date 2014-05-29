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

setCookie(0);

var canvas = new fabric.Canvas('main-canvas'),
    width = 500,
    height = 700,
    joulies = [],
    town = { },
    externalTown1 = { },
    externalTown2 = { },
    percentOpen1 = 0,
    percentOpen2 = 0,
    handle1 = new fabric.Rect({ left: 90, top: 340, height: 80, width: 35, fill: '#AAA', stroke: 'black', strokeWidth: 3, lockScalingX: true, lockScalingY: true, lockMovementX: true, hasBorders: false, hasControls: false}),
    handle2 = new fabric.Rect({ left: 360, top: 340, height: 80, width: 35, fill: '#AAA', stroke: 'black', strokeWidth: 3, lockScalingX: true, lockScalingY: true, lockMovementX: true, hasBorders: false, hasControls: false});


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
  if (handle.top > 380) {
    percentOpen = (handle.top - 375)/25;
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
    var left = 100 + Math.random() * (width-200),
        joulie;
    if (left < 250) {
      joulie = new fabric.Circle({ radius: 8, fill: new fabric.Color('rgb(255, 50, 50)').toHex(), stroke: 'black', top: height-25, left: left, selectable: false, _rgb: 50, _solar: true });
    } else {
      joulie = new fabric.Circle({ radius: 8, fill: new fabric.Color('rgb(50, 50, 255)').toHex(), stroke: 'black', top: height-25, left: left, selectable: false, _rgb: 50, _solar: false });
    }
    canvas.add(joulie);

    canvas.sendToBack(joulie);

    leftOffset = 3-(Math.random() * 6);

    // bottom of the bottom pipe
    joulie.animate({top: 520, left: 235+leftOffset},
      { easing: fabric.util.ease.easeInSine,
        duration: 3000,
        onChange: function() {
          _rgb = Math.min(joulie.get('_rgb') + 1, 220);
          if (joulie.get('_solar')) {
            joulie.set({fill: new fabric.Color('rgb(255, '+_rgb+', '+_rgb+')').toHex(), _rgb: _rgb});
          } else {
            joulie.set({fill: new fabric.Color('rgb('+_rgb+', '+_rgb+', 255)').toHex(), _rgb: _rgb});
          }
        },
        onComplete: function(){return function() {
          // top of the bottom pipe
          leftOffset = 10-(Math.random() * 20);
          topOffset = 5-(Math.random() * 10);
          joulie.animate({top: 490+topOffset, left: 235+leftOffset},
            { easing: fabric.util.ease.easeOutSine,
              duration: 500,
              onChange: function() {
                _rgb = Math.min(joulie.get('_rgb') + 1, 220);
                if (joulie.get('_solar')) {
                  joulie.set({fill: new fabric.Color('rgb(255, '+_rgb+', '+_rgb+')').toHex(), _rgb: _rgb});
                } else {
                  joulie.set({fill: new fabric.Color('rgb('+_rgb+', '+_rgb+', 255)').toHex(), _rgb: _rgb});
                }
              },
              onComplete: function() {
                // center of the chamber
                var target,
                    r = Math.random();
                if (r < Math.min((percentOpen1 + percentOpen2), 1) - 0.04){
                  p1 = percentOpen1 * (1/(percentOpen1 + percentOpen2));
                  if (Math.random() < p1) {
                    target = externalTown1;
                  } else {
                    target = externalTown2;
                  }
                } else {
                  target = town;
                }
                if (target == town) {
                  _left = 235+(100-(Math.random() * 200));
                  _top = 340+(50-(Math.random() * 100));
                } else if (target == externalTown1) {
                  _left = 190+(40-(Math.random() * 80));
                  _top = 440+(40-(Math.random() * 80));
                } else {
                  _left = 280+(40-(Math.random() * 80));
                  _top = 440+(40-(Math.random() * 80));
                }
                joulie.animate({top: _top, left: _left},
                  { easing: fabric.util.ease.easeInSine,
                    duration: 1200,
                    onComplete: function() {
                      // bottom of the top pipe
                      if (target == town) {
                        _left = 235+(10-(Math.random() * 20));
                        _top = 190;
                      } else if (target == externalTown1) {
                        _left = 140+(10-(Math.random() * 20));
                        _top = handle1.get('_targetY')-8;
                      } else {
                        _left = 330+(10-(Math.random() * 20));
                        _top = handle2.get('_targetY')-8;
                      }
                      joulie.animate({top: _top, left: _left},
                        { easing: fabric.util.ease.easeOutSine,
                          duration: 1900,
                          onComplete: function() {
                            // top of the top pipe
                            if (target == town) {
                              _left = 235;
                              _top = 140;
                            } else if (target == externalTown1) {
                              _left = 0;
                              _top = 380;
                            } else {
                              _left = 490;
                              _top = 380;
                            }
                            joulie.animate({top: _top, left: _left},
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
        }}()
      });
    joulies.push(joulie);
  }



  canvas.renderAll();
}
} else {
  mainLoop = function() {
    var numjoulies = 1 * getCookie();
    setCookie(0);

    while (numjoulies-- > 0) {
      joulie = new fabric.Circle({ radius: 8, fill: new fabric.Color('rgb(255, 255, 255)').toHex(), stroke: 'black', top: 380, left: 0, selectable: false, _rgb: 50, _solar: false });
      canvas.add(joulie);

      canvas.sendToBack(joulie);

      _left = 140+(10-(Math.random() * 20));
      _top = handle1.get('_targetY')-8;
      joulie.animate({top: _top, left: _left},
      { easing: fabric.util.ease.easeInSine,
        duration: 3000,
        onComplete: function() { return function() {
          // center of the chamber
          _left2 = 235+(100-(Math.random() * 200));
          _top2 = 340+(50-(Math.random() * 100));
          joulie.animate({top: _top2, left: _left2},
            { easing: fabric.util.ease.easeInSine,
              duration: 1200,
              onComplete: function() {
                // bottom of the top pipe
                  _left = 235+(10-(Math.random() * 20));
                  _top = 190;
                joulie.animate({top: _top, left: _left},
                  { easing: fabric.util.ease.easeOutSine,
                    duration: 1900,
                    onComplete: function() {
                      // top of the top pipe
                        _left = 235;
                        _top = 140;
                      joulie.animate({top: _top, left: _left},
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
        }}()


      });
    }
    canvas.renderAll();
  }
}

setInterval(mainLoop, 50);
