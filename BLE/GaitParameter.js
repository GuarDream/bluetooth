// 加速度数据和时间戳数组（示例数据）
/*
let acceleration = [0.0497210510970731
    ,0.123780751390401
    ,0.126239820616544
    ,0.123559473081044
    ,0.0988192737304144
    ,0.128978198510246
    ,0.151878961865010
    ,0.154507032595694
    ,0.122531739498971
    ,0.132567518121124]; // 这里假设加速度单位为 m/s^2
let time = [0, 1, 2, 3, 4,5,6,7,8,9]; // 时间戳，单位为秒

// 双重积分函数，使用梯形法则
function doubleIntegration(acceleration, time) {
    if (acceleration.length !== time.length) {
        console.error("Lengths of acceleration and time arrays must be the same.");
        return;
    }

    let velocity = [0]; // 初始速度为0
    let displacement = [0]; // 初始位移为0

    for (let i = 1; i < acceleration.length; i++) {
        let dt = time[i] - time[i - 1]; // 时间间隔
        let avgAcceleration = (acceleration[i] + acceleration[i - 1]) / 2; // 梯形法则取平均加速度

        let newVelocity = velocity[i - 1] + avgAcceleration * dt; // 计算新速度
        velocity.push(newVelocity);

        let avgVelocity = (velocity[i] + velocity[i - 1]) / 2; // 梯形法则取平均速度
        let newDisplacement = displacement[i - 1] + avgVelocity * dt; // 计算新位移
        displacement.push(newDisplacement);
    }

    return displacement;
}

// 计算位移
let calculatedDisplacement = doubleIntegration(acceleration, time);
console.log("Calculated Displacement:", calculatedDisplacement);

*/

// Butterworth 低通滤波器
function butterworthLowpassFilter(signal, cutoffFreq, sampleRate, order) {
    // 计算截止频率的归一化频率
    const omegaC = 2 * Math.PI * cutoffFreq / sampleRate;

    // 计算 Butterworth 滤波器的极点
    const poles = [];
    for (let k = 0; k < order; k++) {
        const realPart = -Math.sin(Math.PI * (2 * k + 1) / (2 * order)) * Math.sinh(Math.asinh(1));
        const imagPart = Math.cos(Math.PI * (2 * k + 1) / (2 * order)) * Math.cosh(Math.asinh(1));
        poles.push({ real: realPart, imag: imagPart });
    }

    // 对信号进行滤波
    const filteredSignal = [];
    for (let n = 0; n < signal.length; n++) {
        let y = 0;
        for (let k = 0; k < order; k++) {
            const pole = poles[k];
            const zReal = Math.cos(omegaC) + pole.real;
            const zImag = Math.sin(omegaC) + pole.imag;
            const mag = Math.sqrt(zReal * zReal + zImag * zImag);
            const angle = Math.atan2(zImag, zReal);
            const factor = Math.pow(mag, -order);
            const term = (signal[n] * factor) * Math.cos(n * angle);
            y += term;
        }
        filteredSignal.push(y);
    }

    return filteredSignal;
}


// 将数据绘制在图表中
/*
const chartContainer = document.getElementById("chartContainer");
const ctx = chartContainer.getContext("2d");
ctx.beginPath();
ctx.moveTo(0, 200 + filteredSignal[0] * 100);
for (let i = 1; i < filteredSignal.length; i++) {
    ctx.lineTo(i, 200 + filteredSignal[i] * 100);
}
ctx.stroke();
*/


class StepDetector {
    constructor(windowSize, thresholdFactor) {
        this.windowSize = windowSize;
        this.thresholdFactor = thresholdFactor;
        this.dataWindow = [];
        this.thresholdValues = []; // 存储阈值变化
        this.peakCount = 0;
    }

