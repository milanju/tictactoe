Meteor.publish('userSessions', function () {
  return UserSessions.find();
});

Meteor.publish('queue', function () {
  return Queue.find();
});

Meteor.publish('boards', function () {
  return Boards.find();
});
