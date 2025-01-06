let tempoInterval;
let isPlaying = false;

function playSound() {
  const audio = document.getElementById('audio');
  audio.currentTime = 0;
  audio.play();
}

function startTempo() {
  if (!isPlaying) {
    isPlaying = true;
    const tempoSlider = document.getElementById('tempoSlider');
    const tempo = tempoSlider.value;
    const interval = (60 / tempo) * 1000; // Interval in milliseconds
    tempoInterval = setInterval(playSound, interval);
    document.getElementById('buttonTempo').textContent = 'auto';
    //buttonTempo.addEventListener('click', toggleButtonText);
}else{
  isPlaying = false;
  clearInterval(tempoInterval);
  document.getElementById('buttonTempo').textContent = 'manual';

    }
}

function stopTempo() {
  isPlaying = false;
  clearInterval(tempoInterval);
}

document.getElementById('tempoSlider').addEventListener('input', function() {
  const tempoValue = document.getElementById('tempoValue');
  tempoValue.textContent = this.value;
  
  if (isPlaying) {
    stopTempo();
    startTempo();
  }
});

// Optional: Stop the tempo if the user leaves the page
window.addEventListener('beforeunload', function() {
  if (isPlaying) {
    stopTempo();
  }
});

document.getElementById("endButton").addEventListener("click",function(){
  //endTimer();// 显示表的结束
  if(isPlaying){
      isPlaying=false;
      clearInterval(tempoInterval);
      document.getElementById('buttonTempo').textContent = 'manual';
  }
 
});