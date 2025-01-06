// link to firebase Realtime database
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import {getDatabase,ref,push,onValue,remove,set} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings={
    // 换成 firebase realtime 的API
    databaseURL:"https://imu33-1dbad-default-rtdb.firebaseio.com/"
}


const app=initializeApp(appSettings)
const database=getDatabase(app)
//const thresholdListInDB=ref(database,fileName+'/thresholdListInDB');


// Butterworth 低通滤波器

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


export function butterworthLowpassFilter(values, cutoffFreq, fs,fileName,username) {
    /*
     * Butterworth低通滤波器
     * values: 输入信号序列
     * cutoffFreq: 截止频率（Hz）
     * fs: 采样频率（Hz）
     * 返回滤波后的信号序列
     */
    const database=getDatabase();
    const FilteredListInDB=ref(database,username+"/" +fileName+'/FilteredListInDB');
    // 计算归一化截止频率
    const nyquistFreq = 0.5 * fs;
    const normalizedCutoffFreq = cutoffFreq / nyquistFreq;

    // 计算Butterworth滤波器系数
    const order = 1; // 一阶滤波器
    const [b, a] = butterworthCoefficients(order, normalizedCutoffFreq);

    // 使用滤波器系数进行滤波
    const filteredValues = applyFilter(values, b, a);
    push(FilteredListInDB,filteredValues)

    return filteredValues;
}

function butterworthCoefficients(order, cutoff) {
    /*
     * 计算Butterworth滤波器系数
     * order: 滤波器阶数
     * cutoff: 归一化截止频率
     * 返回滤波器系数b和a
     */

    // 构造Butterworth滤波器
    let b = [];
    let a = [];
    for (let k = 0; k < order; k++) {
        // 生成极点的角度
        const theta = Math.PI * (2 * k + order + 1) / (2 * order);
        // 构造极点
        const realPart = -Math.sin(theta);
        const imagPart = Math.cos(theta);
        console.log("realPart",realPart);
        console.log("imag",imagPart);

        // 构造归一化极点
        const pole = math.complex(realPart,imagPart);
        // 将归一化极点映射到截止频率处
        console.log("pole",pole);      
        b.push(math.complex(cutoff + pole));
        a.push(math.complex(pole +(-cutoff)));
    }
    console.log("b",b);
    console.log("a",a);
    

    return [b, a];
}

function applyFilter(values, b, a) {
    /*
     * 使用滤波器系数进行滤波
     * values: 输入信号序列
     * b: 滤波器的分子系数
     * a: 滤波器的分母系数
     * 返回滤波后的信号序列
     */

    // 初始化输出序列
    const filteredValues =[];
    // 使用滤波器系数进行滤波
    for (let i = 0; i < values.length; i++) {
        if (i === 0) {
        const m= math.multiply(b,values[i]);
        //console.log("values[0]",values[i]);
        //console.log("b",b);
        filteredValues[i]=math.re(m);
        console.log(i,"values",values[i],"m",m,"filteredValues[0]",filteredValues[i]);
        } else {
            const k=math.multiply(b ,values[i]);
            //console.log("k",math.re(k))
            const h= math.multiply(a, filteredValues[i - 1]);
            //const result = math.subtract(k, h);
            
            //console.log(math.re(result));
            filteredValues[i] =math.re(k)-math.re(h);
            console.log(i,"values",values[i],"k",math.re(k),"h",math.re(h),"math.re(filteredValues[i])",math.re(filteredValues[i]));
        
        }
    }
    
    console.log(filteredValues);
    return filteredValues;
}


//const values = Array.from({ length: 1000 }, () => Math.random());
// 采样频率和截止频率

const cutoffFreq = 4; // 截止频率（Hz）

/* 应用Butterworth低通滤波器
const filteredValues = butterworthLowpassFilter(values, cutoffFreq, fs);
console.log(filteredValues);
*/
  


    // 动态阈值绘制函数
    function drawThresholdChart(thresholdValues) {
        const canvas = document.getElementById("myCanvas");
        // 设置 Canvas 元素的宽度和高度
        canvas.width = 800; // 设置宽度为 800 像素
        canvas.height = 600; // 设置高度为 600 像素
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        const stepX = canvas.width / (thresholdValues.length - 1);
        for (let i = 0; i < thresholdValues.length; i++) {
            const x = i * stepX;
            const y = canvas.height - thresholdValues[i] * canvas.height;
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "blue";
  
        ctx.stroke();
    }

class StepDetector {
    constructor(windowSize, thresholdFactor,username,fileName) {
        
        this.windowSize = windowSize;
        this.thresholdFactor = thresholdFactor;
        this.dataWindow = [];
        this.thresholdValues = []; // 存储阈值变化
        this.peakCount = 0;
        this.username = username;
        this.fileName=fileName;
    }

    updateThreshold(newValue) {
        const database=getDatabase();
        const thresholdListInDB=ref(database,this.username+"/" +this.fileName+'/thresholdListInDB');
        this.dataWindow.push(newValue);
        if (this.dataWindow.length > this.windowSize) {
            this.dataWindow.shift(); // 移除最旧的数据
        }
        if (this.dataWindow.length === this.windowSize) {
            const threshold = parseFloat((this.dataWindow.reduce((acc, val) => acc + val, 0) / this.dataWindow.length).toFixed(4)); // 计算窗口内数据的均值作为阈值
            this.thresholdValues.push(threshold); // 记录阈值变化
            push(thresholdListInDB,threshold)
            return threshold;
        }
    }

    detectStep(newValue) {
        const threshold = this.updateThreshold(newValue);
        if (threshold === undefined) {
            return false;
        }
        if (newValue > threshold * this.thresholdFactor) {
            this.peakCount++;
            return true;
        } else {
            return false;
        }
    }
}

export default StepDetector;


export function findPeaks(username,fileName, data, threshold) {
    const database=getDatabase();
    const peaksValuesListInDB=ref(database,username+"/" +fileName+'/peaksValuesListInDB');
    const peaks = [];
    const peaks_values=[];
    for (let i = 1; i < data.length - 1; i++) {
        if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]) {
            peaks.push(i);
            peaks_values.push(data[i]);
            push(peaksValuesListInDB,data[i]);
        }
    }
    console.log(peaks);
    return { peaks, peaks_values};
}

