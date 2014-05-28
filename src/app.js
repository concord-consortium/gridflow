var canvas = new fabric.Canvas('main-canvas'),
    width = 500,
    height = 700,
    joulies = [],
    town = new fabric.Circle({ radius: 40, fill: '#000', top: 0, left: (width/2)-40, _centerX: (width/2), _centerY: 40, selectable: false }),
    externalTown1 = new fabric.Rect({ left: 0, top: 200, height: 100, width: 10, fill: '#0F0',  _centerX: 5, _centerY: 250, selectable: false}),
    externalTown2 = new fabric.Rect({ left: width-10, top: 200, height: 100, width: 10, fill: '#0FF',  _centerX: width-5, _centerY: 250, selectable: false}),
    solarLine = new fabric.Rect({ left: 0, top: height-25, height: 15, width: width/2, fill: '#F55', selectable: false}),
    windLine = new fabric.Rect({ left: width/2, top: height-25, height: 15, width: width/2, fill: '#55F', selectable: false}),
    handle = new fabric.Rect({ left: width/2-10, top: height-45, height: 40, width: 20, fill: '#000', lockScalingX: true, lockScalingY: true, lockMovementY: true, hasBorders: false, hasControls: false});




canvas.backgroundColor = '#84b0b4';

canvas.add(town);
canvas.add(externalTown1);
canvas.add(externalTown2);
canvas.add(solarLine);
canvas.add(windLine);
canvas.add(handle);

canvas.on('object:moving', function(e) {
  solarLine.width = handle.left;
  windLine.left = handle.left;
  windLine.width = width - windLine.left;
});

canvas.renderAll();

mainLoop = function() {
  if (Math.random() < 0.2) {
    var left = Math.random() * width,
        joulie;
    if (left < (handle.left)) {
      joulie = new fabric.Circle({ radius: 8, fill: new fabric.Color('rgb(255, 50, 50)').toHex(), top: height-25, left: left, selectable: false, _rgb: 50, _solar: true });
    } else {
      joulie = new fabric.Circle({ radius: 8, fill: new fabric.Color('rgb(50, 50, 255)').toHex(), top: height-25, left: left, selectable: false, _rgb: 50, _solar: false });
    }
    canvas.add(joulie);

    var target,
        r = Math.random();
    if (r < 0.05){
      target = externalTown1;
    } else if (r < 0.1) {
      target = externalTown2;
    } else {
      target = town;
    }

    joulie.animate({top: target._centerY-8, left: target._centerX-8},
      { easing: fabric.util.ease.easeInSine,
        duration: 3000,
        onChange: function(o){return function() {
          _rgb = Math.min(o.get('_rgb') + 2, 255);
          if (o.get('_solar')) {
            o.set({fill: new fabric.Color('rgb(255, '+_rgb+', '+_rgb+')').toHex(), _rgb: _rgb});
          } else {
            o.set({fill: new fabric.Color('rgb('+_rgb+', '+_rgb+', 255)').toHex(), _rgb: _rgb});
          }
        }}(joulie),
        onComplete: function(o){return function() {
          canvas.remove(o);
        }}(joulie)
      });
    joulies.push(joulie);
  }



  canvas.renderAll();
}

setInterval(mainLoop, 50);
