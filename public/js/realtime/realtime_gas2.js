// A web app that lively plots data from Firebase Realtime Database nodes, thanks to plotly.js

// Firebase initialization is already done as we use "simpler project configuration".
// See https://firebase.google.com/docs/web/setup?authuser=0#host_your_web_app_using_firebase_hosting

// Number of last records to display:
const nbOfElts = 750;
const gasPlot = document.getElementById('gas');

// Get a reference to Firebase Realime Database:
const db = firebase.database();

// Declaration of 3 objects named timestamps, temperatures and humidities
let gas;
const commonLayout = {
    titlefont: {
        family: 'Courier New, monospace',
        size: 16,
        color: '#000'
    },
    xaxis: {
        linecolor: 'black',
        linewidth: 2
    },
    yaxis: {
        titlefont: {
            family: 'Courier New, monospace',
            size: 14,
            color: '#000'
        },
        linecolor: 'black',
        linewidth: 2,
    },
    margin: {
        r: 50,
        pad: 0
    }
};

let gasLayout = JSON.parse(JSON.stringify(commonLayout));
gasLayout.title = '<b>Gas live</b>';
gasLayout.yaxis.title = '<b>Gas (%)</b>';
// firebase.database().ref('sensor/gas').once('value', function(snapshot) {
//     snapshot.forEach(function(childSnapshot) {
//       var childKey = childSnapshot.key;
//       var childData = childSnapshot.val().gas;
//       //console.log(childData);
//       console.log(childKey)
//       // ...
//     });
//   });
// var ref = firebase.database().ref("sensor/gas");
// ref.orderByChild("gas").limitToLast(2).on("child_added", function(snapshot) {
//   // This callback will be triggered exactly two times, unless there are
//   // fewer than two dinosaurs stored in the Database. It will also get fired
//   // for every new, heavier dinosaur that gets added to the data set.
//   console.log(snapshot.key);
//   console.log(snapshot.val().gas);
// });
        db.ref(`sensor/gas`).limitToLast(nbOfElts).once('value',  function(snapshot) {
            //console.log(ts_measures.val());
            // We reinitialize the arrays to welcome timestamps, gas values:
            let timestamps = [];
            let gas= [];
            snapshot.forEach(function(childSnapshot) {
                     // var childKey = childSnapshot.key;
                      var childData = childSnapshot.val().timestamp;
                      var childData2= childSnapshot.val().gas;
                      //console.log(childData2);
                      //console.log(childData)
                      //console.log(childKey)

                      // ...
                    timestamps.push(childData);
                    gas.push(childData2);
            });


            // snapshot.forEach(function(childSnapshot) {
            //     var childKey = childSnapshot.key;
            //     var childData = childSnapshot.val();
            //     // ...
            //   });

            let gasTraces = {
                    x: timestamps,
                    y: gas,
                    name: "gas"
                }

            let gasData=[];
            gasData.push(gasTraces);
            Plotly.newPlot(gasPlot, gasData, gasLayout, { responsive: true });

        });