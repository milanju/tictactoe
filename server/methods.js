findBoard = function(playerId){
  if(Boards.findOne({"PlayerA": playerId}) !== undefined) return Boards.findOne({"PlayerA": playerId});
  if(Boards.findOne({"PlayerB": playerId}) !== undefined) return Boards.findOne({"PlayerB": playerId});
};

checkIfDraw = function(playerId){
  var board = findBoard(playerId);
  var grid = board.grid;
  for(i = 0; i < 9; i++){
    if(grid[i].status === 0) return false;
  }
  return true;
};

checkIfWon = function(playerId){
  var board = findBoard(playerId);
  var myValue;
  if(Boards.findOne({"PlayerA": playerId}) !== undefined) myValue = 1;
  else myValue = 2;
  var grid = board.grid;
  if(myValue === grid[0].status &&
     myValue === grid[1].status &&
     myValue === grid[2].status) return true;
  if(myValue === grid[3].status &&
     myValue === grid[4].status &&
     myValue === grid[5].status) return true;
  if(myValue === grid[6].status &&
     myValue === grid[7].status &&
     myValue === grid[8].status) return true;
  if(myValue === grid[0].status &&
     myValue === grid[3].status &&
     myValue === grid[6].status) return true;
  if(myValue === grid[1].status &&
     myValue === grid[4].status &&
     myValue === grid[7].status) return true;
  if(myValue === grid[2].status &&
     myValue === grid[5].status &&
     myValue === grid[8].status) return true;
  if(myValue === grid[0].status &&
     myValue === grid[4].status &&
     myValue === grid[8].status) return true;
  if(myValue === grid[2].status &&
     myValue === grid[4].status &&
     myValue === grid[6].status) return true;
  return false;
};
Meteor.methods({
  keepalive: function(id){
    UserSessions.update({'id': id}, {$set: {last_seen: (new Date()).getTime()}});
  },
  removeFromQueue: function(id){
    Queue.remove({"id": id});
  },
  userSessionsInsert: function(obj){
    UserSessions.insert(obj);
  },
  userSessionsUpdate: function(obj1, obj2){
    UserSessions.update(obj1, obj2);
  },
  queueInsert: function(obj){
    Queue.insert(obj);
  },
  openGame: function(id1, id2){
    Boards.insert({
      "PlayerA": id1,
      "PlayerB": id2,
      turn: id1,
      grid: [{id: 0, status: 0},
            {id: 1, status: 0},
            {id: 2, status: 0},
            {id: 3, status: 0},
            {id: 4, status: 0},
            {id: 5, status: 0},
            {id: 6, status: 0},
            {id: 7, status: 0},
            {id: 8, status: 0}]
    });
    UserSessions.update({"id": id1}, { $set: {"status": "playing"} });
    UserSessions.update({"id": id2}, { $set: {"status": "playing"} });
    Meteor.call("removeFromQueue", id1);
  },
  cleanBoards: function(id){
    var board;
    var id1;
    if(Boards.findOne({"PlayerA": id}) !== undefined){
      board = Boards.findOne({"PlayerA": id});
      Boards.update(board, { $set: {turn: "ALeft"} });
      if(board && UserSessions.findOne({"id": board.PlayerB}) === undefined){
        Boards.remove({"PlayerA": id});
      }
    }
    if(Boards.findOne({"PlayerB": id}) !== undefined){
      board = Boards.findOne({"PlayerB": id});
      Boards.update(board, { $set: {turn: "BLeft"}});
      if(board && UserSessions.findOne({"id": board.PlayerA}) === undefined){
        Boards.remove({"PlayerB": id});
      }
    }
  },
  switchGrid: function(buttonId, playerId){
    var editValue;
    var board;
    if(Boards.findOne({"PlayerA": playerId}) !== undefined){
      board = Boards.findOne({"PlayerA": playerId});
      editValue = 1;
    }
    if(Boards.findOne({"PlayerB": playerId}) !== undefined){
      board = Boards.findOne({"PlayerB": playerId});
      editValue = 2;
    }
    if(board.turn === playerId && board.grid[buttonId].status === 0){
      var newGrid = board.grid;
      newGrid[buttonId] = {id: buttonId, status: editValue};
      if(editValue === 1) {
        Boards.update({PlayerA: playerId}, { $set: {"grid": newGrid}});
        if(checkIfWon(playerId)){
          Boards.update({PlayerA: playerId}, { $set: {"turn": "AWin"} });
        } else Boards.update({PlayerA: playerId}, { $set: {"turn": board.PlayerB}});
      }
      if(editValue === 2) {
        Boards.update({PlayerB: playerId}, { $set: {"grid": newGrid}});
        if(checkIfWon(playerId)){
          Boards.update({PlayerB: playerId}, { $set: {"turn": "BWin"} });
        } else Boards.update({PlayerB: playerId}, { $set: {"turn": board.PlayerA}});
      }
      if(checkIfDraw(playerId)){
        Boards.update(findBoard(playerId), { $set: {"turn": "draw"} });
      }
    }
  },
});

Meteor.setInterval(function() {
  var now = (new Date()).getTime();
  UserSessions.find({last_seen: {$lt: (now - 15 * 1000)}}).forEach(function (user) {
    console.log("clean board!!");
    Meteor.call("cleanBoards", user.id);
    UserSessions.remove(user);
    if(Queue.find({"id": user.id})){
      Queue.remove({"id": user.id});
    }
  });
});