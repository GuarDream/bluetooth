let bleDevice;
let characteristic;

async function connect() {
    try {
        bleDevice = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] }],
        });
        const server = await bleDevice.gatt.connect();
        const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
        characteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');
        if (!characteristic) {
            console.error('Characteristic not found');
            return;
        }
        document.getElementById('connectBtn').disabled = true;
        document.getElementById('disconnectBtn').disabled = false;
        console.log('Connected to BLE device');
        characteristic.addEventListener('characteristicvaluechanged', handleData);
        await characteristic.startNotifications();
    } catch (error) {
        console.error('Connection failed', error);
        document.getElementById('connectBtn').disabled = false;
        document.getElementById('disconnectBtn').disabled = true;
        if (error.code === 8) {
            console.error('GATT Error: Not supported');
        }
    }
}

function disconnect() {
    if (bleDevice && bleDevice.gatt.connected) {
        bleDevice.gatt.disconnect();
        document.getElementById('connectBtn').disabled = false;
        document.getElementById('disconnectBtn').disabled = true;
        console.log('Disconnected');
    }
}

async function sendCommand() {
    if (!characteristic) {
        console.error('Characteristic not found');
        return;
    }
    const command = document.getElementById('dataInput').value;
    if (!command) {
        console.error('No command to send');
        return;
    }
    const encoder = new TextEncoder();
    const commandData = encoder.encode(command);
    try {
        await characteristic.writeValue(commandData);
        console.log('Command sent: ', command);
    } catch (error) {
        console.error('Failed to send command', error);
    }
}

function handleData(event) {
    const value = new TextDecoder().decode(event.target.value);
    document.getElementById('receivedData').innerText = 'Received: ' + value;
}

//document.getElementById("connectBtn").addEventListener("click", connect);