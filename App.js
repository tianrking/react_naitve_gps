import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Button, TextInput, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import axios from 'axios';
import * as Location from 'expo-location';
// import BleManager from 'react-native-ble-manager';
import { Gyroscope, Accelerometer, Magnetometer, Barometer } from 'expo-sensors';
import Constants from 'expo-constants';

export default function App() {
  const [location, setLocation] = useState(null);
  const [gyroData, setGyroData] = useState({});
  const [accelData, setAccelData] = useState({});
  const [magnetometerData, setMagnetometerData] = useState({});
  const [barometerData, setBarometerData] = useState({});
  
  const [serverUrl, setServerUrl] = useState('http://bwg.w0x7ce.eu:8000');

  const [isModalVisible, setModalVisible] = useState(false);
  const [isLocationModalVisible, setLocationModalVisible] = useState(false);
  const [isGyroModalVisible, setGyroModalVisible] = useState(false);
  const [isAccelModalVisible, setAccelModalVisible] = useState(false);
  const [isMagnetModalVisible, setMagnetModalVisible] = useState(false);
  const [isBarometerModalVisible, setBarometerModalVisible] = useState(false);


  useEffect(() => {
    let locationSubscription;

    const subscribeToSensors = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        locationSubscription = await Location.watchPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 500, // 每0.5秒更新一次
          distanceInterval: 1, // 或者每移动1米更新一次
        }, updatedLocation => {
          setLocation(updatedLocation);
          sendData(updatedLocation, gyroData, accelData, magnetometerData, barometerData); // 实时发送数据
        });
      }

      Gyroscope.setUpdateInterval(1000);
      Accelerometer.setUpdateInterval(1000);
      Magnetometer.setUpdateInterval(1000);
      Barometer.setUpdateInterval(1000);

      const gyroSubscription = Gyroscope.addListener(data => {
        setGyroData(data);
        sendData(location, data, accelData, magnetometerData, barometerData); // 实时发送数据
      });

      const accelSubscription = Accelerometer.addListener(data => {
        setAccelData(data);
        sendData(location, gyroData, data, magnetometerData, barometerData); // 实时发送数据
      });

      const magnetometerSubscription = Magnetometer.addListener(data => {
        setMagnetometerData(data);
        sendData(location, gyroData, accelData, data, barometerData); // 实时发送数据
      });

      const barometerSubscription = Barometer.addListener(data => {
        setBarometerData(data);
        sendData(location, gyroData, accelData, magnetometerData, data); // 实时发送数据
      });

      return () => {
        gyroSubscription.remove();
        accelSubscription.remove();
        magnetometerSubscription.remove();
        barometerSubscription.remove();
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    };

    subscribeToSensors();
  }, [serverUrl]);

  // const sendData = async () => {
  //   const payload = {
  //     location,
  //     gyroData,
  //     accelData,
  //     magnetometerData,
  //     barometerData
  //   };
  
  //   console.log('Sending data:', JSON.stringify(payload, null, 2));
  
  //   try {
  //     await axios.post(`${serverUrl}/send-data`, payload);
  //     console.log('Data sent successfully');
  //   } catch (error) {
  //     console.error('Error sending data:', error);
  //   }
  // };

  // const sendData = async (location, gyro, accel, magnetometer, barometer) => {
  //   const payload = { location, gyroData: gyro, accelData: accel, magnetometerData: magnetometer, barometerData: barometer };
  //   console.log('Sending data:', JSON.stringify(payload, null, 2));

  //   try {
  //     await axios.post(`${serverUrl}/send-data`, payload);
  //     console.log('Data sent successfully');
  //   } catch (error) {
  //     console.error('Error sending data:', error);
  //   }
  // };

  const sendData = async (location, gyro, accel, magnetometer, barometer) => {
    const deviceInfo = {
      deviceId: Constants.installationId, // 用作设备的唯一ID
      deviceType: Constants.deviceName // 设备名称
    };
  
    const payload = {
      location,
      gyroData: gyro,
      accelData: accel,
      magnetometerData: magnetometer,
      barometerData: barometer,
      deviceInfo // 添加的设备信息
    };
  
    console.log('Sending data:', JSON.stringify(payload, null, 2));
  
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

  const toggleLocationModal = () => {
    setLocationModalVisible(!isLocationModalVisible);
  };

  const toggleGyroModal = () => {
    setGyroModalVisible(!isGyroModalVisible);
  };

  const toggleAccelModal = () => {
    setAccelModalVisible(!isAccelModalVisible);
  };

  const toggleMagnetModal = () => {
    setMagnetModalVisible(!isMagnetModalVisible);
  };

  const toggleBarometerModal = () => {
    setBarometerModalVisible(!isBarometerModalVisible);
  };

  // const sendLocationDataViaBluetooth = () => {
  //   // TODO: 实现蓝牙设备搜索、连接和数据传输的逻辑
  //   console.log('Sending location data via Bluetooth...');
  //   // 示例：BleManager.write...
  // };

  const handleServerUrlChange = (text) => {
    setServerUrl(text);
  };

  const renderSensorData = (data, sensorName, onToggleModal) => {
    return (
      <TouchableOpacity style={styles.section} onPress={onToggleModal}>
        <Text style={styles.sectionTitle}>{sensorName} Data:</Text>
        {data && Object.entries(data).map(([key, value]) => (
          <Text key={key} style={styles.dataText}>
            {`${key}: ${typeof value === 'number' ? value.toFixed(3) : value}`}
          </Text>
        ))}
      </TouchableOpacity>
    );
  };

  const renderLocationData = () => {
    return (
      <TouchableOpacity style={styles.section} onPress={toggleLocationModal}>
        <Text style={styles.sectionTitle}>Location Data:</Text>
        {location && Object.entries(location.coords).map(([key, value]) => (
          <Text key={key} style={styles.dataText}>{`${key}: ${value}`}</Text>
        ))}
      </TouchableOpacity>
    );
  };

  const renderMagnetometerData = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Magnetometer Data:</Text>
        {magnetometerData && Object.entries(magnetometerData).map(([key, value]) => (
          <Text key={key} style={styles.dataText}>{`${key}: ${value}`}</Text>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {renderLocationData()}
        {/* {renderSensorData(location, 'Location', toggleLocationModal)} */}
        {renderSensorData(gyroData, 'Gyroscope', toggleGyroModal)}
        {renderSensorData(accelData, 'Accelerometer', toggleAccelModal)}
        {/* {renderSensorData(magnetometerData, 'Magnetometer', toggleMagnetModal)} */}
        {renderMagnetometerData()}
        {renderSensorData(barometerData, 'Barometer', toggleBarometerModal)}

        {/* ...渲染其他传感器数据 */}
      </ScrollView>
      <Button title="Set Server Address" onPress={toggleModal} />
      {/* <Button title="Send Location via Bluetooth" onPress={sendLocationDataViaBluetooth} /> */}
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
      <Modal isVisible={isLocationModalVisible}>
        <View style={styles.modalContent}>
          <Text>A</Text>
          <Button title="Close" onPress={toggleLocationModal} />
        </View>
      </Modal>
      <Modal isVisible={isGyroModalVisible}>
        <View style={styles.modalContent}>
          <Text>A</Text>
          <Button title="Close" onPress={toggleGyroModal} />
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

});