    updateThreshold(newValue) {
        this.dataWindow.push(newValue);
        if (this.dataWindow.length > this.windowSize) {
            this.dataWindow.shift(); // 移除最旧的数据
        }
        if (this.dataWindow.length === this.windowSize) {
            const threshold = parseFloat((this.dataWindow.reduce((acc, val) => acc + val, 0) / this.dataWindow.length).toFixed(4)); // 计算窗口内数据的均值作为阈值
            this.thresholdValues.push(threshold); // 记录阈值变化
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




// 动态阈值绘制函数
    function drawThresholdChart(thresholdValues) {
        const canvas = document.getElementById("chartContainer");
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

    // 创建步数检测器实例
    const stepDetector = new StepDetector(20, 0.5);

    // 模拟数据
    const Data = [
        0, 1.021905006, 1.025349396, 1.034208857, 1.108074783, 1.11548967,
        1.064318643, 1.089486744, 1.077543924, 1.019322853, 0.949431368,
        0.998775925, 0.965231057, 1.010748033, 0.952661808, 1.002124735,
        1.047761528, 1.038190182, 1.021080513, 0.956823661, 0.966764947,
        1.010297491, 1.282587063, 0.965378779, 0.928911013, 0.962563403,
        1.019204281, 1.018596923, 1.040520398, 1.087415937, 0.984878457,
        1.013058023, 0.990083356, 0.971969822, 1.060225563, 1.217702495,
        1.005083907, 0.930876613, 0.851337832, 0.979811285, 1.037010648,
        1.245161665, 0.929844186, 1.013413185, 1.00027576, 0.96400756,
        0.946194238, 1.026858995, 1.268371017, 1.0785632, 0.907457181,
        0.967846056, 1.030095429, 0.983847409, 0.983919197, 1.015992832,
        1.296868364, 0.946006599, 1.044609943, 1.029884193, 0.927935882,
        0.995373492, 1.087018107, 1.214962834, 0.834272723, 1.01417615,
        0.976888595, 0.973679537, 1.015381667, 1.014762923, 1.097162706,
        0.997685892, 0.892142801, 0.997862222, 1.087552434, 1.020103922,
        1.027057281, 1.024207153, 0.990535126, 1.029112045, 1.022706251,
        1.012579636, 1.005303876, 0.975561537, 0.98949422, 0.988773932,
        1.00609083, 0.991923748, 1.135817902, 1.096350603, 0.95605888,
        1.055473268, 0.982829326, 0.979704791, 0.96368626, 1.029951477,
        1.233969549, 0.86952854, 0.960958775, 0.94602228, 1.004107704,
        1.036660444, 1.012733908, 1.005037835, 1.303329509, 0.817434339,
        1.023262045, 1.009810161, 0.965683028, 0.960253232, 1.021360787,
        1.385396805, 0.968852638, 0.933022336, 0.919775795, 1.021467402,
        1.010481752, 0.994407281, 1.367241106, 0.867343072, 0.988000792,
        0.987261906, 0.944132683, 0.996392979, 1.006625112, 1.187285002,
        1.03783184, 0.950430078, 0.970830391, 0.973380826, 1.012925441,
        0.995897378, 1.020225975, 1.196504503, 0.924837251, 1.039433298,
        0.995808078, 0.951195217, 1.005729319, 0.9702582, 1.192896058,
        0.959137829, 0.973770124, 1.053378303, 0.998620139, 1.026574177,
        0.984309853, 1.015227379, 0.984506159, 1.045404148, 1.064872883,
        1.036565642, 0.999505576, 0.983948494, 1.01533717, 0.977150412,
        1.014639281, 1.016500602, 0.97884868, 1.146263927, 1.074879689,
        0.902273085, 1.098389025, 0.932719711, 0.992189452, 1.005752832,
        1.048944009, 1.143863991, 0.973981246, 1.005266752, 1.026543026,
        0.962125873, 0.990141531, 0.992603463, 1.022418359, 1.211222394,
        0.808359158, 1.064759768, 0.945341157, 0.97712467, 1.017587072,
        1.005801849, 1.049423653, 1.201754371, 0.909212048, 0.969846151,
        1.026176645, 0.957890728, 0.998214775, 1.003610842, 1.004448436,
        1.181923976, 0.929496329, 0.940545959, 1.100993835, 0.953391397,
        0.978732186, 1.016833928, 1.042647023, 1.060495042, 0.864027107,
        1.049995504, 0.979591684, 0.962257696, 1.032239425, 0.990424956,
        0.986506146, 1.211968223, 0.980592796, 0.951305866, 1.062348173,
        0.965215496, 1.027302063, 0.994135147, 1.01308925, 1.006232235,
        1.005028368, 1.065242209, 1.066627703, 0.95702587, 0.978891106,
        1.056394164, 0.984118239, 0.977835268, 1.03084304, 1.009504022,
        1.01185308, 1.077919298, 0.973305336, 0.972905828, 1.077201136,
        0.983370867, 1.019719191, 1.026331951, 0.964840267, 1.07145965,
        1.030318866, 0.987401782, 1.046857051, 1.010693911, 1.01830473,
        0.994831258, 1.00782991, 1.009950934, 1.001221611, 1.019528393,
        1.034455318, 1.004672645, 1.02377014, 0.997121722, 1.013142663,
        0.993022305, 1.000945345, 0.984793355, 0.992796313, 1.026969544,
        1.166525143, 1.012609738, 1.026420672, 0.965378347, 0.917921771,
        1.006552019, 1.007890136, 1.01507839, 1.197857721, 0.850204321,
        1.07667965, 0.94130134, 0.974743553, 0.987705146, 1.036142944,
        1.139729972, 0.957614954, 0.959939291, 0.999537547, 0.966284892,
        0.996388605, 0.992992262, 1.20998954, 1.0208183, 0.96017501,
        0.986251873, 0.961206399, 0.993541042, 1.013775638, 1.158564892,
        0.947596746
    ]

    // 更新阈值并绘制图表
  var thresholdValues = [];
    for (const dataPoint of filteredData) {
        const threshold = stepDetector.updateThreshold(dataPoint);
        thresholdValues.push(threshold);
    }

    console.log("thresholdValues",thresholdValues)
    //drawThresholdChart(thresholdValues);


const filteredSignal = butterworthLowpassFilter(signal, cutoffFreq, sampleRate, order);
const k=Data.slice(20)// 前一秒的数据不用

const filteredData = k; // 你需要提供滤波后的数据

// 使用滤波后的数据更新阈值和进行步数检测

filteredData.forEach(dataPoint => {
    stepDetector.updateThreshold(dataPoint);
    stepDetector.detectStep(dataPoint);
});

drawThresholdChart(thresholdValues);


// 示例使用
const sampleRate = 20; // 采样率为 1000 Hz
const cutoffFreq = 4; // 截止频率为 50 Hz
const order = 1; // 滤波器阶数为 4

// 生成示例信号，这里简单地假设一个正弦波
const duration = 10; // 信号持续时间为 1 秒// 后8秒再进入butterworth// 8 秒or 10秒
const numSamples = Data.length;
const frequency = 100; // 正弦波频率为 100 Hz
const signal = filteredData;


// 应用低通滤波器


// 输出结果，你可以将 filteredSignal 用于你自己的应用
console.log(filteredSignal);
*/
