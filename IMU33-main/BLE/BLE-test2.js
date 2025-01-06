// link to firebase Realtime database
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import {getDatabase,ref,push,onValue,remove,set} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings={
    // 换成 firebase realtime 的API
    databaseURL:"https://imu33-1dbad-default-rtdb.firebaseio.com/"
}

let lastTimestamp = 0;
let steps = 0;
let RX_characteristic;
let TX_characteristic;
let fileName; 

var xValues = [];
var yValues = [];
var zValues = [];
var Magnitude=[];

var totalDistance_Sum=0;

function intializeData(){
    xValues = [];
    yValues = [];
    zValues = [];
    Magnitude=[];
    steps_A = 0;
    steps_B=0;
    dis_num=0;
    totalDistance_Sum=0
    
}


const app=initializeApp(appSettings)
const database=getDatabase(app)
//let MagListInDB
//const steps_AListInDB=ref(database,"step_BList")
//let steps_AListInDB
//const steps_BListInDB=ref(database,"step_AList")
//let steps_BListInDB
//const inputFieldE1=document.getElementById("input-field")
//const addButtonE1=document.getElementById("add-button")
//const shoppingListE1=document .getElementById("shopping-list")




//输入用户的信息

function writeUserData(){

    fileName=document.getElementById("inputField").value;
    const database=getDatabase();
    console.log(fileName);
    var output=document.getElementById("output");
    output.innerText="文件名称是："+fileName;
    //const postList=ref(database,'')
    
    /*
    const steps_AListInDB=ref(database,fileName+"/steps_AListInDB");
    const steps_BListInDB=ref(database,fileName+'/steps_BListInDB');
    const MagListInDB=ref(database,fileName+'/MagListInDB');
    push(steps_AListInDB,"start");
    push(steps_BListInDB,"start");
    push(MagListInDB,"start");


    
    //主节点
    //const reference=ref(database,'fileName/'+fileName);

    

    let ans=IMUprocess("X: 20.2234,Y: 0.2234,Z: 0.2236,X: 22.2234X,Y: 10.2234,Z: 20.2236,X: -2.2234X,Y: -10.2234,Z: 20.2236")
    console.log("ans");
    console.log(ans);
    console.log("steps_A;",ans);
    */
    }


//writeUserData("test222");

document.getElementById("saveFileName","").addEventListener("click",writeUserData);

/*
    fileName=document.getElementById("inputField").value;
    var output=document.getElementById("output");
    output.innerText="文件名称是："+fileName;
    const database=getDatabase();
    //主节点
    const reference=ref(database,'fileName/'+fileName);

    console.log(fileName);*/


function displayReceivedData(data) {
    const dataContainer = document.getElementById('receivedDataContainer');
    if (!dataContainer) {
        console.error('Data container not found');
        return;
    }

    // 创建一个新的 <div> 元素用于显示数据
    const newDataDiv = document.createElement('div');
    newDataDiv.textContent = 'Received: ' + data;

    // 将新的数据添加到页面中的容器中
    dataContainer.appendChild(newDataDiv);
}

//分裂acc 的x,y,z
function direction(dataType){
    let receivedData="";
switch (dataType) {
    case 0xaa:
        receivedData= "X";
        break;
    case 0xbb:
        receivedData="Y" ;
        break;
    case 0xcc:
        receivedData= "Z";
        break;
    default:
        // Unknown data type
        receivedData += "未知数据类型: " + dataType.toString(16) ;
}
return receivedData;
}

