Meteor.subscribe("userSessions");
Meteor.subscribe("queue");

// Set Session id
if (Session.get('id') === undefined) {
  Session.set('id', Random.id());
  Meteor.call("userSessionsInsert", {"id": Session.get('id'), status: "loggedOut", last_seen: (new Date()).getTime()});
}

// Set heartbeat function, to detect disconnected clients
Meteor.setInterval(function () {
  Meteor.call('keepalive', Session.get('id'));
}, 5000);
