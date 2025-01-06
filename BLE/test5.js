// link to firebase Realtime database
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"

import {getDatabase,ref,push,onValue,remove,set} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import{butterworthLowPassFilter,applyFilter,findPeaks,diff_Peaks,LowPassFilter} from './Gait.js';


import StepDetector from './Gait.js';


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

// 采样频率
var fs = 20.0;

// 截止频率
var cutoff = 4;

// 归一化截止频率
var nyq = 0.5 * fs;
var normal_cutoff = cutoff / nyq;

// 设计低通Butterworth滤波器
var order = 1;
var b, a;


var totalDistance_Sum=0;

const sampleRate = 20; // 采样率为 20 Hz
const cutoffFreq = 4; // 截止频率为 50 Hz

// html 结果显示的变量 设置
const resultDisplay=document.getElementById('stepCount');


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


//输入用户的信息

function writeUserData(){

    fileName=document.getElementById("inputField").value;
    const database=getDatabase();
    console.log(fileName);
    var output=document.getElementById("output");
    output.innerText="文件名称是："+fileName;
    //const postList=ref(database,'')
    
    /*
    set(step_a,{
        step:2,
        //email:email,
    });
    */
    }


//writeUserData("test222");

document.getElementById("saveFileName","").addEventListener("click",writeUserData);




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
    const database=getDatabase();
    //const fileName="test0652";
    const X_ListInDB=ref(database,fileName+"/X_ListInDB");
    const Y_ListInDB=ref(database,fileName+'/Y_ListInDB');
    const Z_ListInDB=ref(database,fileName+'/Z_ListInDB');

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

    // 创建一个 ArrayBuffer 来表示字节序列
    let bytes = new Uint8Array(a).buffer;

    // 创建 DataView 对象
    let dataView = new DataView(bytes);

    // !! Loop through data in chunks of 5 bytes (assuming each data point is 5 bytes)
    //console.log(dataView);
    //console.log(dataView.byteLength);
    
   
    let dataType=dataView.getUint8(0)
    // 辨别x,y,z

    let direct=[]
    let acc_result=[]
    let b=0

    for(let i=0;i<3;i++){
    //let direct=direction(dataView.getUint8(i*5));//0,5,10 
    //let direct=direction(dataType);
    //console.log(direct);
    //1,5;6,10;11,15
    b=(i*5)+1;
    console.log("b",b)
    console.log(a.slice(b,b+3))
    let accValue=String2hex(a.slice(b,b+3));

    if(i===0){
        direct="X";
        push(X_ListInDB,accValue);
        xValues.push(accValue);

    }else if(i===1){
        direct=="Y";
        push(Y_ListInDB,accValue);
        yValues.push(accValue);
    }else if(i===2){
        direct="Z";
        push(Z_ListInDB,accValue);
        zValues.push(accValue);
    }

    
    acc_result[i]=`${direct}: ${accValue}`;
    displayReceivedData(acc_result);
    console.log(`${direct}:${accValue}`);

    }
    console.log("total acc_result", acc_result)

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
  
let bytes1 = ['0xaa','0xbd', '0x13', '0x80', '0x00', '0xbb', '0x3c', '0xf5', '0x00', '0x00', '0xcc', '0x3f', '0x81', '0xc4', '0x00']; // Array of bytes
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

var threshold_mean_first;

function IMUprocess(data) {
    const database=getDatabase();
    //const fileName="test0652";

    const steps_AListInDB=ref(database,fileName+"/steps_AListInDB");
    const steps_BListInDB=ref(database,fileName+'/steps_BListInDB');
    const MagListInDB=ref(database,fileName+'/MagListInDB');
    const diffListInDB=ref(database,fileName+'/DiffListInDB');
    

    
    var output=document.getElementById("output");
    output.innerText="文件名称是："+fileName;

    //let lines = data.split(",");
    // ？？需不需要将xValues，yValues 以及zValues 设为全局变量

    
    let lastTimestamp_A = 0;
 
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
        
        if(i===50){
            console.log("进入无滤波计算滤波");
            let input=Magnitude.slice(20,50);
            //创建一个LPF
            
            let lowPassFilter = new LowPassFilter(4, 20);

            let filteredSignal = [];
            for (let i = 0; i < input.length; i++) {
            let filteredValue = lowPassFilter.apply(input[i]);
            filteredSignal.push(filteredValue);
            }
            
            console.log("Filtered Signal:", filteredSignal);

            //应用LPF
            //var filteredData=lowPassFilter.process(input);
            //IIRFilter(filter,cutoff,sampleRate)
            //var filter=IIRFilter(LOWPASS,4,20);
           //filteredData=filter.process(input);

            /*
            let filterCoefficients = butterworthLowPassFilter(fs=20, cutoff=4, order=1);
            let filteredData=applyFilter(fileName,input,filterCoefficients.b, filterCoefficients.a);
            console.log("After butterworth LPF ",filteredData);
            console.log("filteredData",filteredData.length);
            */
            //创建步数检测器实例
            const stepDetector =new StepDetector(20,0.5,fileName);
            var thresholdValues=[];

            input.forEach(dataPoint => {
                stepDetector.updateThreshold(dataPoint);
                stepDetector.detectStep(dataPoint);
            });
            
            for (const dataPoint of input) {
                const threshold = stepDetector.updateThreshold(dataPoint);
                thresholdValues.push(threshold);
            }
            
            console.log("thresholdValues",thresholdValues);
            let threshold_sum=thresholdValues.reduce((acc,curr)=>acc+curr,0);
            console.log("threshold_sum",threshold_sum);
            threshold_mean_first=threshold_sum/thresholdValues.length;
            console.log("threshold_mean_first",threshold_mean_first);

            //let peaks=[];//记录峰值的索引
            //et peaks_values=[];
            const { peaks, peaks_values }=findPeaks(fileName,input,threshold_mean_first);
            console.log("peaks_values",peaks_values);
            console.log("第一次peaks 的数量(第一次检测步态的数量)",peaks_values.length);
            console.log("peaks",peaks);

            //进行峰值与峰谷的差值
            const {diff,diffMean,diffIndex,finalIndex}=diff_Peaks(peaks,input);
            console.log("diffMean =", diffMean);
            console.log("diff 的数量",diffIndex.length);
            console.log("diff 的值",diff);
            console.log("finalIndex",finalIndex);
            console.log("StepCount",finalIndex.length);
            
            //将结果显示

            const final_index=[];
            

            // 将结果实时显示在html 上
            resultDisplay.textContent=100;

            

        }
/*
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
        */
        
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


//当检测到步态就发出信号
function detectGait(){
    sendBluetoothData("SBPOK");
    console.log("检测到一个步态 发送SBPOK");
}

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

/*
document.getElementById("sendData").addEventListener("click",function(){
    sendBluetoothData("SG1OK");
    console.log("SG1OK");
});
*/