// Function to handle receiving data from the BLE device
function receiveData(event) {
    let value = event.target.value;
    const decoder = new TextDecoder('utf-8');
        // 检查如果是字符串类型则直接使用，不再解码
        
        let a = [];
    
        for (let i = 0; i < value.byteLength; i++) {
            a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
        }
    console.log('Received data (hex)' + a.join(' '));
    
    const decodedString = decoder.decode(value);

    if (decodedString === 'Extract start' || decodedString === 'Extract ended' || decodedString === 'Sampling start' || decodedString === 'Sampling ended') {
        console.log('Received data (string):', decodedString);
        displayReceivedData(decodedString);
        return;
    }
    
    //let dataView = new DataView(value.buffer);
    // 在控制台打印转换后的十六进制字符串
    //IMU 的指令进行解码 && 数据整理；
    let receivedData = "";
    //const value1 = new TextDecoder().decode(event.target.value);
    //document.getElementById('data1').innerText = 'Received:1 ' + value1+ value;
    //displayReceivedData(decodedString);
    displayReceivedData(a);
    console.log("a",a);

    // 创建一个 ArrayBuffer 来表示字节序列
    let bytes = new Uint8Array(a).buffer;

    // 创建 DataView 对象
    let dataView = new DataView(bytes);

    // !! Loop through data in chunks of 5 bytes (assuming each data point is 5 bytes)
    //console.log(dataView);
    //console.log(dataView.byteLength);
    
   
    let dataType=dataView.getUint8(0)
    // 辨别x,y,z
    let direct=direction(dataType);
    console.log(direct);

    console.log(a.slice(1))
    let accValue=String2hex(a.slice(1));
    
    let acc_result=`${direct}: ${accValue}`;
    displayReceivedData(acc_result);
    console.log(`${direct}:${accValue}`);
/*
    for (let i = 0; i < dataView.byteLength; i +=5) {
        let dataType = dataView.getUint8(i); // Get the data type
        let dataValue = dataView.getFloat32(i + 1, true); // Get the data value (little-endian)

        // Process data based on data type
        switch (dataType) {
            case 0xaa:
                receivedData += "X: " + bytesToFloat(dataValue);
                break;
            case 0xbb:
                receivedData += "Y: " + bytesToFloat(dataValue) ;
                break;
            case 0xcc:
                receivedData += "Z: " + bytesToFloat(dataValue) ;
                break;
            default:
                // Unknown data type
                receivedData += "未知数据类型: " + dataType.toString(16) ;
        }
        console.log('Received data (Float):',receivedData);
        displayReceivedData(receivedData);
    }
*/
    // Display received data
    /*
    let dataContainer = document.getElementById("data");
    dataContainer.innerHTML =value;
    */
    // Process IMU data
    //IMUprocess(acc_result);

    // Process IMU data and send data if step count increases

    let currentSteps = IMUprocess(acc_result);
    console.log('currentSteps',currentSteps)
    //根据方法一 的步数发出信号to BLE。
    if (currentSteps > steps) {
        //sendBluetoothData(1); // Send '1' when step count increases
        steps = currentSteps; // Update steps
    }
    
    
   
}

function bytesToFloat(bytes) {
    // Convert array of bytes to hexadecimal string
    let hexString = '';
    for (let i = 0; i < bytes.length; i++) {
      let byteHex = bytes[i].toString(16).padStart(2, '0');
      hexString += byteHex;
    }
  
    // Convert hex string to binary string
    let binaryString = '';
    for (let i = 0; i < hexString.length; i += 2) {
      let byte = parseInt(hexString.substr(i, 2), 16).toString(2).padStart(8, '0');
      binaryString += byte;
    }
  
    // Separate sign, exponent, and fraction bits
    let sign = parseInt(binaryString.charAt(0), 2) === 1 ? -1 : 1;
    let exponent = parseInt(binaryString.substr(1, 8), 2) - 127;
    let fraction = 1 + parseInt(binaryString.substr(9), 2) * Math.pow(2, -23);
  
    // Calculate the final float value
    let floatValue = sign * fraction * Math.pow(2, exponent);
    return floatValue;
  }

  //将string 转换成 0x.. 十六进制
  function String2hex(hexStrings){
    let hexNumbers = hexStrings.map(hex => parseInt(hex));
    // 十六进制-> 二进制->浮点数公式
    let accValue=bytesToFloat(hexNumbers);
    return accValue;
  }
  
  let bytes1 = ['0x3B','0xCC','0x00','0x00']; // Array of bytes
