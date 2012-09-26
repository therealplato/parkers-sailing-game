var http     = require('http');
var express  = require('express');
var app      = module.exports = express();
var server   = http.createServer(app);
var io       = require('socket.io').listen(server)
var nano     = require('nano')('http://localhost:5984');
//var async    = require('async');
//var saildb   = nano.use('sailing');

// Configure some Express settings
app.configure(function(){
  app.set('views', __dirname);  // 'res.render' template dir
  app.set('view engine', 'jade');     // assume .jade extension on templates
  app.set('view options', { layout: false });  //don't use layout.jade
  app.use(express.logger('dev'));
  app.use(express.bodyParser());      // both used for forms
  app.use(express.methodOverride());  // "    "    "   "
  app.use(app.router);                // try to match req with a route
  app.use(express.static(__dirname)); //try static files if unrouted
});

app.get('/', function(req,res) {
  res.render('index',{});
});

app.get('/yarr/:id', function(req,res) {
//  saildb.fetchGamestate(req.params.id, function(e,gamestate){
//    if(!e){
  gamestate= 
  {
    gameID : "foobar",
    gamePhase : 'staging',
    players: ['tom','jerry'],
    elapsedTurns : 0,
    weather: [],
    ships: 
    [  //owned by player 0, player 1...
    { 
      p:3,
      q:3,
      heading:Math.PI/6,  // 1'ck
      hullhp:[100,100],     // port and starboard hp
      masts:[[0,0,0],[0,0,0],[0,0,0]], //low to hi sails, 0 reefed 1 raised
      //port and stbd guns, fore to aft, 0 unloaded 1 loaded 2 runout
      guns:[[0,0,0,0,0],[0,0,0,0,0]], 
      crew:
       [ ['mast',[0,2]], ['deck'], ['gun',[1,4]] ]
    },{ 
      p:6,
      q:6,
      heading:3*Math.PI/6,  // 1'ck
      hullhp:[100,100],     // port and starboard hp
      masts:[[0,0,0],[0,0,0],[0,0,0]], //low to hi sails, 0 reefed 1 raised
      //port and stbd guns, fore to aft, 0 unloaded 1 loaded 2 runout
      guns:[[0,0,0,0,0],[0,0,0,0,0]], 
      crew:
       [ ['mast',[0,2]], ['deck'], ['gun',[1,4]] ]
    },{ 
      p:0,
      q:0,
      heading:5*Math.PI/6,  // 1'ck
      hullhp:[100,100],     // port and starboard hp
      masts:[[0,0,0],[0,0,0],[0,0,0]], //low to hi sails, 0 reefed 1 raised
      //port and stbd guns, fore to aft, 0 unloaded 1 loaded 2 runout
      guns:[[0,0,0,0,0],[0,0,0,0,0]], 
      crew:
       [ ['mast',[0,2]], ['deck'], ['gun',[1,4]] ]
    }
    ],  //end of gameState.ships
    turnState:  //to remember in-progress turns, these will affect gamestate @EOT
    {
      activePlayer:0, //tom
      lastCompletedPhase: 'weather', // or 'move' or 'orders'
      path:[[0,0],[1,2],[3,3]],   // start..finish or null
      orders:
        [ ['reef',[0,2]], ['hoist',[0,2]], null, ['to_rigging'],['to_deck'], 
          ['load_gun',[0,1]], ['run_out_gun',[0,1]], ['fire_gun',[0,1]]
        ]  // or null if no orders placed yet
    }
  };
 //   {id:"foobar", weather:[],ships:[{y:0,z:0}], players:[], gamePhase:'staging'}
  shipDefault = { 
    p:0,
    q:0,
    heading:7*Math.PI/6,  // 1'ck
    hullhp:[100,100],     // port and starboard hp
    masts:[[0,0,0][0,0,0][0,0,0]], //low to hi sails, 0 reefed 1 raised
    //port and stbd guns, fore to aft, 0 unloaded 1 loaded 2 runout
    guns:[[0,0,0,0,0],[0,0,0,0,0]], 
    crew:
     [ ['mast',[0,2]], ['deck'], ['gun',[1,4]] ]
  };

  gamephase=gamestate.gamePhase;
  if (gamephase=='staging' || gamephase=='on') {  // join as spec
    io.sockets.on('connection', function(socket) {
      console.log('got a connection from client socket');
      socket.on('myhandle', function(handle) {
        console.log('New player: '+handle);
        console.log('putting '+handle+' in room '+gamestate.id);
        gamestate.players.push(handle);
        gamestate.ships.push(shipDefault);
        socket.join(gamestate.id);    //gamestate.id is a string
        //catch up the player who just joined
        socket.emit('initialState', {target:handle, state:gamestate});
        socket.broadcast.to(gamestate.id).send('srv: '+handle+' joined as spec');
     // socket.broadcast.to(game.id).send('srv: '+req.user.handle+' joined as spec');
  //        otherSocketListeners(socket);
      });
    });
  } else { res.redirect('/yarr/'+req.params.id+'/recap') };
  res.render('index', {});
//  } else { res.send('Game not found') };
});

io.sockets.on('connection', function (socket) {
    socket.emit('online',{foo:'ping'});
    socket.on('saveClicked', function (data) {
        console.log(data);
        socket.emit('ack', data);
    });
    socket.on('hexClicked', function (data) {

    //    nano.request({db:"persp2"}, function(_,uuids){console.log(uuids); });
        console.log(data);
        socket.emit('ack', data);
    });
    socket.on('pong', function(data) {
        console.log("got pong:"+data);
    });
    socket.emit('activate', {'p':3,'q':3,'color':'#333333'});
});


server.listen(3210);
