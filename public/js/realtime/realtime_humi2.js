// A web app that lively plots data from Firebase Realtime Database nodes, thanks to plotly.js

// Firebase initialization is already done as we use "simpler project configuration".
// See https://firebase.google.com/docs/web/setup?authuser=0#host_your_web_app_using_firebase_hosting

// Number of last records to display:
const nbOfElts = 750;

// Get references to the DOM node that welcomes the plots drawn by Plotly.js
const temperaturePlotDiv = document.getElementById('temperaturePlot');
const humidityPlotDiv = document.getElementById('humidityPlot');

// Get a reference to Firebase Realime Database:
const db = firebase.database();

// Declaration of 3 objects named timestamps, temperatures and humidities
let timestamps;
let temperatures;
let humidities;

// For temperature and humidity, the common plotly.js layout
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
// Specific layout aspects for temperature chart
let temperatureLayout = JSON.parse(JSON.stringify(commonLayout));
temperatureLayout.title = '<b>Temperature live</b>';
temperatureLayout.yaxis.title = '<b>Temp (°C)</b>';
// Specific layout aspects for humidity chart
let humidityLayout = JSON.parse(JSON.stringify(commonLayout));
humidityLayout.title = '<b>Humidity live</b>';
humidityLayout.yaxis.title = '<b>Humidity (%)</b>';

db.ref(`devices-telemetry/dht11`).limitToLast(nbOfElts).once('value', snapshot => {
    // console.log(snapshot.val());
    // We reinitialize the arrays to welcome timestamps, temperatures and humidities values:

    let timestamps = [];
    let temperatures = [];
    let humidities = [];

    snapshot.forEach(childSnapshot => {
        timestamps.push(moment(childSnapshot.val().timestamp).format('YYYY-MM-DD HH:mm:ss'));
        temperatures.push(childSnapshot.val().temperature);
        humidities.push(childSnapshot.val().humidity);
    });

    // plotly.js: See https://plot.ly/javascript/getting-started/
    // Temperatures
    let temperatureTraces = {
        x: timestamps,
        y: temperatures,
        name: "DHT11"
    }
    let temperatureData = []; // last plotly object to build
    temperatureData.push(temperatureTraces);
    Plotly.newPlot(temperaturePlotDiv, temperatureData, temperatureLayout, { responsive: true });

    // Humidities
    let humidityTraces = {
        x: timestamps,
        y: humidities,
        name: "DHT11"
    }
    let humidityData = []; // last plotly object to build
    humidityData.push(humidityTraces);
    Plotly.newPlot(humidityPlotDiv, humidityData, humidityLayout, { responsive: true });
});
