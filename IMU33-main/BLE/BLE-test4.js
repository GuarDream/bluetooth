// link to firebase Realtime database
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs,getDoc,setDoc,doc,query,where,orderBy ,onSnapshot,limit} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"; 

import {getDatabase,ref,push,onValue,remove,set,get,child} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js"
import{butterworthLowpassFilter,findPeaks,diff_Peaks} from './Gait.js';
import { barProgress,barIntialiaze } from "../bar_walking/bar.js";
import { getCurrentTimeString,graph,sendParameter} from "../timer/timer.js";
import StepDetector from './Gait.js';
//import { onSnapshot } from "firebase/firestore";
//import { query } from "firebase/database";
//import {training_session} from '../taskCompletion/taskCompletion.js';

const firebaseConfig = {
    apiKey: "AIzaSyCZInOgnlv9J9-CRIQfwd9ofRMvgXri47g",
    authDomain: "imu33-1dbad.firebaseapp.com",
    databaseURL: "https://imu33-1dbad-default-rtdb.firebaseio.com",
    projectId: "imu33-1dbad",
    storageBucket: "imu33-1dbad.appspot.com",
    messagingSenderId: "137294131846",
    appId: "1:137294131846:web:59a038aacf2e48fcb01707",
    measurementId: "G-B8YY2TBEXX"
  };


  // Initialize Firebase
const app=initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database=getDatabase(app);
//每次刷新一次，可以删除username；
const loginName = document.getElementById('loginName');

//Initialize Firestore
const db_firestore = getFirestore();

//将username 存储在 LocalStorage
var username=localStorage.getItem('username');
var isLoggedIn;
var date

const date_today=getCurrentTimeString().currentDate;
const time_now=getCurrentTimeString().currentTTime;

console.log("今天的日期：",date_today);
console.log("现在的时间：",time_now);
var processSnapshots;

var readResult;
window.onload = function() {

    if(username){
        isLoggedIn=1;
        console.log(isLoggedIn);
        loginName.textContent = username;
        processSnapshots=1;
        queryForDocuments();
        logBtn.textContent="退出"
        
    }else{
        isLoggedIn=0;
        console.log(isLoggedIn);
        logBtn.textContent="登入"
    }
};



async function addNewDocument(){
    const newDoc=await addDoc(ordersCollection,{
        customer:"Arthur",
        drink:"Latte",
        total_cost:(100+Math.floor(Math.random()*400))/100,
    });
}
//addNewDocument();


async function readASingleDocument(){
    const mySnapshot=await getDocs(db_firestore,'Clara');
    if(mySnapshot.exists()){
        const docData=mySnapshot.data();
        console.log(`My data is ${JSON.stringify(docData)}`);
    }

}
//readASingleDocument();



async function queryForDocuments(){
    const resultQuery=query(
        collection(db_firestore,`users`,`${username}`,`${date_today}`),
        //where('trainingData','==',`${date_today}`),
        //limit(10),//限值查询的数量
        //where('trainingData','==',`${date_today}`)
        //orderBy('price'),
    );
    onSnapshot(resultQuery,(querySnapshot)=>{
    if(processSnapshots){
    querySnapshot.forEach((snap)=>{
        const resultOfTime=snap.data();
        //console.log(`Document ${snap.id} contains ${JSON.stringify(snap.data())}`);
        const result_DTW=resultOfTime.DTW;
        const result_cadence=resultOfTime.cadence;
        const result_steps=resultOfTime.steps;
        const result_strideLen=resultOfTime.strideLen;
        const result_min=resultOfTime.min;
        const result_sec=resultOfTime.sec;
        const result_time=resultOfTime.time;
        console.log(`DTW: ${result_DTW}, Cadence: ${result_cadence}, Steps: ${result_steps}, Stride Length: ${result_strideLen}`);
        barIntialiaze(result_time,result_min,result_sec,result_steps,result_DTW,result_cadence,result_strideLen)
        
    }) }
})

}



//localStorage.removeItem('username');

