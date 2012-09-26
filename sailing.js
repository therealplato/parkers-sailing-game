// Hex coordinates here use Sexy's pq coordinate system
// 1 unit = 1 length of the side of a hex = 1 radius of a hex to corner
// Hex centers have blank vertices between them

//(function() {   //so we can execute this whole script when it loads & namespace

var ctx={};
    ctx.playercolors=["red","#GG2211","#44GG22","#A04099"];
    ctx.state={};  //client only has to care about the state of this one game
    ctx.entities={};  //will hold gusts and ships and crew
    ctx.entities.gusts=[];
    ctx.entities.ships=[];
    ctx.entities.mycrew=[];

window.onload=function(){
  var game = new GameEngine();
  ctx.stage     = new Kinetic.Stage("map",600,600);
  ctx.gridL     = new Kinetic.Layer("grid");
  ctx.shipL     = new Kinetic.Layer("ships");
  ctx.linkL     = new Kinetic.Layer("links");
  ctx.noteL     = new Kinetic.Layer("notes");
      ctx.stage.add(ctx.shipL); ctx.stage.add(ctx.gridL);
  ctx.stage.add(ctx.linkL);    ctx.stage.add(ctx.noteL); 
  
  ctx.gridRad=10;  //grid will be 20 hexes across
  ctx.hexRad=15;   //hexes will be 30 pixels across
  ctx.sel1={};
  ctx.grid = Sexy.Grid(ctx.gridRad); //this returns a p,q grid with Sexy.Hexes
  // placed at 0,0 and adjacent. ctx.grid returns null if those coords are bad.
  for(var m = -2*ctx.gridRad; m <= 2*ctx.gridRad; m++) {
      for(var n = -2*ctx.gridRad; n <= 2*ctx.gridRad; n++) {
          var thisHex=ctx.grid[m.toString()][n.toString()]
          if(thisHex != null){  // there's a Sexy.Hex at this vertex
              newShape=new Kinetic.RegularPolygon({
                  x:Sexy.pq2xy(m,n)['x'],
                  y:Sexy.pq2xy(m,n)['y'],
                  myHex:thisHex,
                  sides: 6,
                  radius: Sexy.r(),
                  fill: "#ffffff",
                  stroke: "black",
                  alpha: 0.6,
                  strokeWidth: 1,
                  visible: 1,
              });
              newShape.on("click", function() {
                  console.log(this);
                  hexClicked(this.myHex);
              });
              thisHex['kinshape']=newShape;
              ctx.gridL.add(newShape);
          };
      };
  };


  ctx.socket = io.connect('http://localhost');

  ctx.socket.on('connect', function(){
    console.log('connected to a remote socket');
  });
  ctx.socket.on('message', function(msg){
    console.log(msg);
  });
  ctx.socket.on('initialState', function(data){
    if(data.target==ctx.handle){
      ctx.state=data.state;
      console.log('received initial state:',data);
      for(i=0;i<ctx.state.ships.length;i++) {
        var thisShip = ctx.state.ships[i];
        var aShip=new Ship();
        aShip.Vtx = new Sexy.Vertex(thisShip.p, thisShip.q, thisShip.heading);
        aShip.player=i;
        aShip.kinrect.setFill(ctx.playercolors[i]);
        ctx.shipL.add(aShip.kinrect);
        ctx.entities.ships.push(aShip);
        game.loop();
      };
    };
  });
  ctx.socket.on('stateDiffs', function(data){
    console.log('received state diffs:',data);
  });
  ctx.socket.on('online', function(data){
    console.log(data);
  });

  ctx.handle=prompt('Enter a unique handle', '');
  if(ctx.handle != null && ctx.handle != '') {
    ctx.socket.emit('myhandle',ctx.handle);
  };

  ctx.foo = new Kinetic.Rect({x:200,y:100,width:200, height:400,
      centerOffset:{x:100,y:200}, rotation:0.5});
  ctx.foo.setStroke('black');
  ctx.foo.setFill('red');
  ctx.gridL.add(ctx.foo);
  var test = new Kinetic.Rect({x:300, y:300, width:50, height:200});
  ctx.linkL.add(test);
  ctx.linkL.draw();
  ctx.stage.draw();

}; // end of window.onLoad();