export function diff_Peaks(peaks,input,peak_mean){// 计算峰值前两个索引
    const prePeakIndex = peaks.map(peak => peak - 2);
    if(prePeakIndex[0]<0){
        prePeakIndex[0]=0;
    }
    // 获取峰值前两个值
    const peakValues = peaks.map(index => input[index]);
    const prePeakValues = prePeakIndex.map(index => input[index]);
    const diff = []; // 存储差值
    const diffIndex = []; // 存储差值对应的索引
    const finalIndex=[];// 对diff 进行阈值判别，若符合条件则将索引存储在finalIndex
    const final_diff_Values=[]; //抱球d
    let stepCount=0;
    for (let i = 0; i < peaks.length; i++) {
        diff.push(peakValues[i] - prePeakValues [i]);
        diffIndex.push(peaks[i]);
    }
    // 计算 diff 的平均值的一半
    const diffMean = diff.reduce((sum, value) => sum + value, 0) / (diff.length);
    //console.log("diffMean =", diffMean);

    for(let j=0; j<peaks.length; j++){
        if(diff[j]>diffMean*0.95 && peakValues[j]>peak_mean*0.95){
            final_diff_Values.push(diff[j]);
            finalIndex.push(peaks[j]);
            
        }
    }
    return { diff, diffMean, diffIndex,final_diff_Values,finalIndex};
    
}


// 使用示例
//const peakThreshold = 0.5; // 设置峰值阈值
//const peaks = findPeaks(k, peakThreshold);



const Data1 = [0.6138609632432875, 0.7510407394140469,0.7510407613194491, 0.7510327037677651, 0.7512274769395114, 0.7512783948185038, 0.7511806626753152, 0.7510862855223891, 0.7190759801209679, 0.7190461626106591, 0.7190873009581252, 0.7191462504871319, 0.7190615700612023, 0.5743708289729121, 0.6138644637427033,0.5744471662274014, 0.5319213565808728, 0.5207678929057217, 1.0083945478288567, 0.51741066002153, 0.5171551236194856, 0.51714935780221, 0.5171050905346775, 0.5606468903610304, 0.5608170924307112, 0.5609397537789892, 0.5175290988299152, 0.5174948817903238, 0.5615125758436018, 0.5616558560669656, 1.0313094068399893, 1.0319067300036728, 1.032973954071986,0.5635400097973349, 0.5641219001534804, 0.5641642218329735, 0.5640330334038454, 0.5741154101187987, 0.563893421401261, 0.5613647907414501, 0.5608733279786665, 0.5615847199142922, 0.5642439423319838, 0.5641988422936439, 0.5617057328913836, 1.031946556575199, 0.5606844398586055, 0.5180666032771343, 0.517444526438877, 0.5182104436054787, 0.5180195298042642, 0.5180362809635585, 0.5180312235910792, 0.5604946631685905, 0.5605926280941358, 0.5613914976966112, 0.5616558182095308, 0.5616719467006949, 1.0317948082359611, 1.0318713225015144, 0.5642547529124189, 0.5641266598738198, 0.5641485735956789, 0.5641616885381115, 0.5740704755939533, 0.5740275991440521, 0.5640068087567113, 0.5615607393058117, 0.5615592085702494, 0.5641754420565681, 0.5641884637103098, 0.564311309864332, 1.0324474713169933, 1.0315317632897982, 0.5207806928832832, 0.5181188418238983, 0.5171992364079352, 0.5170741617059162, 0.5206627335272219, 0.5207821751479176, 0.5208170127677972, 0.564083293496986, 0.5641444158754332, 0.5641301579071499, 0.5614887407167649, 0.5614401966802667, 0.5643369023978041, 1.033688540732538, 1.032915967180865]






//console.log("thresholdValues",thresholdValues)
//drawThresholdChart(thresholdValues)
