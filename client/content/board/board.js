Meteor.subscribe("boards");

findBoard = function() {
  if(Boards.findOne({"PlayerA": Session.get("id")}) !== undefined) {
    return Boards.findOne({"PlayerA": Session.get("id")});
  } else if((Boards.findOne({"PlayerB": Session.get("id")}) !== undefined)) {
    return Boards.findOne({"PlayerB": Session.get("id")});
  }
};

findOpponent = function(){
  var board = findBoard();
  if(board.PlayerA === Session.get("id")) return UserSessions.findOne({"id": board.PlayerB});
  if(board.PlayerB === Session.get("id")) return UserSessions.findOne({"id": board.PlayerA});
};

Template.board.helpers({
  board: function(){
    if(Boards.findOne({"PlayerA": Session.get("id")}) !== undefined) return Boards.findOne({"PlayerA": Session.get("id")});
    if(Boards.findOne({"PlayerB": Session.get("id")}) !== undefined) return Boards.findOne({"PlayerB": Session.get("id")});
  },
  you: function(){
    return UserSessions.findOne({"id": Session.get("id")}).name;
  },
  opponent: function(){
    return findOpponent().name;
  },
  break: function(){
    if(this.id === 2 || this.id === 5 || this.id === 8){
      return true;
    } else return false;
  },
  turn: function(){
    var board = findBoard();
    if(board.turn ==="draw") return "Draw.";
    if(board.turn === board.PlayerA && UserSessions.findOne({"id": board.PlayerA}).id === findOpponent().id)
      return UserSessions.findOne({"id": board.PlayerA}).name + "'s turn.";
    if(board.turn === board.PlayerB && UserSessions.findOne({"id": board.PlayerB}).id === findOpponent().id)
      return UserSessions.findOne({"id": board.PlayerB}).name + "'s turn.";
    if(board.turn === board.PlayerA && UserSessions.findOne({"id": board.PlayerA}).id !== findOpponent().id)
      return "Your turn.";
    if(board.turn === board.PlayerB && UserSessions.findOne({"id": board.PlayerB}).id !== findOpponent().id)
      return "Your turn.";
    if(board.turn === "ALeft" || board.turn === "BLeft") return "Opponent has left the game.";
    if(board.turn === "AWin" && UserSessions.findOne({"id": board.PlayerA}).id === UserSessions.findOne({"id": Session.get("id")}).id)
      return "You have won the game.";
    if(board.turn === "AWin" && UserSessions.findOne({"id": board.PlayerA}).id !== UserSessions.findOne({"id": Session.get("id")}).id)
      return UserSessions.findOne({"id": board.PlayerA}).name + " has won the game.";
    if(board.turn === "BWin" && UserSessions.findOne({"id": board.PlayerB}).id === UserSessions.findOne({"id": Session.get("id")}).id)
      return "You have won the game.";
    if(board.turn === "BWin" && UserSessions.findOne({"id": board.PlayerB}).id !== UserSessions.findOne({"id": Session.get("id")}).id)
      return UserSessions.findOne({"id": board.PlayerB}).name + " has won the game.";
  },
  animate: function(){
    if(this.status !== 0){
      return "flipInX";
    } else return "";
  }
});

Template.board.events({
  "click .grid-button": function(event, template){
    Meteor.call("switchGrid", this.id, Session.get("id"));
  },
  "click #leave-game-button": function(event, template){
    location.reload();
  }
});