const dbRef=ref(getDatabase());
function getTime(date){
    get(child(dbRef,`username/${date}/time`)).then((snapshot)=>{
        if (snapshot.exists()) {
        console.log(snapshot.val());
        } else {
        console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });

}




let lastTimestamp = 0;
var steps = 0;
var turns=0;
let RX_characteristic;
let TX_characteristic;
let fileName; 

var xValues = [];
var yValues = [];
var zValues = [];
var Magnitude=[];
var filteredSignal = [];

let timerInterval;
let seconds = 0;
let minutes = 0;

const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');


//设定检测步态峰值的一个range
var step_peak_max;
var step_peak_min;

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
    index=[];
    index_diff=[];
    steps_index=[];
    steps_values=[];
    j=0;
    steps_A = 0;
    steps_B=0;
    dis_num=0;
    totalDistance_Sum=0
    steps=0;
    graph(450);
    document.getElementById("steps_number").textContent=0;
}




//输入用户的信息



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
    const X_ListInDB=ref(database,username+"/" +fileName+"/X_ListInDB");
    const Y_ListInDB=ref(database,username+"/" +fileName+'/Y_ListInDB');
    const Z_ListInDB=ref(database,username+"/" +fileName+'/Z_ListInDB');

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
        //displayReceivedData(decodedString);
        return;
    }
    
    //let dataView = new DataView(value.buffer);
    // 在控制台打印转换后的十六进制字符串
    //IMU 的指令进行解码 && 数据整理；
    let receivedData = "";

    // 创建一个 ArrayBuffer 来表示字节序列
    let bytes = new Uint8Array(a).buffer;

    // 创建 DataView 对象
    let dataView = new DataView(bytes);

   
    let dataType=dataView.getUint8(0)
    // 辨别x,y,z

    let direct=[]
    let acc_result=[]
    let b=0

    for(let i=0;i<3;i++){
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
    //displayReceivedData(acc_result);
    console.log(`${direct}:${accValue}`);

    }
    console.log("total acc_result", acc_result)

    // Process IMU data and send data if step count increases
    let currentSteps = IMUprocess(acc_result); 
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
var cnt=0;
var index=[];
var index_diff=[];
var steps_index=[];
var steps_values=[];
var j=0;


var threshold_mean_input_first;
var threshold_mean_filtered_first;
var step_diffpeaks_minValue;
var step_diffpeaks_maxValue;
var turn_diffpeaks_minValue;
var turn_diffpeaks_maxValue;
var peak_mean;
var peak_mean_filtered;
var diffMean1;
var diffMean1_filtered;
//let lowPassFilter = new LowPassFilter(4, 20);
var cnt_values=[];

// 播放节奏函数
function playRhythm() {
    // 检测步态
        // 播放音乐
        var player = document.getElementById("audio");
        document.getElementById("steps_number").textContent=steps_A;
        player.play();
        sendBluetoothData("SBPOK");
        
}