let floatValue1 = String2hex(bytes1);
console.log("Float Value:", floatValue1); 

// 辅助函数：将字节数组转换为十六进制字符串

// Function to convert and format data (example conversion)
function convertAndFormatData(value) {
    // Example conversion: assume the received data is an offset value
    let offsetValue = value * 100; // Multiply by 100 as an example

    // Format the value (you can change this formatting)
    return offsetValue.toFixed(2); // Two decimal places
}

// Function to send data to the Bluetooth device
async function sendBluetoothData(data) {
    try {
        if (!TX_characteristic) {
            console.error("Bluetooth TX_characteristic not available.");
            return;
        }
        //const command = 'SG10K'; 
        const command = data;
        // Convert data to ArrayBuffer
        //let buffer = new ArrayBuffer(1); // Assuming 1 byte of data
        const encoder = new TextEncoder();
        let dataView = encoder.encode(command);
        

        await RX_characteristic.writeValueWithoutResponse(dataView);
        console.log("Sent data to Bluetooth: " + command);
    } catch (error) {
        console.error('Failed to send command', error);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
    }
}

// Function to start scanning for BLE devices
async function startScan() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
 
            
            optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] // Add your device's service UUID,covert to lower case,have to follow the format 
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e'); // Add your device's service UUID, have to follow the format 
        RX_characteristic = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e'); // Add your device's characteristic UUID, have to follow the format 
        // 再设一个TX_characteristic
        TX_characteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e'); 
        // Subscribe to notifications to receive data
        await TX_characteristic.startNotifications();
        TX_characteristic.addEventListener('characteristicvaluechanged', receiveData);
        //return TX_characteristic.startNotifications();
    } catch (error) {
        console.error('Error:', error);
    }
}


var steps_A = 0;
var steps_B=0;
var dis_num=0;


//let ans=IMUprocess("X: 20.2234,Y: 0.2234,Z: 0.2236,X: 22.2234X,Y: 10.2234,Z: 20.2236,X: -2.2234X,Y: -10.2234,Z: 20.2236")
//console.log("ans");
//console.log(ans);
//console.log("steps_A;",ans);
// Function to process IMU data and calculate step frequency

