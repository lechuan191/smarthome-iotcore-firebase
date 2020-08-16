import datetime
import json
import os
import ssl
import time

import jwt
import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO
import Adafruit_DHT

from time import sleep
from firebase import firebase 
from functools import partial 
import glob
from time import strftime
import sys
import re
import serial
ser = serial.Serial('/dev/ttyACM0',9600)

# GCP parameters 
project_id = 'homeauto-277608'  # Your project ID.

registry_id2 = 'my-registry2'  # Your registry name.
registry_id3 = 'my-registry3'  # Your registry name.

device_id2 = 'dht11'  # Your device name.
device_id3 = 'gas'  # Your device name.

private_key_file2 = 'rsa_private2.pem'  # Path to private key.
private_key_file3 = 'rsa_private3.pem'  # Path to private key.

algorithm = 'RS256'  # Authentication key format.
cloud_region = 'us-central1'  # Project region.
ca_certs = 'roots.pem'  # CA root certificate path.
mqtt_bridge_hostname = 'mqtt.googleapis.com'  # GC bridge hostname.
mqtt_bridge_port = 8883  # Bridge port.
message_type = 'event'  # Message type (event or state).

firebase = firebase.FirebaseApplication('https://homeauto-277608.firebaseio.com/', None)

DHT_TYPE = Adafruit_DHT.DHT11
DHT_PIN  = 4

def create_jwt2(project_id, private_key_file2, algorithm):
    # Create a JWT (https://jwt.io) to establish an MQTT connection.
    token = {
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
        'aud': project_id
    }
    with open(private_key_file2, 'r') as f:
        private_key = f.read()
    print('Creating JWT using {} from private key file {}'.format(
        algorithm, private_key_file2))
    return jwt.encode(token, private_key, algorithm=algorithm)

def create_jwt3(project_id, private_key_file3, algorithm):
    # Create a JWT (https://jwt.io) to establish an MQTT connection.
    token = {
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
        'aud': project_id
    }
    with open(private_key_file3, 'r') as f:
        private_key = f.read()
    print('Creating JWT using {} from private key file {}'.format(
        algorithm, private_key_file3))
    return jwt.encode(token, private_key, algorithm=algorithm)

def error_str(rc):
    # Convert a Paho error to a human readable string.
    return '{}: {}'.format(rc, mqtt.error_string(rc))
  
class Device(object):
    # Device implementation.
    def __init__(self):
        self.connected = False
        # self.humidity, self.temperature = readDataDHT()
        # self.pir, self.gas = readDataGas()
        self.humidity=0
        self.temperature = 0
        #self.pir=0
        self.gas = 0

    def readDataDHT(self):
        humidity,temperature  = Adafruit_DHT.read_retry(DHT_TYPE, DHT_PIN)
        #print(humidity)
        #print(temperature)
        humi=humidity
        temp=temperature
        if humi is not None and temp is not None:
            return humi,temp

    def readDataGas(self):
        if (ser.in_waiting>0):                  #Neu co tin hieu tu Arduino
         data = ser.readline()
         data2 =data.decode()
         #print(data2)
         self.gas=data2
         return float(self.gas)

    def wait_for_connection(self, timeout):
        # Wait for the device to become connected.
        total_time = 0
        while not self.connected and total_time < timeout:
            time.sleep(1)
            total_time += 1

        if not self.connected:
            raise RuntimeError('Could not connect to MQTT bridge.')

    def on_connect(self, unused_client, unused_userdata, unused_flags, rc):
        # Callback on connection.
        print('Connection Result:', error_str(rc))
        self.connected = True

    def on_disconnect(self, unused_client, unused_userdata, rc):
        # Callback on disconnect.
        print('Disconnected:', error_str(rc))
        self.connected = False

    def on_publish(self, unused_client, unused_userdata, unused_mid):
        # Callback on PUBACK from the MQTT bridge.
        #print('Published message acked.')
        print(" ")

    def on_subscribe(self, unused_client, unused_userdata, unused_mid,
                     granted_qos):
        # Callback on SUBACK from the MQTT bridge.
        print('Subscribed: ', granted_qos)
        if granted_qos[0] == 128:
            print('Subscription failed.')

    def on_message(self, unused_client, unused_userdata, message):
        # Callback on a subscription.
        payload = message.payload.decode('utf-8')
        print('Received message \'{}\''.format(payload))
        
        if not payload:
            return
    
def main():

    client2 = mqtt.Client(
        client_id='projects/{}/locations/{}/registries/{}/devices/{}'.format(
            project_id,
            cloud_region,
            registry_id2,
            device_id2))
    client2.username_pw_set(
        username='unused',
        password=create_jwt2(
            project_id,
            private_key_file2,
            algorithm))
    client2.tls_set(ca_certs=ca_certs, tls_version=ssl.PROTOCOL_TLSv1_2)

    client3 = mqtt.Client(
        client_id='projects/{}/locations/{}/registries/{}/devices/{}'.format(
            project_id,
            cloud_region,
            registry_id3,
            device_id3))
    client3.username_pw_set(
        username='unused',
        password=create_jwt3(
            project_id,
            private_key_file3,
            algorithm))
    client3.tls_set(ca_certs=ca_certs, tls_version=ssl.PROTOCOL_TLSv1_2)

    device = Device()

    client2.on_connect = device.on_connect
    client2.on_publish = device.on_publish
    client2.on_disconnect = device.on_disconnect
    client2.on_subscribe = device.on_subscribe
    client2.on_message = device.on_message
    client2.connect(mqtt_bridge_hostname, mqtt_bridge_port)
    client2.loop_start()

    mqtt_telemetry_topic2 = '/devices/{}/events'.format(device_id2)
    mqtt_config_topic2 = '/devices/{}/config'.format(device_id2)

    # Wait up to 5 seconds for the device to connect.
    #device.wait_for_connection(5)
    client2.subscribe(mqtt_config_topic2, qos=1)
    
    client3.on_connect = device.on_connect
    client3.on_publish = device.on_publish
    client3.on_disconnect = device.on_disconnect
    client3.on_subscribe = device.on_subscribe
    client3.on_message = device.on_message
    client3.connect(mqtt_bridge_hostname, mqtt_bridge_port)
    client3.loop_start()

    mqtt_telemetry_topic3 = '/devices/{}/events'.format(device_id3)
    mqtt_config_topic3 = '/devices/{}/config'.format(device_id3)

    # Wait up to 5 seconds for the device to connect.
    #device.wait_for_connection(5)
    client3.subscribe(mqtt_config_topic3, qos=1)


    try:        
        while True:
            humidity, temperature=device.readDataDHT()
            gas=device.readDataGas()
            status6 = firebase.get('/sensor/gas', None)
            device.gas=status6
            
            #currentTime = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
 
            # data2={'humidity':device.humidity,'temperature':device.temperature}
            data2={'humidity':humidity,'temperature':temperature}

            data3={'gas':gas}
            
            payload2 = json.dumps(data2, indent=1)
            payload3 = json.dumps(data3, indent=1)

            print('Publishing payload', payload2)
            print('Publishing payload', payload3)
            client2.publish(mqtt_telemetry_topic2, payload2, qos=1)
            client3.publish(mqtt_telemetry_topic3, payload3, qos=1)
            time.sleep(5)  


    except KeyboardInterrupt:
        # Exit script on ^C.
        pass
        GPIO.cleanup()
        client2.disconnect()
        client3.disconnect()
        client2.loop_stop()
        client3.loop_stop()

        print('Exit with ^C. Goodbye!')
if __name__ == '__main__':
    main()