function IMUprocess(data){
    const database=getDatabase();
    const tempo_sign=document.getElementById('buttonTempo').textContent
    const preMag=[];
    const postMag=[];



    const steps_AListInDB=ref(database,username+"/" +fileName+"/steps_AListInDB");
    const steps_BListInDB=ref(database,username+"/" +fileName+'/steps_BListInDB');
    const MagListInDB=ref(database,username+"/" +fileName+'/MagListInDB');
    const diffListInDB=ref(database,username+"/" +fileName+'/DiffListInDB');
    const result=ref(database,username+"/" +fileName+'/ResultListInDB');
    

    
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

        push(MagListInDB,accelerationMagnitude);
        console.log("i",i,'Mag',accelerationMagnitude) 
        // 阈值算法
        
        if(i===200){
            console.log("进入无滤波计算滤波");
            let input=Magnitude.slice(20,200);
            //创建一个LPF
            filteredSignal = [];

            filteredSignal=butterworthLowpassFilter(input,4,20,fileName,username);
            //filteredSignal=input;
            console.log("Filtered Signal:", filteredSignal);
            
            //创建步数检测器实例
            const stepDetector =new StepDetector(20,0.5,username,fileName);
            var thresholdValues_input=[];
            
            filteredSignal=filteredSignal.slice(1);
            // 以下为filtered的结果
            
            var thresholdValues_filtered=[];
            filteredSignal.forEach(dataPoint => {
                stepDetector.updateThreshold(dataPoint);
                stepDetector.detectStep(dataPoint);
            });
            
            for (const dataPoint of filteredSignal) {
                const threshold_filtered = stepDetector.updateThreshold(dataPoint);
                thresholdValues_filtered.push(threshold_filtered);
            }
                        //动态寻找阈值
            console.log("thresholdValues",thresholdValues_filtered);
            //对动态阈值求平均
            let threshold_sum_input_fil=thresholdValues_filtered.reduce((acc,curr)=>acc+curr,0);
            console.log("threshold_sum",threshold_sum_input_fil);
            threshold_mean_filtered_first=threshold_sum_input_fil/thresholdValues_filtered.length;
            console.log("threshold_mean_filtered__first",threshold_mean_filtered_first);
            push(result,`threshold_mean_filtered__first+"/"+${threshold_mean_filtered_first}`);

            const{peaks, peaks_values}=findPeaks(username,fileName,filteredSignal,threshold_mean_filtered_first);
            console.log("peaks_values",peaks_values);
            //console.log("第一次peaks 的数量(第一次检测步态的数量)",peaks_values_filtered.length);
            console.log("peaks",peaks);
            peak_mean_filtered=peaks_values.reduce((acc,curr)=>acc+curr,0)/peaks_values.length;
            console.log("peak_mean_filtered",peak_mean_filtered);

            //进行峰值与峰谷的差值
            const {diff,diffMean,diffIndex,final_diff_Values,finalIndex}=diff_Peaks(peaks,filteredSignal,peak_mean_filtered);
            diffMean1_filtered=diffMean;
            console.log("diffMean_filtered =", diffMean1_filtered);
            //console.log("diff 的数量",diffIndex_filtered.length);
            console.log("diffIndex_filtered",diffIndex);
            console.log("diff 的值",diff);
            console.log("finalIndex",finalIndex);
            console.log("StepCount",finalIndex.length);
            console.log("final_diff_Values",final_diff_Values);
            steps=finalIndex.length;

            //以上为filtered的结果
            

            //以下为non filtered的结果
            input.forEach(dataPoint => {
                stepDetector.updateThreshold(dataPoint);
                stepDetector.detectStep(dataPoint);
            });
            
            for (const dataPoint of input) {
                const threshold_input = stepDetector.updateThreshold(dataPoint);
                thresholdValues_input.push(threshold_input);
            }
            //动态寻找阈值
            console.log("thresholdValues",thresholdValues_input);
            //对动态阈值求平均
            let threshold_sum_input=thresholdValues_input.reduce((acc,curr)=>acc+curr,0);
            console.log("threshold_sum",threshold_sum_input);
            threshold_mean_input_first=threshold_sum_input/thresholdValues_input.length;
            console.log("threshold_mean_input_first",threshold_mean_input_first);
            push(result,`threshold_mean_input_first+"/"+${threshold_mean_input_first}`);

            //let peaks=[];//记录峰值的索引
            //let peaks_values=[];
            //用找到的平均值，获得第一次峰值
            var { peaks: peaks2, peaks_values: peaksValues2 } =findPeaks(username,fileName,input,threshold_mean_input_first);
            console.log("peaks_values",peaksValues2);
            console.log("第一次peaks 的数量(第一次检测步态的数量)",peaksValues2.length);
            console.log("peaks",peaks);
            peak_mean=peaksValues2.reduce((acc,curr)=>acc+curr,0)/peaksValues2.length;
            console.log("peak_mean",peak_mean);

            //进行峰值与峰谷的差值
            var { diff: diff2, diffMean: diffMean2, diffIndex: diffIndex2, final_diff_Values: final_diff_Values2, finalIndex: finalIndex2 } = diff_Peaks(peaks2, input, peak_mean);
            diffMean1=diffMean2;
            console.log("diffMean =", diffMean2);
            console.log("diff 的数量",diffIndex2.length);
            console.log("diffIndex",diffIndex2);
            console.log("diff 的值",diff2);
            console.log("finalIndex",finalIndex2);
            console.log("StepCount",finalIndex2.length);
            console.log("final_diff_Values",final_diff_Values2);
            steps_A=finalIndex2.length;

            /*
            step_diffpeaks_maxValue=Math.max(...final_diff_Values);
            step_diffpeaks_minValue=Math.min(...final_diff_Values);
            //显示NaN
            console.log("step_diffpeaks的最大值:",step_diffpeaks_maxValue);
            console.log("step_diffpeaks的最小值:",step_diffpeaks_minValue);

            //寻找第二阶梯折返的区间值
            const turn_index = diffIndex
            .map((element, index) => !finalIndex.includes(element) ? index : null)
            .filter(index => index !== null);
            console.log("turn_index",turn_index);

            const turn_diffpeak_index=turn_index.map(index => diffIndex[index])

            const turn_diffpeak_Values=turn_index.map(index=>diff[index]);

            //寻找第二阶梯折返的区间值
            turn_diffpeaks_maxValue=Math.max(...turn_diffpeak_Values);
            turn_diffpeaks_minValue=Math.min(...turn_diffpeak_Values);
        
            console.log("turn_diffpeak_index",turn_diffpeak_index);
            console.log("turn_diffpeak_Values",turn_diffpeak_Values);
            console.log("turn_diffpeaks_maxValue",turn_diffpeaks_maxValue);
            console.log("turn_diffpeaks_minValue",turn_diffpeaks_minValue);
            */
            //sendBluetoothData("S32OK");
            playRhythm();
            playRhythm();
            console.log("正式开始检测步态");
            //

        }

    
    else if(i>200){
    
        const diff_then=Magnitude[i]-Magnitude[i-2];
            if(Magnitude[i]>Magnitude[i-2]&&Magnitude[i]>peak_mean*0.95){
                    if(diff_then>diffMean1*0.95){
                        j=j+1;
                        
                        index.push(i);}
                        if(j>0){
                            index_diff=index[j-1]-index[j-2];
                            playRhythm();
                        
                            if(index_diff>8){
                                
                                steps_index.push(i);
                                steps_values.push(Magnitude[i]);
                                steps_A++;
                                

                                console.log("检测到步态",steps_A);
                            }
                        //postMag.push(filteredSignal[i]);
                        //postDiff.push(diff_then);
                        }
                    }
        

        
        /*
        var postPeak_mean;
        var postDiff_mean;
        
        const postMag=[];
        const postDiff=[];
        
        var diff_then_filtered;
        cnt_values.push(Magnitude[i]);
        console.log("cnt_values",cnt_values.length);
        console.log(cnt_values);
        //cnt++;
        //if(第一阶梯检查)
        
        if( cnt_values.length===60){
            filteredSignal = [];
            filteredSignal=butterworthLowpassFilter(cnt_values,4,20,fileName,username);
            //push(FilteredListInDB,filteredValue);
            console.log(filteredSignal);
            filteredSignal=filteredSignal.slice(1)
            cnt_values=[];
            
            for(var h=0;h<filteredSignal.length;h++){
                diff_then_filtered=filteredSignal[h]-filteredSignal[h-2]
                if(filteredSignal[h]>filteredSignal[h-2]&&filteredSignal[h]>peak_mean_filtered){
                    if(diff_then_filtered>diffMean1_filtered){
                        postMag.push(filteredSignal[h]);
                        postDiff.push(diff_then);
                        steps++;

                        
                        console.log("检测到步态");
                        console.log("步态",steps);
                        
                        if(postMag.length===5){
                            postPeak_mean=postMag.reduce((acc,curr)=>acc+curr,0)/preMag.length;
                            postDiff_mean=postDiff.reduce((acc,curr)=>acc+curr,0)/postDiff.length;
                            console.log("postDiff_mean",postDiff_mean);
                            console.log("postPeak_mean",postPeak_mean)
                            if(postPeak_mean>peak_mean*0.90 && postPeak_mean<peak_mean*1.1){
                                peak_mean=postPeak_mean;
                            }
                            if(postDiff_mean>diffMean1*0.90 && postPeak_mean<diffMean1*1.1){
                                diffMean1=postDiff_mean;
                            }
                            postMag=[];
                            postDiff=[];
                            

                            }
                        }
                    }
                    
                }
                
                
        }*/
    }

}console.log("step_A",steps_A);
console.log("steps_index",steps_index);
console.log("steps_values",steps_values);
console.log("j",j);

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


