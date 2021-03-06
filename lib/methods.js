findBoard = function (playerId) {
  var board = Boards.findOne({"PlayerA": playerId});
  if (board !== undefined) return board;
  board = Boards.findOne({"PlayerB": playerId});
  if (board !== undefined) return board;
};

checkIfDraw = function (playerId, board) {
  var grid = board.grid;
  for (i = 0; i < 9; i++) {
    if(grid[i].status === 0) return false;
  }
  return true;
};

checkIfWon = function (playerId) {
  var board = findBoard(playerId);
  var myValue;
  if (board.PlayerA === playerId) myValue = 1;
  else myValue = 2;
  var grid = board.grid;
  if (myValue === grid[0].status &&
     myValue === grid[1].status &&
     myValue === grid[2].status) return true;
  if (myValue === grid[3].status &&
     myValue === grid[4].status &&
     myValue === grid[5].status) return true;
  if (myValue === grid[6].status &&
     myValue === grid[7].status &&
     myValue === grid[8].status) return true;
  if (myValue === grid[0].status &&
     myValue === grid[3].status &&
     myValue === grid[6].status) return true;
  if (myValue === grid[1].status &&
     myValue === grid[4].status &&
     myValue === grid[7].status) return true;
  if (myValue === grid[2].status &&
     myValue === grid[5].status &&
     myValue === grid[8].status) return true;
  if (myValue === grid[0].status &&
     myValue === grid[4].status &&
     myValue === grid[8].status) return true;
  if (myValue === grid[2].status &&
     myValue === grid[4].status &&
     myValue === grid[6].status) return true;
  return false;
};
Meteor.methods({
  keepalive: function (id) {
    UserSessions.update({'id': id}, {$set: {last_seen: (new Date()).getTime()}});
  },
  removeFromQueue: function (id) {
    Queue.remove({"id": id});
  },
  userSessionsInsert: function (obj) {
    UserSessions.insert(obj);
  },
  userSessionsUpdate: function (obj1, obj2) {
    UserSessions.update(obj1, obj2);
  },
  queueInsert: function (obj) {
    Queue.insert(obj);
  },
  openGame: function (id1, id2) {
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
  cleanBoards: function (id) {
    var board;
    var boardA = Boards.findOne({"PlayerA": id});
    var boardB = Boards.findOne({"PlayerB": id});
    if(boardA !== undefined){
      board = boardA;
      Boards.update(board, { $set: {turn: "ALeft"} });
      if(board && UserSessions.findOne({"id": board.PlayerB}) === undefined){
        Boards.remove({"PlayerA": id});
      }
    } else if(boardB !== undefined){
      board = boardB;
      Boards.update(board, { $set: {turn: "BLeft"}});
      if(board && UserSessions.findOne({"id": board.PlayerA}) === undefined){
        Boards.remove({"PlayerB": id});
      }
    }
  },
  switchGrid: function (buttonId, playerId) {
    var editValue;
    var board = findBoard(playerId);
    if (board.PlayerA === playerId) {
      editValue = 1;
    } else editValue = 2;
    if (board.turn === playerId && board.grid[buttonId].status === 0) {
      board.grid[buttonId] = {id: buttonId, status: editValue};
      if (editValue === 1) {
        Boards.update({PlayerA: playerId}, {$set: {"grid": board.grid}});
        if (checkIfWon(playerId)) {
          board.turn = "AWin";
          Boards.update({PlayerA: playerId}, {$set: {"turn": "AWin"}});
        } else Boards.update({PlayerA: playerId}, {$set: {"turn": board.PlayerB}});
      }
      if (editValue === 2) {
        Boards.update({PlayerB: playerId}, {$set: {"grid": board.grid}});
        if (checkIfWon(playerId)) {
          board.turn = "BWin";
          Boards.update({PlayerB: playerId}, {$set: {"turn": "BWin"}});
        } else Boards.update({PlayerB: playerId}, {$set: {"turn": board.PlayerA}});
      }
      if (!(board.turn === "AWin" || board.turn ==="BWin") && checkIfDraw(playerId, board)) {
        Boards.update(findBoard(playerId), {$set: {"turn": "draw"}});
      }
    }
  },
});
