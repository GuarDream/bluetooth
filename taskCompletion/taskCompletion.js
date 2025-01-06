let number=document.getElementById('number');
let counter=0;



setInterval(()=>{
    if(counter==1){
        clearInterval;
    }else{
    counter+=10;
    number.innerHTML=`${counter}%`;
    }

}, 30);//30ms


function setInterval(){
    
}
let timerId;


//https://www.youtube.com/watch?v=H2HYccAGR00