/*
let ans=doubleIntegration(data1);

console.log(data1);
console.log("displacement",ans[0]);
console.log("total distance",ans[1]);
*/
var time;

//当检测到步态就发出信号
function detectGait(){
    sendBluetoothData("SBPOK");
    console.log("检测到一个步态 发送SBPOK");
}

let startTime,endTime,duration;

// Event listener for the scan button
document.getElementById("scanButton").addEventListener("click", startScan);

document.getElementById("startButton").addEventListener("click",function(){
    //startTimer();//显示表开始
    //playRhythm();
    sendBluetoothData("S31OK");
    console.log("S31OK"); 
    startTime=new Date();
    const clock=getCurrentTimeString();
    fileName=clock.currentTimeString;
    date=clock.currentDate;
    time=clock.currentTTime;
    console.log(fileName,date,time);
    const timeData=getTime(date);
    console.log(timeData);

    //const progressDataStr = localStorage.getItem(`${username}_${date}_progress`);
    /*
    if (progressDataStr) {
        console.log("更新");
        const progressData = JSON.parse(progressDataStr);
        const startTime = new Date(progressData.startTime);
        const endTime = new Date(progressData.endTime);
        const duration = progressData.duration;
        const steps = progressData.steps;
        barProgress(startTime, endTime, duration, steps, fileName, username);
    }
    */
});



