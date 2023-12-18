import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import { Gyroscope, Accelerometer, Magnetometer, Barometer } from 'expo-sensors';

export default function App() {
  const [location, setLocation] = useState(null);
  const [gyroData, setGyroData] = useState({});
  const [accelData, setAccelData] = useState({});
  const [magnetometerData, setMagnetometerData] = useState({});
  const [barometerData, setBarometerData] = useState({});

  const SERVER_URL = 'http://yourserver.com:port'; // 替换为你的服务器地址和端口

  useEffect(() => {
    async function subscribeToSensors() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        Location.watchPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000
        }, setLocation);
      }

      Gyroscope.setUpdateInterval(1000);
      Accelerometer.setUpdateInterval(1000);
      Magnetometer.setUpdateInterval(1000);
      Barometer.setUpdateInterval(1000);

      Gyroscope.addListener(data => setGyroData(data));
      Accelerometer.addListener(data => setAccelData(data));
      Magnetometer.addListener(data => setMagnetometerData(data));
      Barometer.addListener(data => setBarometerData(data));
    }

    subscribeToSensors();

    const dataSendInterval = setInterval(() => {
      sendData();
    }, 2000);

    return () => clearInterval(dataSendInterval);
  }, []);

  const sendData = async () => {
    const payload = {
      location,
      gyroData,
      accelData,
      magnetometerData,
      barometerData
    };

    try {
      await axios.post(`${SERVER_URL}/send-data`, payload);
      console.log('Data sent successfully');
    } catch (error) {
      console.error('Error sending data:', error);
    }
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

  return (
    <ScrollView style={styles.container}>
      {renderLocationData()}
      {renderSensorData(gyroData, 'Gyroscope')}
      {renderSensorData(accelData, 'Accelerometer')}
      {renderSensorData(magnetometerData, 'Magnetometer')}
      {renderSensorData(barometerData, 'Barometer')}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
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
