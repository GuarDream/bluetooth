    import {getDatabase,ref,push,onValue,remove,set} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js"
    import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
    import { getFirestore, collection, addDoc, getDocs,getDoc,setDoc,doc,query,where,orderBy ,onSnapshot,limit} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"; 
const showBarBtn = document.getElementById("showBarBtn");
const barContainer = document.getElementById("barContainer");
const barTemplate = document.getElementById("barTemplate");


export function barProgress(startTime,endTime,duration,steps,fileName,username,date,time,steps_A,processSnapshots) {
    const database=getDatabase();
    const db_firestore = getFirestore();
    //const stepsInput=ref(database,username+"/" +fileName+'/ResultListInDB'+'/steps');
    //const durationInput=ref(database,username+"/" +fileName+'/ResultListInDB'+'/duration');
    const resultInput=ref(database,username+"/" +fileName+'/ResultListInDB');
    const dateInput=ref(database,username+"/" +date+"/" +'time');
    push(dateInput,time);
    const options = {
        hour: '2-digit',
        minute: '2-digit'
    };
    //push(stepsInput,steps);

     //保存到firebase

    //localStorage.setItem(`${username}_${date}_progress`, JSON.stringify(progressData));
    console.log("成功save");

    const newBar = barTemplate.cloneNode(true);
    newBar.style.display = "block";

    console.log(duration);
    
    // Modify the time information
    const currentTime = new Date().toLocaleTimeString();
    newBar.querySelector(".time").textContent = `${startTime.toLocaleTimeString([],options)}-${endTime.toLocaleTimeString([],options)}`;
  
    const durationMinutes = Math.floor(duration / 60000); // 将持续时间转换为分钟
    const durationSeconds = ((duration % 60000) / 1000).toFixed(0); // 计算持续时间的剩余秒数并四舍五入
    //push(durationInput,`训练时间：${durationMinutes} 分钟 ${durationSeconds} 秒`);
    
    newBar.querySelector(".durationMin").textContent = `${durationMinutes}`;
    newBar.querySelector(".durationSec").textContent = `${durationSeconds}`;

    newBar.querySelector(".steps").textContent = `${steps_A} `;
    newBar.querySelector(".DTW").textContent = "50";
    newBar.querySelector(".strideLen").textContent = `40`;
    // Modify other information as needed



    //save in Realtime Database
    set(resultInput, {
        Time: `${startTime.toLocaleTimeString()}-${endTime.toLocaleTimeString()}`,
        duration:  `训练时间：${durationMinutes} 分钟 ${durationSeconds} 秒`,
        steps: steps,
        steps_A: steps_A
        });

    if (barContainer.firstChild) {
            barContainer.insertBefore(newBar, barContainer.firstChild);
    } else {
         barContainer.appendChild(newBar);
    }


    const userResult=doc(db_firestore,`users`,`${username}`,`${date}`,`${time}`)
    
    const docData={
            cadence:`11`,
            min: `${durationMinutes}`,
            sec:`${durationSeconds}`,
            steps:`${steps}`,
            DTW:`0.22230`,
            time:`${startTime.toLocaleTimeString([],options)}-${endTime.toLocaleTimeString([],options)}`,
            strideLen:`10.2`,
            

        }
        setDoc(userResult,docData,{merge:true}).then(()=>{
            console.log("This value has been written to the database")
        }).catch((error)=>{
            console.log(`I got an error! ${error}`);
    });
    
    
    //最新的进度条将显示在最上端


  }



//刷新后更新的页面
  export function barIntialiaze(time,min,sec,steps,DTW,cadence,strideLen){

        const newBar = barTemplate.cloneNode(true);
        newBar.style.display = "block";
        newBar.querySelector(".time").textContent = `${time}`;
        newBar.querySelector(".durationMin").textContent = `${min}`;
        newBar.querySelector(".durationSec").textContent = `${sec}`;
        newBar.querySelector(".DTW").textContent = `${DTW}`;
        newBar.querySelector(".cadence").textContent = `${cadence}`;
        newBar.querySelector(".steps").textContent = `${steps} `;
        newBar.querySelector(".strideLen").textContent = `${strideLen} `;



        //最新的进度条将显示在最上端
        if (barContainer.firstChild) {
            barContainer.insertBefore(newBar, barContainer.firstChild);
        } else {
             barContainer.appendChild(newBar);
        }

  }


