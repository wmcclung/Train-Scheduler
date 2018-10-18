// Initialize Firebase
var config = {
  apiKey: "AIzaSyCVJRNVq1CbBcLHTXnskFqzgIYmyA390Tw",
  authDomain: "train-scheduler-6dc6f.firebaseapp.com",
  databaseURL: "https://train-scheduler-6dc6f.firebaseio.com",
  projectId: "train-scheduler-6dc6f",
  storageBucket: "train-scheduler-6dc6f.appspot.com",
  messagingSenderId: "144782386448"
};
firebase.initializeApp(config);

// Create a variable to reference the database
var database = firebase.database();

//Run Time
setInterval(function(startTime) {
  $("#timer").html(moment().format("hh:mm a"));
}, 1000);

// Capture Submission
$("#submit").on("click", function() {
  // Don't refresh the page!
  event.preventDefault();

  // Input Values on new train information.
  var train = $("#trainname-input")
    .val()
    .trim();
  var destination = $("#destination-input")
    .val()
    .trim();
  var frequency = $("#frequency-input")
    .val()
    .trim();
  var firstTime = $("#firsttime-input")
    .val()
    .trim();

  // Display values under current train schedule
  var trainInfo = {
    formtrain: train,
    formdestination: destination,
    formfrequency: frequency,
    formfirsttime: firstTime,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  };
  //Push the data so that it doesnt overwrite.
  database.ref().push(trainInfo);

  // Clear all of the inputs
  $("#trainname-input").val("");
  $("#destination-input").val("");
  $("#frequency-input").val("");
  $("#firsttime-input").val("");
});

// FB Watcher Load values
database.ref().on("child_added", function(childSnapshot, prevChildKey) {
  var train = childSnapshot.val().formtrain;
  var destination = childSnapshot.val().formdestination;
  var frequency = childSnapshot.val().formfrequency;
  var firstTime = childSnapshot.val().formfirsttime;

  // First Time (pushed back 1 year to make sure it comes before current time)
  var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");

  //Moment for Current Time
  var currentTime = moment();

  //Get Timer Functioning
  $("#timer").text(currentTime.format("hh:mm a"));

  // Math the Difference
  var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

  // Time Apart (remainder)
  var tRemainder = diffTime % frequency;

  //Determine Minutes Away
  var minutesAway = frequency - tRemainder;

  //Determine Next Train Arrival
  var nextArrival = moment()
    .add(minutesAway, "minutes")
    .format("hh:mm a");

  //adds back updated information
  $("#train-table > tbody").append(
    "<tr><td>" +
      '<i class="fa fa-trash" id="trashcan" aria-hidden="true"></i>' +
      "</td><td>" +
      train +
      "</td><td>" +
      destination +
      "</td><td>" +
      frequency +
      "</td><td>" +
      nextArrival +
      "</td><td>" +
      minutesAway +
      "</td></tr>"
  );
});

// delete the row. Couldnt figure this out how to remove from both the doc and firebase.
$("body").on("click", ".fa-trash", function() {
  $(this)
    .closest("tr")
    .remove();
});

// Update minutes away by triggering change in fb
function timeUpdater() {
  $("#train-table > tbody").empty();

  database.ref().on("child_added", function(childSnapshot, prevChildKey) {
    var train = childSnapshot.val().formtrain;
    var destination = childSnapshot.val().formdestination;
    var frequency = childSnapshot.val().formfrequency;
    var firstTime = childSnapshot.val().formfirsttime;

    // First Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");

    // Current Time
    var currentTime = moment();

    // $("#timer").html(h + ":" + m);
    $("#timer").text(currentTime.format("hh:mm a"));
    // Math the Difference
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

    // Time Apart (remainder)
    var tRemainder = diffTime % frequency;

    //Determine Minutes Away
    var minutesAway = frequency - tRemainder;

    //Determine Next Train Arrival
    var nextArrival = moment()
      .add(minutesAway, "minutes")
      .format("hh:mm a");

    //want to push to table to add new train and its info

    $("#train-table > tbody").append(
      "<tr><td>" +
        '<i class="fa fa-trash" aria-hidden="true"></i>' +
        "</td><td>" +
        train +
        "</td><td>" +
        destination +
        "</td><td>" +
        frequency +
        "</td><td>" +
        nextArrival +
        "</td><td>" +
        minutesAway +
        "</td></tr>"
    );
  });
}

setInterval(timeUpdater, 6000);
