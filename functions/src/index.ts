/*
# Copyright Google Inc. 2018

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
*/
'use strict';

import cbor = require('cbor');

import * as admin from "firebase-admin";
import * as functions from 'firebase-functions';

const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

const iot = require('@google-cloud/iot');
const client = new iot.v1.DeviceManagerClient();
const app = admin.initializeApp();
const firestore = app.firestore();

// start cloud function
exports.configUpdate = functions.firestore
  // assumes a document whose ID is the same as the deviceid
  .document('device-configs/{deviceId}')
  .onWrite(async (change: functions.Change<admin.firestore.DocumentSnapshot>, context?: functions.EventContext) => {
    if (context) {
      console.log(context.params.deviceId);
      const request = generateRequest(context.params.deviceId, change.after.data(), false);
      return client.modifyCloudToDeviceConfig(request);
    } else {
      throw(Error("no context from trigger"));
    }
  });

exports.configUpdateBinary = functions.firestore
  // assumes a document whose ID is the same as the deviceid
  .document('device-configs-binary/{deviceId}')
  .onWrite(async (change: functions.Change<admin.firestore.DocumentSnapshot>, context?: functions.EventContext) => {
    if (context) {
      console.log(context.params.deviceId);
      const request = generateRequest(context.params.deviceId, change.after.data(), true);
      return client.modifyCloudToDeviceConfig(request);
    } else {
      throw(Error("no context from trigger"));
    }
  });

  exports.writeToFirestore = functions.pubsub.topic('control-led').onPublish(async(message) => {
    const led= message.json.led4;
    const deviceId = message.attributes.deviceId;
    const deviceRef = firestore.doc(`device-configs/${deviceId}`);
    try {
      await deviceRef.update({ 'led4': led });
      console.log(`Connectivity updated for ${deviceId}`);
    } catch (error) {
      console.error(`${deviceId} not yet registered to a user`, error);
    }
  });

  exports.dht11 = functions.pubsub.topic('telemetry').onPublish((message, context) => {
        // The onPublish() trigger function requires a handler function that receives
        // 2 arguments: one related to the message published and
        // one related to the context of the message.

        // Firebase SDK for Cloud Functions has a 'json' helper property to decode
        // the message. We also round numbers to match DHT22 accuracy.
        const temperature = message.json.temperature;
        const humidity = message.json.humidity;
        if((temperature<-40) || (temperature>80) || (humidity <0) || (humidity > 100) || (temperature==null)|| (humidity==null)) return;
        // A Pub/Sub message has an 'attributes' property. This property has itself some properties,
        // one of them being 'deviceId' to know which device published the message:
        const deviceId = message.attributes.deviceId;
        // The date the message was issued lies in the context object not in the message object:
        const timestamp = context.timestamp
        // Log telemetry activity:
        console.log(`Device=${deviceId}, Temperature=${temperature}°C, Humidity=${humidity}%, Timestamp=${timestamp}`);
        // Push to Firebase Realtime Database telemetry data sorted by device:
        const data = {
                    //deviceId: deviceId1,
                    humidity: message.json.humidity,
                    temperature: message.json.temperature,
                    timestamp: context.timestamp
        };
        insertIntoBigquery(data);
        return admin.database().ref(`devices-telemetry/${deviceId}`).push({
            timestamp: timestamp,
            temperature: temperature,
            humidity: humidity
        })
  });
  exports.gas = functions.pubsub.topic('gas').onPublish((message, context) => {
          // The onPublish() trigger function requires a handler function that receives
          // 2 arguments: one related to the message published and
          // one related to the context of the message.
  
          // Firebase SDK for Cloud Functions has a 'json' helper property to decode
          // the message. We also round numbers to match DHT22 accuracy.
          //const pir = message.json.pir;
          const gas = message.json.gas;
          if((gas==null) || (gas<0)) return;
          // A Pub/Sub message has an 'attributes' property. This property has itself some properties,
          // one of them being 'deviceId' to know which device published the message:
          const deviceId = message.attributes.deviceId;
          // The date the message was issued lies in the context object not in the message object:
          const timestamp = context.timestamp
          // Log telemetry activity:
          // Push to Firebase Realtime Database telemetry data sorted by device:
          const data = {
                      //deviceId: deviceId1,
                      gas: message.json.gas,
                      timestamp: context.timestamp
          };
          insertIntoBigquery(data);
          return Promise.all([
              admin.database().ref(`sensor/${deviceId}`).push({
                  gas: gas,
                  timestamp: timestamp
              })
              // ,
              // admin.database().ref(`chuyendong/`).set({
              //     pir: pir
                  
              // })
          ])
  });

function generateRequest(deviceId:string, configData:any, isBinary:Boolean) {
  const formattedName = client.devicePath(process.env.GCLOUD_PROJECT, functions.config().iot.core.region, functions.config().iot.core.registry, deviceId);
  let dataValue;
  if (isBinary) {
    const encoded = cbor.encode(configData);
    dataValue = encoded.toString("base64");
  } else {
    dataValue = Buffer.from(JSON.stringify(configData)).toString("base64");
  }
  return {
    name: formattedName,
    binaryData: dataValue
  };
}

 function insertIntoBigquery(data:any) {
  // TODO: Make sure you set the `bigquery.datasetname` Google Cloud environment variable.
  const dataset = bigquery.dataset(functions.config().bigquery.datasetname);
  // TODO: Make sure you set the `bigquery.tablename` Google Cloud environment variable.
  const table = dataset.table(functions.config().bigquery.tablename);
  return table.insert(data);
}
