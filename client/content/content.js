Meteor.subscribe("userSessions");
Meteor.subscribe("queue");
// Set Session id
if(Session.get('id') === undefined){
  Session.set('id', Random.id());
  Meteor.call("userSessionsInsert", {"id": Session.get('id'), status: "loggedOut", last_seen: (new Date()).getTime()});
}

// Set heartbeat function, to detect disconnected clients
Meteor.setInterval(function () {
  Meteor.call('keepalive', Session.get('id'));
}, 5000);

// Helper to list Sessions
Template.content.helpers({
  session: function(){
    return UserSessions.find();
  },
  loggedOut: function(){
    if(UserSessions.findOne({"id": Session.get("id")}) && UserSessions.findOne({"id": Session.get("id")}).status === "loggedOut"){
      return true;
    } else return false;
  },
  isQueued: function(){
    if(UserSessions.findOne({"id": Session.get("id")}) && UserSessions.findOne({"id": Session.get("id")}).status === "queued"){
      return true;
    } else return false;
  },
  playing: function(){
    if(UserSessions.findOne({"id": Session.get("id")}) && UserSessions.findOne({"id": Session.get("id")}).status === "playing"){
      return true;
    } else return false;
  },
  showQueue: function(){
    return Queue.find();
  }
});