function IMUprocess(data) {
    const database=getDatabase();
    //const fileName="test0652";
    const X_ListInDB=ref(database,fileName+"/X_ListInDB");
    const Y_ListInDB=ref(database,fileName+'/Y_ListInDB');
    const Z_ListInDB=ref(database,fileName+'/Z_ListInDB');

    const steps_AListInDB=ref(database,fileName+"/steps_AListInDB");
    const steps_BListInDB=ref(database,fileName+'/steps_BListInDB');
    const MagListInDB=ref(database,fileName+'/MagListInDB');
    const diffListInDB=ref(database,fileName+'/DiffListInDB');
    
    var output=document.getElementById("output");
    output.innerText="文件名称是："+fileName;

    let lines = data.split(",");
    // ？？需不需要将xValues，yValues 以及zValues 设为全局变量

    
    let lastTimestamp_A = 0;
    lines.forEach(function(line) {
        if (line.startsWith("X")) {
            xValues.push(parseFloat(line.split(": ")[1]));
            push(X_ListInDB,parseFloat(line.split(": ")[1]));

        } else if (line.startsWith("Y")) {
            yValues.push(parseFloat(line.split(": ")[1]));
            push(Y_ListInDB,parseFloat(line.split(": ")[1]));
        } else if (line.startsWith("Z")) {
            zValues.push(parseFloat(line.split(": ")[1]));
            push(Z_ListInDB,parseFloat(line.split(": ")[1]));
        }
    });
    //push(X_ListInDB,"start");
    console.log(`x length：${xValues.length},y length：${yValues.length},z length：${zValues.length}`);
    // Perform calculation for step frequency

   
    //Method一：
    //？？？如要每个magnitude 记录下来的话把i 放在外面???
    if(xValues.length===yValues.length&yValues.length===zValues.length){
        let i=xValues.length-1;
        let accelerationMagnitude = Math.sqrt(xValues[i] * xValues[i] + yValues[i] * yValues[i] + zValues[i] * zValues[i]);
        Magnitude[i]=accelerationMagnitude;
        console.log(Magnitude);


        push(MagListInDB,accelerationMagnitude);
        console.log("i",i,'Mag',accelerationMagnitude) 
        // 阈值算法
        //根据
        let thresholdA = 1.71; // Adjust threshold as needed

        if (accelerationMagnitude > thresholdA) {
            console.log("第",i,"",accelerationMagnitude,">",thresholdA)
            steps_A++;
            
        }

        console.log("step_A",steps_A);


        //let currentTimestamp = Date.now();
        //console.log("现在时间",currentTimestamp);
        if (lastTimestamp_A !== 0) {
            let deltaTime = (currentTimestamp - lastTimestamp_A) / 1000;} // Convert to seconds

        //Method2；
        let accelerationMagnitude_first = Math.sqrt(xValues[i-1] * xValues[i-1] + yValues[i-1] * yValues[i-1] + zValues[i-1] * zValues[i-1]);
        let accelerationMagnitude_Second = Math.sqrt(xValues[i] * xValues[i] + yValues[i] * yValues[i] + zValues[i] * zValues[i]);
        let diff_betweenTwoPoint =0.89; // Adjust threshold as needed//1.61+0.89
        let diff=Math.abs(accelerationMagnitude_Second-accelerationMagnitude_first);
        console.log("diff",diff)
        
        push(diffListInDB,diff);

        if (diff > diff_betweenTwoPoint) {
            steps_B++;
            console.log("第",i,"",accelerationMagnitude,">",thresholdA)
            
        }
        console.log("step_B",steps_B);
        
        if(xValues.length%20===0){;
            
            let ans=[]//记录进行二重积分的结果，回传为两个值；第一个值是displacement[],第二个值是高数值的distance；
            let windows=[];
            let a=dis_num*20;
            let b=(dis_num+1)*(20);
            windows=(Magnitude.slice(a,b));
            //!!需要先
            ans=doubleIntegration(windows);//根据windows的数据进行

            totalDistance_Sum+=ans[1];
            
            console.log("dis_num",dis_num);
            console.log("a",a);
            console.log("b",b);
            console.log(windows);
            console.log("displacement",ans[0]);
            console.log("该组的distance",ans[1]);
            console.log("totalDistance",totalDistance_Sum);
            dis_num++;

        }
        
    }

    


    
    /*
    for (let i = 0; i < xValues.length; i++) {
        let accelerationMagnitude = Math.sqrt(xValues[i] * xValues[i] + yValues[i] * yValues[i] + zValues[i] * zValues[i]);
        
        push(MagListInDB,accelerationMagnitude);
        console.log('Mag',accelerationMagnitude)
        // 阈值算法
        let thresholdA = 1.005; // Adjust threshold as needed
        let currentTimestamp = Date.now();
        console.log("现在时间",currentTimestamp);
        if (lastTimestamp_A !== 0) {
            let deltaTime = (currentTimestamp - lastTimestamp_A) / 1000; // Convert to seconds
            if (accelerationMagnitude > thresholdA) {
                steps_A++;
                console.log("++")
            }
        }
        lastTimestamp_A = currentTimestamp;     
        
        console.log("steps_A",steps_A);
    }

    //return steps_A;

    // Calculate step frequency (steps per minute)
    let stepFrequency_A = steps_A / ((lastTimestamp_A - lines.length * 5) / 1000 / 60);
    console.log("方法一 步频 (步/分钟): " + stepFrequency_A.toFixed(2));

    //把方法一获得的步频 放入标签为step_BList的数据库里
    push(steps_AListInDB,stepFrequency_A);


    //Method 2:

    let steps_B = 0;
    let lastTimestamp_B = 0;
    const thresholdB=10;

    for (let i = 0; i < xValues.length-1; i++) {
        let accelerationMagnitude_first = Math.sqrt(xValues[i] * xValues[i] + yValues[i] * yValues[i] + zValues[i] * zValues[i]);
        let accelerationMagnitude_Second = Math.sqrt(xValues[i+1] * xValues[i+1] + yValues[i+1] * yValues[i+1] + zValues[i+1] * zValues[i+1]);
        let diff=Math.abs(accelerationMagnitude_Second-accelerationMagnitude_first);
        console.log("diff",diff)
        let diff_betweenTwoPoint = 10; // Adjust threshold as needed
        let currentTimestamp = Date.now();
        if (lastTimestamp_B !== 0) {
            let deltaTime = (currentTimestamp - lastTimestamp_B) / 1000; // Convert to seconds
            if (diff_betweenTwoPoint > thresholdB) {
                steps_B++;
            }
        }
        lastTimestamp_B = currentTimestamp;
        
    }
    console.log("steps_B",steps_B)
    //return(steps_B)
    // Calculate step frequency (steps per minute)
    let stepFrequency_B = steps_B / ((lastTimestamp_B - lines.length * 5) / 1000 / 60)
    console.log("方法二 步频 (步/分钟): " + stepFrequency_B.toFixed(2));
    //push(ShoppingListInDB,method2Result);
    //把方法一获得的步频 放入标签为step_BList的数据库里
    push(steps_BListInDB,stepFrequency_B);
    */

}


