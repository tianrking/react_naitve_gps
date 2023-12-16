import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { Gyroscope, Accelerometer, Barometer, Magnetometer } from 'expo-sensors';

export default function App() {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [gyroData, setGyroData] = useState(null);
  const [accelData, setAccelData] = useState(null);
  const [barometerData, setBarometerData] = useState(null);
  const [magnetometerData, setMagnetometerData] = useState(null);

  useEffect(() => {
    Gyroscope.setUpdateInterval(1000);
    Accelerometer.setUpdateInterval(1000);
    Barometer.setUpdateInterval(1000);
    Magnetometer.setUpdateInterval(1000);

    const gyroSubscription = Gyroscope.addListener(gyro => {
      setGyroData(gyro);
    });
    const accelSubscription = Accelerometer.addListener(accel => {
      setAccelData(accel);
    });
    const barometerSubscription = Barometer.addListener(data => {
      setBarometerData(data);
    });
    const magnetometerSubscription = Magnetometer.addListener(data => {
      setMagnetometerData(data);
    });

    const locationInterval = setInterval(() => {
      getLocation();
    }, 200); // 每 200 ms更新一次位置

    return () => {
      gyroSubscription.remove();
      accelSubscription.remove();
      barometerSubscription.remove();
      magnetometerSubscription.remove();
      clearInterval(locationInterval); // 清理定时器
    };
  }, []);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError(true);
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    setLocationError(false);
  };

  const renderLocationDetails = () => {
    if (locationError) {
      return <Text style={styles.errorText}>Permission to access location was denied</Text>;
    }

    if (location) {
      const { coords, timestamp } = location;
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GPS Location:</Text>
          {Object.entries(coords).map(([key, value]) => (
            <Text key={key} style={styles.dataText}>
              {`${key}: ${value}`}
            </Text>
          ))}
          <Text style={styles.dataText}>Timestamp: {timestamp}</Text>
          <Text style={styles.dataText}>Altitude: {coords.altitude} meters</Text>
        </View>
      );
    }

    return <Text style={styles.infoText}>Waiting for GPS location...</Text>;
  };

  const renderSensorData = (data, sensorName) => {
    if (data) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{sensorName} Data:</Text>
          {Object.entries(data).map(([key, value]) => (
            <Text key={key} style={styles.dataText}>
              {`${key}: ${value.toFixed(3)}`}
            </Text>
          ))}
        </View>
      );
    }
    return <Text style={styles.infoText}>Waiting for {sensorName} data...</Text>;
  };

  const getAltitudeFromPressure = (pressure) => {
    return 44330.0 * (1.0 - Math.pow(pressure / 1013.25, 0.1903));
  };

  const renderBarometerData = () => {
    if (barometerData) {
      const estimatedAltitude = getAltitudeFromPressure(barometerData.pressure);
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Barometer Data:</Text>
          <Text style={styles.dataText}>Pressure: {barometerData.pressure} hPa</Text>
          <Text style={styles.dataText}>Estimated Altitude: {estimatedAltitude.toFixed(2)} meters</Text>
        </View>
      );
    }
    return <Text style={styles.infoText}>Waiting for barometer data...</Text>;
  };

  const renderMagnetometerData = () => {
    if (magnetometerData) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Magnetometer Data:</Text>
          <Text style={styles.dataText}>x: {magnetometerData.x.toFixed(3)}</Text>
          <Text style={styles.dataText}>y: {magnetometerData.y.toFixed(3)}</Text>
          <Text style={styles.dataText}>z: {magnetometerData.z.toFixed(3)}</Text>
        </View>
      );
    }
    return <Text style={styles.infoText}>Waiting for magnetometer data...</Text>;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderLocationDetails()}
        {renderSensorData(gyroData, 'Gyroscope')}
        {renderSensorData(accelData, 'Accelerometer')}
        {renderBarometerData()}
        {renderMagnetometerData()}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button title="Get GPS Location" onPress={getLocation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    marginVertical: 20,
    marginTop: 50,  // 增加顶部外边距
  },
  section: {
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dataText: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
});
