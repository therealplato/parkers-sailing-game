gameState = 

{
  gameID = null,
  gamePhase = 'staging'
  players: ['tom','jerry'],
  elapsedTurns = 0,
  weather: [],
  ships: 
  [  //owned by player 0, player 1...
    { p:1,
      q:3,
      heading:0,  // 0 2 4 6 8 10 12'ck
      hullhp:[100,100],     // port and starboard hp
      masts:[[0,0,0][0,0,0][0,0,0]], //ascending order sails, 0=reefed 1=raised
      //port and stbd guns, fore to aft, 0 unloaded 1 loaded 2 runout
      guns:[[0,0,0,0,0],[0,0,0,0,0]], 
      crew:
        [ 'mast',[0,2]], ['deck'], ['gun',[1,4]] ... ]
    } ,
    { p:2,
      masts: ...
    }
  ],  //end of gameState.ships
  turnState:  //to remember in-progress turns, these will affect gamestate @EOT
  {
    activePlayer:0, //tom
    lastCompletedPhase: 'weather', // or 'move' or 'orders'
    path:[[1,3],[3,3]],   // start..finish or null
    orders:
      [ ['reef',[0,2]], ['hoist',[0,2]], null, ['to_rigging'],['to_deck'], 
        ['load_gun',[0,1]], ['run_out_gun',[0,1]], ['fire_gun',[0,1]] ...
      ]  // or null if no orders placed yet
  }
};

turnList = 
  [
    {  //turns[0], before first turn i.e. initial conditions
      weather: [], //this will be an array of vertex objects with theta set
      ships:
      [
        {
          p:1,
          pos:[y:4,z:3],
          masts:[ [],[],[] ], 
          crew:[
                 {portguns:0, stbdguns:0, gundeck:10, rigging:10, masts:[0,0,0]}
  //      masts:[ [1,1,1],[1,1,1],[1,1,1] ],  // all sails out
  //      masts:[ [0,0,0],[0,0,1],[1,1,1] ],  // foremast and main topsail out
  //      masts:[ [0,0,0],  null ,[1,1,1] ],  // foremast out, mainmast broken
          log:null
        }, {
          p:2, 
          ...
        }
      ],  //end of ships state
    },    
    {
      weather: [],
      ships:   
      [
        {
          p:1,
          pos:[y:8,z:4],
          crew: 
          masts:[ [1,1,1],[1,1,1],[1,1,1] ],  // all sails out
          portguns: [0,0,0,0,0],              // guns shipped
          stbdguns: [0,0,1,2,3],              // two shipped, one oaded, on
          log:[{phase:'move', path:[12, 12, 12, 12, 2]},
               {phase:'orders', stations:
                 {portguns:0, stbdguns:0, gundeck:10, rigging:10, masts:[0,0,0]}
                   
              ]   
  //  or  log:['orders',[],'move',[]]
        }
      ],
    },    
  ]
