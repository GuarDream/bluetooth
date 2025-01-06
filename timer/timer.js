let timerTimeout;
let seconds1 = 0;
let minutes1 = 0;
let count=0;


const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const endButton = document.getElementById('endButton');
const tryButton = document.getElementById('tryButton');


var circle = document.getElementById('circle');
circle.style.setProperty('--number',450);


//const progressBar=document.getElementById('progress');

function startTimer() {
  console.log("click");
  timerTimeout = setTimeout(function() {
    updateTimer();
  }, 1000);
  //startButton.disabled = true;
}

function pauseTimer() {
  clearTimeout(timerTimeout);
  //startButton.disabled = false;
}

function endTimer() {
  clearTimeout(timerTimeout);
  startButton.disabled = false;
  //把显示置于0
  seconds1=0;
  minutes1=0;
  updateTimerDisplay(); // 更新显示
  const boxes = document.querySelectorAll('.box');
  boxes.forEach(box => {
    box.classList.remove('completed');
  });

}


function updateTimer() {
  seconds1++;
  count++;
  const number=document.getElementById('number');
 
  //console.log(seconds1);
  const boxes = document.querySelectorAll('.box');
  if (seconds1 === 60) {
    seconds1 = 0;
    minutes1++;
  }
  updateTimerDisplay(); // 更新显示
  timerTimeout = setTimeout(updateTimer, 1000);
  if (seconds1 === 10) {
    boxes[0].classList.add('completed');
  }
  if (minutes1 === 10) {
    boxes[1].classList.add('completed');
  }
  if (minutes1 === 15) {
    boxes[2].classList.add('completed');
  }
  if (minutes1 === 20) {
    boxes[3].classList.add('completed');
  }

  if(count===(600)){
    percentage=0;
    newOffset=450;
    graph(newOffset);
    count=0;
    number.textContent=percentage+"%";
  }else{
  var percentage = count/(5*60); 
  var newOffset=450-(450*percentage);
  graph(newOffset);
  if(percentage>0.2){
  number.textContent=Math.round(percentage*10)/10+"%";}
}

}

export function graph(newOffset){
circle = document.getElementById('circle');
circle.style.setProperty('--number',newOffset);
}

function updateTimerDisplay() {
  const formattedSeconds = seconds1 < 10 ? `0${seconds1}` : seconds1;
  const formattedMinutes = minutes1 < 10 ? `0${minutes1}` : minutes1;

  document.getElementById('seconds').textContent = formattedSeconds;
  document.getElementById('minutes').textContent = formattedMinutes;
}



export function getCurrentTimeString() {
  // 获取当前时间
  const currentTime = new Date();

  // 获取月份、日期、小时和分钟
  const month = currentTime.getMonth() + 1; // 注意：getMonth() 返回的是 0 到 11，所以需要加 1
  const day = currentTime.getDate();
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();

  // 格式化月份和日期，确保为两位数
  const formattedMonth = month < 10 ? "0" + month : month;
  const formattedDay = day < 10 ? "0" + day : day;

  // 格式化小时和分钟，确保为两位数
  const formattedHours = hours < 10 ? "0" + hours : hours;
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

  // 构建最终的时间字符串
  const currentTimeString = formattedMonth + formattedDay + "/" + formattedHours + formattedMinutes;
  const currentDate=formattedMonth + formattedDay;
  const currentTTime=`${formattedHours}${formattedMinutes}`;
  return {currentTimeString,currentDate,currentTTime};
    
}
export function sendParameter() {
  const parameter = "Hello from JavaScript";
  // Call the Python function defined in PyScript
  pyscript.interpreter.globals.get('process_parameter')(parameter);
}

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
endButton.addEventListener('click', endTimer);


/*
document.getElementById("tryButton").addEventListener("click",function(){
    
  startTimer();
  console.log("click");
})
*/

document.getElementById('moreImg').addEventListener('click', function() {
  var sidebar = document.getElementById('sidebar');
  sidebar.style.display = 'block';
  sidebar.style.width = '120px';
  //sidebar.style.height = '150px';
});

document.getElementById('closeBtn').addEventListener('click', function() {
  var sidebar = document.getElementById('sidebar');
    sidebar.style.width = '0';
    setTimeout(function() {
        sidebar.style.display = 'none';
    }, 500); // Match the transition duration
});