document.getElementById("pauseButton").addEventListener("click",function(){
    sendBluetoothData("S32OK");
    console.log("S32OK");
    //pauseTimer();//显示表暂停
    
});

document.getElementById("endButton").addEventListener("click",function(){
    //endTimer();// 显示表的结束
    sendBluetoothData("S32OK");
    console.log("S32OK");
    
    endTime=new Date();
    duration=(endTime-startTime);//duration calculate in minute
    barProgress(startTime,endTime,duration,steps,fileName,username,date,time,steps_A,processSnapshots=0);
    intializeData();
    if(isPlaying){
        isPlaying=false;
    }
   
});

//模拟用户登入状态

document.getElementById("loginName").addEventListener("click",function(){
    
    updateLoginStatus();
})

function updateLoginStatus(){
    if(isLoggedIn){
            // 如果用户已登录，则更改按钮文本为用户的名称   
    loginName.textContent = username;
    //queryForDocuments()
    logBtn.textContent="退出"
  } else {
    // 如果用户未登录，则按钮文本为Visitor
    loginName.textContent = "未登入";
    window.location.href = "login/login.html"
    logBtn.textContent="登入"
  }
}


document.getElementById('logBtn').addEventListener('click', function() {
    if(logBtn.textContent==="登入"){
        window.location.href = "login/login.html"
    }else{
        localStorage.removeItem('username')
        alert('成功退出');
        logBtn.textContent="登入"
        loginName.textContent = "Visitor";
        isLoggedIn=0;

    }
});

document.getElementById('profileBtn').addEventListener('click',function(){
    if(isLoggedIn){
        window.location.href = "profile/profile.html"
    }else{
        window.location.href = "login/login.html"
    }
})