hexClicked = function(h0) {
    if(ctx.state.turnState.lastCompletedPhase == ('weather')) {
 //   if(ctx.state.turnState.lastCompletedPhase == ('orders'||'weather')) {
      console.log('u tryin to move?');
      // pathAdd(h0);
    } else {
      // selectNew(h0);
    };

    shipA = ctx.entities.ships[0];
    shipA.validateMove(h0.center);
    console.log(h0);
    ctx.socket.emit('hexClicked',{p:h0.center.p,
                                  q:h0.center.q});
    console.log('Hex at ('+h0.center.p+','+
                           h0.center.q+') clicked');
};
/*  var docy=document.getElementById("docy");
    var docz=document.getElementById("docz");
    var windspeed=document.getElementById("windspeed");
    docy.innerHTML=h0.center.p;
    docz.innerHTML=h0.center.q;
    windspeed.innerHTML=ctx.state.weather(
    if(!ctx.sel1['kinshape']) {
        ctx.sel1=h0;
    };
    ctx.sel2=ctx.sel1;  
    ctx.sel2['kinshape'].moveTo(ctx.gridL);
    ctx.sel2['kinshape'].setStroke("black");
    ctx.sel1=h0;
    ctx.sel1['kinshape'].moveTo(ctx.hexL);
    ctx.sel1['kinshape'].setStroke("red");
    if(ctx.sel1['kinshape'].fill != "#FFAA77") {
        ctx.sel1['kinshape'].setFill("#FFAA77");
    } else {
        ctx.sel1['kinshape'].setFill("white");
    };
    
    draw();
    infobox=document.getElementById("info");
    infobox.value="Hai thar";
};                                                   */

GameEngine = function(ctx) {
//  this.entities = [];
//  this.canvas=null;
  this.lastUpdateTimestamp = null;
  this.deltaTime = null;
};
GameEngine.prototype.update = function(callback) {
  for(i=0;i<ctx.entities.ships.length;i++) {
    console.log('GameEngine updating ships');
    ctx.entities.ships[i].update();
  };
};
GameEngine.prototype.draw = function(callback) {
  ctx.gridL.draw();
  for(i=0;i<ctx.entities.gusts.length;i++) {
    ctx.entities.gusts[i].draw();
  };
  for(i=0;i<ctx.entities.ships.length;i++) {
    console.log('GameEngine drawing ships');
    ctx.entities.ships[i].draw();
  };
  ctx.shipL.draw();
  //ctx.stage.draw();
};
GameEngine.prototype.loop = function() {
  var now = Date.now();
  this.deltaTime = now - this.lastUpdateTimestamp;
  this.update();
  this.draw();
  this.lastUpdateTimestamp = now;
};

Ship = function() {
  this.Vtx=null;
  this.player=null;
//  this.p=null;
//  this.q=null;
//  this.heading=null;
  this.kinrect=new Kinetic.Rect({width:8, height:20, strokeWidth: 1});
  this.kinrect.setCenterOffset(0, 0);
}
Ship.prototype.update = function() {
  this.Vtx.p =  ctx.state.ships[this.player].p;
  this.Vtx.q =  ctx.state.ships[this.player].q;
  this.Vtx.theta = ctx.state.ships[this.player].heading;
};
Ship.prototype.draw = function() {
  var xy = Sexy.pq2xy(this.Vtx.p, this.Vtx.q);
  console.log(xy);
  this.kinrect.x = xy['x'] - this.kinrect.width/2;
  this.kinrect.y = xy['y'] - this.kinrect.height/2;
//  this.kinrect.rotation = this.Vtx.theta;
  this.kinrect.setRotation(this.Vtx.theta);
  this.kinrect.setStroke('black');
  this.kinrect.setFill(ctx.playercolors[this.player]);
//  ctx.stage.draw();
};
Ship.prototype.validateMove = function(v2) {
//  var v2 = Sexy.getVert(p2,q2);
//  v2 = ctx.grid.p2.q2;
  currentHex=Sexy.getHex(this.Vtx.p, this.Vtx.q);
  if((currentHex.pivotOut(this.Vtx.theta)             == v2) || // straight
     (currentHex.pivotOut(this.Vtx.theta+(Math.PI/3)) == v2) || // bear right
     (currentHex.pivotOut(this.Vtx.theta-(Math.PI/3)) == v2))   // bear left
  { // it's a valid move
    console.log('That\'s a valid move');
  } else { 
    console.log('Can\'t move there')
  };
};

      

//})(); // finish executing namespace function