function lowPassFilter(inputData,alpha){
    let outputSignal=[];
    let lastOutput=inputData[0]; //初始时，输出信号等于输入信号的第一个值
    
}


// 双重积分函数，使用梯形法则
//sliding window 为20
function doubleIntegration(acceleration) {
    
    let totalDistance=0;
    //采样频率为20Hz
    const samplingFrequency=20;

    //计算时间间隔
    const dt=1/samplingFrequency;

    //totalDistance=0;
    let results=[];

    time=[];
    for(let i=0;i<acceleration.length;i++){
        time.push(i*dt);
    }
    
    if (acceleration.length !== time.length) {
        console.error("Lengths of acceleration and time arrays must be the same.");
        return;
    }

    let velocity = [0]; // 初始速度为0
    let displacement = [0]; // 初始位移为0

    for (let i = 1; i < acceleration.length; i++) {
        let avgAcceleration = (acceleration[i] + acceleration[i - 1]) / 2; // 梯形法则取平均加速度

        let newVelocity = velocity[i - 1] + avgAcceleration * dt; // 计算新速度
        velocity.push(newVelocity);

        let avgVelocity = (velocity[i] + velocity[i - 1]) / 2; // 梯形法则取平均速度
        let newDisplacement = displacement[i - 1] + avgVelocity * dt; // 计算新位移
        displacement.push(newDisplacement);
    }
   
    totalDistance+=displacement[displacement.length-1];
    results=[displacement,totalDistance];

    return results;
}

let time;


let data1=[0.9937566978900642, 0.9881038958969849, 0.9878731439083811, 0.9890023341267065, 0.9909928481236553, 0.9905099203252271, 0.9882271868728574, 0.9913237784662648, 0.992764718067904, 0.9898392304616115, 0.9887257808848989, 0.9885656754191346, 0.9885712526045725, 0.9926661891070392, 0.9871386983702823, 0.9889480994716755, 0.9901303193385661, 0.9908730668623782, 0.9881657695020387, 0.9898480446111885]

let ans=doubleIntegration(data1);

console.log(data1);
console.log("displacement",ans[0]);
console.log("total distance",ans[1]);

// Event listener for the scan button
document.getElementById("scanButton").addEventListener("click", startScan);

document.getElementById("startSampling").addEventListener("click",function(){
    sendBluetoothData("S31OK");
    console.log("S31OK");
    intializeData();

});

document.getElementById("endSampling").addEventListener("click",function(){
    sendBluetoothData("S32OK");
    console.log("S32OK");
});

document.getElementById("sendData").addEventListener("click",function(){
    sendBluetoothData("SG1OK");
    console.log("SG1OK");
});
