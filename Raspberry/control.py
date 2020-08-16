import datetime
import json
import os
import ssl
import time

import jwt
import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO

from firebase import firebase

# Used pins
LED_PHONGKHACH = 17
LED_PHONGNGU = 27
LED_NHABEP = 22
LED_TOLET = 26
PIR = 5
FAN1 = 23
FAN2 = 24

# GCP parameters 
project_id = 'homeauto-277608'  # Your project ID.
# registry_id = 'my-registry'  # Your registry name.
# device_id = 'led'  # Your device name.
registry_id = 'my-registry-ctr'
device_id = 'device-control'
#private_key_file = 'rsa_private.pem'  # Path to private key.
private_key_file = 'rsa_private4.pem'
algorithm = 'RS256'  # Authentication key format.
cloud_region = 'us-central1'  # Project region.
ca_certs = 'roots.pem'  # CA root certificate path.
mqtt_bridge_hostname = 'mqtt.googleapis.com'  # GC bridge hostname.
mqtt_bridge_port = 8883  # Bridge port.
message_type = 'event'  # Message type (event or state).

firebase = firebase.FirebaseApplication('https://homeauto-277608.firebaseio.com/', None)

def create_jwt(project_id, private_key_file, algorithm):
    # Create a JWT (https://jwt.io) to establish an MQTT connection.
    token = {
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
        'aud': project_id
    }
    with open(private_key_file, 'r') as f:
        private_key = f.read()
    print('Creating JWT using {} from private key file {}'.format(
        algorithm, private_key_file))
    return jwt.encode(token, private_key, algorithm=algorithm)


def error_str(rc):
    # Convert a Paho error to a human readable string.
    return '{}: {}'.format(rc, mqtt.error_string(rc))


class Device(object):
    # Device implementation.
    def __init__(self):
        self.connected = False
        self.led1 = 0
        self.led2 = 0
        self.led3 = 0
        #self.quat=0
        self.led4 = 0
        self.fan1 = 0
        self.fan2 = 0
        
        # Pins setup
        GPIO.setmode(GPIO.BCM)
        #GPIO.setmode(GPIO.BOARD)
        GPIO.setwarnings(False)
        GPIO.setup(LED_PHONGKHACH,GPIO.OUT)
        GPIO.setup(LED_PHONGNGU,GPIO.OUT)
        GPIO.setup(LED_NHABEP,GPIO.OUT)
        GPIO.setup(LED_TOLET, GPIO.OUT)
        GPIO.setup(FAN1, GPIO.OUT)
        GPIO.setup(FAN2, GPIO.OUT)
        GPIO.setup(PIR, GPIO.IN)
        GPIO.output(LED_TOLET,1)
    #def readPir(self):
     #   i=GPIO.input(PIR)
      #  return int (i)
    def update_led_state(self):
        if self.led1:
            GPIO.output(LED_PHONGKHACH,1)
        else:
            GPIO.output(LED_PHONGKHACH,0)
        if self.led2:
            GPIO.output(LED_PHONGNGU,1)
        else:
            GPIO.output(LED_PHONGNGU,0)
        if self.led3:
            GPIO.output(LED_NHABEP,1)
        else:
            GPIO.output(LED_NHABEP,0)
        if self.fan1:
            GPIO.output(FAN1,1)
        else:
            GPIO.output(FAN1,0)
        if self.fan2:
            GPIO.output(FAN2,1)
        else:
            GPIO.output(FAN2,0)

        if (GPIO.input(PIR)):
            GPIO.output(LED_TOLET,0)
        else:
            GPIO.output(LED_TOLET,1)
        

        # value = firebase.get('/device/led/quat', None)
        # string=str(value)  
        # if self.quat:
        #     ser.write(string.encode())


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
        print('Published message acked.')

    def on_subscribe(self, unused_client, unused_userdata, unused_mid,
                     granted_qos):
        # Callback on SUBACK from the MQTT bridge.
        print('Subscribed: ', granted_qos)
        if granted_qos[0] == 128:
            print('Subscription failed.')

    def on_message(self, unused_client, unused_userdata, message):
        # Callback on a subscription.
        payload = message.payload.decode('utf-8')
        print('Received message \'{}\' on topic \'{}\' with Qos {}'.format(payload, message.topic, str(message.qos)))
       # print('Received message \'{}\''.format(payload))
        
        if not payload:
            return
        # Parse incoming JSON.
        data = json.loads(payload)
        if data['led1'] != self.led1:
            self.led1 = data['led1']
            if self.led1:
                print('Led LED_PHONGKHACH on')
            else:
                print('Led LED_PHONGKHACH off')

        if data['led2']!=self.led2:
            self.led2 = data['led2']
            if self.led2:
                print('Led LED_PHONGNGU on')
            else:
                print('Led LED_PHONGNGU off')

        if data['led3']!=self.led3:
            self.led3 = data['led3']
            if self.led3:
                print('Led LED_NHABEP on')
            else:
                print('Led LED_NHABEP off')

        if data['fan1']!=self.fan1:
            self.fan1 = data['fan1']
            if self.fan1:
                print('Fan on')
            else:
                print('Fan off')
        if data['fan2']!=self.fan2:
            self.fan2 = data['fan2']
            if self.fan2:
                print('Fan on')
            else:
                print('Fan off')

        if data['led4']!=self.led4:
            self.led4 = data['led4']
            if self.led4:
                print('Led LED_TOLET on')
            else:
                print('Led LED_TOLET off')
def readPir2():
    i=GPIO.input(PIR)
    return i       
def main():

    client = mqtt.Client(
        client_id='projects/{}/locations/{}/registries/{}/devices/{}'.format(
            project_id,
            cloud_region,
            registry_id,
            device_id))
    client.username_pw_set(
        username='unused',
        password=create_jwt(
            project_id,
            private_key_file,
            algorithm))
    client.tls_set(ca_certs=ca_certs, tls_version=ssl.PROTOCOL_TLSv1_2)

    device = Device()

    client.on_connect = device.on_connect
    client.on_publish = device.on_publish
    client.on_disconnect = device.on_disconnect
    client.on_subscribe = device.on_subscribe
    client.on_message = device.on_message
    client.connect(mqtt_bridge_hostname, mqtt_bridge_port)
    client.loop_start()

    mqtt_telemetry_topic = '/devices/{}/events'.format(device_id)
    mqtt_config_topic = '/devices/{}/config'.format(device_id)

    # Wait up to 5 seconds for the device to connect.
    #device.wait_for_connection(5)

    client.subscribe(mqtt_config_topic, qos=1)
    
    try:        
        while True:
            device.update_led_state()
            i=GPIO.input(PIR)
            print(i)
            if(i==1):
                t=0
            else:
                t=1
            print(i)
            
            data = {'led1': device.led1,'led2': device.led2,'led3': device.led3 ,'led4': t,'fan1':device.fan1, 'fan2':device.fan2 }
            payload = json.dumps(data, indent=5)
            print('Publishing payload', payload)
            client.publish(mqtt_telemetry_topic, payload, qos=1)
            time.sleep(0.5)     

    except KeyboardInterrupt:
        # Exit script on ^C.
        pass
        GPIO.output(LED_PHONGKHACH,0)
        GPIO.output(LED_PHONGNGU,0)
        GPIO.output(LED_NHABEP,0)
        GPIO.output(FAN1,0)
        GPIO.output(FAN2,0)
        GPIO.output(LED_TOLET,1)
        GPIO.cleanup()
        client.disconnect()
        client.loop_stop()
        print('Finished loop successfully. Goodbye!')
if __name__ == '__main__':
    main()
