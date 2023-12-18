import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Button, TextInput, Alert } from 'react-native';
import Modal from 'react-native-modal';
import axios from 'axios';
import * as Location from 'expo-location';
import { Gyroscope, Accelerometer, Magnetometer, Barometer } from 'expo-sensors';

export default function App() {
  const [location, setLocation] = useState(null);
  const [gyroData, setGyroData] = useState({});
  const [accelData, setAccelData] = useState({});
  const [magnetometerData, setMagnetometerData] = useState({});
  const [barometerData, setBarometerData] = useState({});
  const [serverUrl, setServerUrl] = useState('http://yourserver.com:port');
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    let locationSubscription;
  
    const subscribeToSensors = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        locationSubscription = await Location.watchPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 500, // 每0.5秒更新一次
          distanceInterval: 1, // 或者每移动1米更新一次
        }, setLocation);
      }
  
      Gyroscope.setUpdateInterval(1000);
      const gyroSubscription = Gyroscope.addListener(data => setGyroData(data));
  
      Accelerometer.setUpdateInterval(1000);
      const accelSubscription = Accelerometer.addListener(data => setAccelData(data));
  
      Magnetometer.setUpdateInterval(1000);
      const magnetometerSubscription = Magnetometer.addListener(data => setMagnetometerData(data));
  
      Barometer.setUpdateInterval(1000);
      const barometerSubscription = Barometer.addListener(data => setBarometerData(data));
  
      return () => {
        gyroSubscription.remove();
        accelSubscription.remove();
        magnetometerSubscription.remove();
        barometerSubscription.remove();
        if (locationSubscription) {
          locationSubscription.remove(); // 确保取消位置订阅
        }
      };
    };
  
    subscribeToSensors();
  
    const dataSendInterval = setInterval(() => {
      sendData();
    }, 2000);
  
    return () => {
      clearInterval(dataSendInterval);
      if (locationSubscription) {
        locationSubscription.remove(); // 清理位置订阅
      }
    };
  }, [serverUrl]); // 依赖项列表中添加serverUrl
  

  const sendData = async () => {
    const payload = {
      location,
      gyroData,
      accelData,
      magnetometerData,
      barometerData
    };

    try {
      await axios.post(`${serverUrl}/send-data`, payload);
      console.log('Data sent successfully');
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleServerUrlChange = (text) => {
    setServerUrl(text);
  };

  const renderSensorData = (data, sensorName) => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{sensorName} Data:</Text>
        {data && Object.entries(data).map(([key, value]) => (
          <Text key={key} style={styles.dataText}>{`${key}: ${value.toFixed(3)}`}</Text>
        ))}
      </View>
    );
  };

  const renderLocationData = () => {
    if (location) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Data:</Text>
          <Text style={styles.dataText}>Latitude: {location.coords.latitude}</Text>
          <Text style={styles.dataText}>Longitude: {location.coords.longitude}</Text>
          <Text style={styles.dataText}>Altitude: {location.coords.altitude} meters</Text>
          <Text style={styles.dataText}>Speed: {location.coords.speed} m/s</Text>
          <Text style={styles.dataText}>Heading: {location.coords.heading} degrees</Text>
          <Text style={styles.dataText}>Accuracy: {location.coords.accuracy} meters</Text>
        </View>
      );
    }
    return <Text style={styles.infoText}>Waiting for location data...</Text>;
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {renderLocationData()}
        {renderSensorData(gyroData, 'Gyroscope')}
        {renderSensorData(accelData, 'Accelerometer')}
        {renderSensorData(magnetometerData, 'Magnetometer')}
        {renderSensorData(barometerData, 'Barometer')}
      </ScrollView>
      <Button title="Set Server Address" onPress={toggleModal} />
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <TextInput
            style={styles.input}
            onChangeText={handleServerUrlChange}
            value={serverUrl}
            placeholder="Enter Server URL"
          />
          <Button title="Save" onPress={toggleModal} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: 200,
    marginBottom: 10,
  },
  section: {
    margin: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dataText: {
    fontSize: 16,
    marginVertical: 2,
  },
  infoText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});
