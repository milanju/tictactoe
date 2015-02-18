Template.queue.helpers({
  name: function(){
    return UserSessions.findOne({"id": Session.get("id")}).name;
  }
});

Template.queue.events({
  "click #leave-queue-button": function(event, template){
    Meteor.call("removeFromQueue", Session.get("id"));
    Meteor.call("userSessionsUpdate", {"id": Session.get("id")}, {$set: {"status": "loggedOut"} });
  }
});
