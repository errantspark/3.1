var c;
var p;
var ctx;
var pattern = function(){
  var c1 = [0x00, 0x82, 0x82];
  var c2 = [0,0,0];
  var s = 8;
  var arr = new Array(s*s);
  arr.fill(true);
  var tarr = new Uint8ClampedArray(s*s*4);
  tarr.fill(255);
  var edit = {
    paint: function(x,y,state){
      arr[y*s+x] = state;
    },
    flip: function(x,y){
      var state = !arr[y*s+x]
      arr[y*s+x] = state;
      return state;
    },
    read: function(){
      arr.forEach(function(v,i){
        var c;
        if (v) {
          c = c1;
        } else {
          c = c2;
        }
        tarr.set(c,i*4)
      })
      var imageData = new ImageData(tarr, s, s);
      return imageData;
    },
    toHex: function(){
      var binA = arr.map(e => !e+0);
      var hex = "";
      for (var i = 0; i < arr.length; i += 16){
        var bits = parseInt(binA.slice(i,i+16).join(""),2).toString(16)
        bits = ("0000"+bits).slice(-4)
        hex = hex.concat(bits);
      }
      return hex;
    },
    fromHex: function(hex){
      var arrtmp = []
      for (var i = 0; i < hex.length; i += 4){
        var bits = parseInt(hex.slice(i,i+4),16).toString(2);
        bits = ("0000000000000000"+bits).slice(-16)
        for (var j = 0; j < bits.length; j++){
          arr[i*4+j] = bits[j] === "0";
        }
      }
    },
    updateContext: function(ctx){
      var i = this.read()
      ctx.putImageData(i,0,0);
    }
  }
  return edit;
}

var updateDocument = function(p){
  p.updateContext(ctx)
  var c = ctx.canvas;
  document.getElementById("sample-pattern").style.backgroundImage = "url(" + c.toDataURL("image/png")+ ")" 
  document.body.style.backgroundImage = "url(" + c.toDataURL("image/png")+ ")"
  window.location.hash = p.toHex();
}

window.onload = function() {
  var state;
  p = pattern();
  c=document.getElementById("edit-pattern");
  ps=document.getElementById("presets-selector");
  ps.onchange = () => window.location = ps.value
  ctx=c.getContext("2d");
  ctx.fillStyle = "#008282";
  ctx.fillRect(0, 0, 8,8);
  window.onhashchange = () => {
    p.fromHex(window.location.hash.slice(1,17))
    updateDocument(p);
  }
  if (window.location.hash) {
    p.fromHex(window.location.hash.slice(1,17))
  }
  updateDocument(p);
  var paint = function(e){
    var x = Math.floor(e.offsetX*8/c.clientWidth);
    var y = Math.floor(e.offsetY*8/c.clientHeight);
    p.paint(x,y,state)
    updateDocument(p);
  } 
  c.addEventListener('mousedown', function(e){
    //zero index
    var x = Math.floor(e.offsetX*8/c.clientWidth);
    var y = Math.floor(e.offsetY*8/c.clientHeight);
    state = p.flip(x,y);
    c.addEventListener('mousemove', paint, false);
    updateDocument(p);
  })
  c.addEventListener('mouseup', function(e){
    c.removeEventListener('mousemove', paint, false);
  },false)
};
