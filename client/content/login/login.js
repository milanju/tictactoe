Template.login.helpers({

});

Template.login.events({
  "submit #login-form": function (event, template) {
    event.preventDefault();
    Meteor.call("userSessionsUpdate", {"id": Session.get("id")}, { $set: {"name": event.target.loginText.value} });
    if (Queue.find().count() === 0) {
      Meteor.call("userSessionsUpdate", {"id": Session.get("id")}, { $set: {"status": "queued"} });
      Meteor.call("queueInsert", {"id": Session.get("id"),"name": UserSessions.findOne({"id": Session.get("id")}).name});
    } else if (Queue.find().count() === 1) {
      Meteor.call("openGame", Queue.findOne().id, Session.get("id"));
    }
  }
});
