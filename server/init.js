// Clean up disconnected users
Meteor.setInterval(function() {
  var now = (new Date()).getTime();
  UserSessions.find({last_seen: {$lt: (now - 15 * 1000)}}).forEach(function (user) {
    Meteor.call("cleanBoards", user.id);
    UserSessions.remove(user);
    if(Queue.find({"id": user.id})){
      Queue.remove({"id": user.id});
    }
  });
});
