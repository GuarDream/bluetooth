const scanBtn = document.getElementById('scan');
const startSamplingBtn = document.getElementById('startSampling');
const endSamplingBtn = document.getElementById('endSampling');
const getDataBtn = document.getElementById('getData');
const receivedDataDiv = document.getElementById('receivedData');
const deviceList = document.getElementById('deviceList');

let bluetoothDevice;
let characteristic;

scanBtn.addEventListener('click', async () => {
  await scanForDevices();
});

startSamplingBtn.addEventListener('click', async () => {
  await writeToBluetooth('S31OK');
});

endSamplingBtn.addEventListener('click', async () => {
  await writeToBluetooth('S32OK');
});

getDataBtn.addEventListener('click', async () => {
    
    await readFromBluetooth('SG1OK');
});

// Function to scan for Bluetooth devices
async function scanForDevices() {
    try {
      const options = {
        acceptAllDevices: true,
      };
      const device = await navigator.bluetooth.requestDevice(options);
      addDeviceToList(device);
    } catch (error) {
        if (error.name === 'NotFoundError') {
            console.log('No device selected.');
          } else if (error.name === 'NotAllowedError') {
            console.log('Permission to access Bluetooth denied by user.');
          } else {
            console.error('Bluetooth scan error:', error);
          }
  }
}

  // Function to add a discovered device to the list
function addDeviceToList(device) {
    const option = document.createElement('option');
    option.textContent = device.name || 'Unknown Device';
    option.value = device.id;
    deviceList.appendChild(option);
  }

// Function to connect to the Bluetooth device and write data
async function writeToBluetooth(data) {
    try {
      const deviceId = deviceList.value;
      if (!deviceId) {
        alert('Please select a device first.');
        return;
      }
  
      bluetoothDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] }],
        optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']
      });
  
      const server = await bluetoothDevice.gatt.connect();
      const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
      const characteristic = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
  
      // Convert the string to ArrayBuffer
      const dataArrayBuffer = new TextEncoder().encode(data);
      await characteristic.writeValue(dataArrayBuffer);
  
      receivedDataDiv.innerText = `Sent: ${data}`;
  
      //await server.disconnect();
    } catch (error) {
        if (error.name === 'NotFoundError') {
          console.log('No device selected.');
        } else if (error.name === 'NotAllowedError') {
          console.log('Permission to access Bluetooth denied by user.');
        } else {
          console.error('Bluetooth error:', error);
        }
    }
  }

  // Function to read data from the Bluetooth characteristic
// Function to read data from the Bluetooth characteristic
async function readFromBluetooth(data) {
    try {
        const deviceId = deviceList.value;
        if (!deviceId) {
          alert('Please select a device first.');
          return;
        }
    
        bluetoothDevice = await navigator.bluetooth.requestDevice({
          filters: [{ services: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] }],
          optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']
        });
    
        const server = await bluetoothDevice.gatt.connect();
        const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
        const characteristic = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
    
        // Convert the string to ArrayBuffer
        const dataArrayBuffer = new TextEncoder().encode(data);
        await characteristic.writeValue(dataArrayBuffer);
        const value = await characteristic.readValue();
        const decoder = new TextDecoder('utf-8');
        const receivedText = decoder.decode(value);
    
        receivedDataDiv.innerText = `Received: ${receivedText}`;
    
        //receivedDataDiv.innerText = `Sent: ${data}`;
    
        await server.disconnect();
      } catch (error) {
          if (error.name === 'NotFoundError') {
            console.log('No device selected.');
          } else if (error.name === 'NotAllowedError') {
            console.log('Permission to access Bluetooth denied by user.');
          } else {
            console.error('Bluetooth error:', error);
          }
      }
  }

