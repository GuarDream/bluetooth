import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"

import { getFirestore, collection, addDoc, getDocs,getDoc,setDoc,doc,query,where,orderBy ,onSnapshot,limit,updateDoc} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"; 

var username=localStorage.getItem('username');
var resultProfile
var profile_age
var profile_username
var profile_gender
var profile_disease
var profile_password
const age_input=document.getElementById('age_input')
const username_input=document.getElementById('username_input')
const gender_input=document.getElementById('gender_input')
const password_input=document.getElementById('password_input')
const disease_input=document.getElementById('disease_input')

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

const app=initializeApp(firebaseConfig);
const db_firestore = getFirestore();

async function reloadProfile(){
    const resultQuery=query(
        collection(db_firestore,`users`,`${username}`,`profile`)
    )
    onSnapshot(resultQuery,(querySnapshot)=>{
    querySnapshot.forEach((snap)=>{
        resultProfile=snap.data();
        profile_age=resultProfile.age;
        profile_username=resultProfile.name;
        profile_gender=resultProfile.gender;
        profile_disease=resultProfile.disease;
        profile_password=resultProfile.password;
        age_input.value = profile_age;
        username_input.value = profile_username;
        gender_input.value = profile_gender;
        password_input.value = profile_password;
        disease_input.value = profile_disease;
        console.log(profile_age,profile_username,profile_disease);
    })

})
}
reloadProfile();

document.getElementById('confirm-proBTN').addEventListener('click', async function() {
    const profileRef=doc(db_firestore,"users",`${username}`,"profile","details")
    if(age_input.value!=profile_age){
        await updateDoc(profileRef,{
            age:age_input.value
        })
        console.log("age保存更改")
    }

    if(disease_input.value!=profile_disease){
        await updateDoc(profileRef,{
            disease:disease_input.value
        })
        console.log("disease保存更改")
    }
        
    if(gender_input.value!=profile_gender){
        await updateDoc(profileRef,{
            gender:gender_input.value
        })
        console.log("gender保存更改")
    }
/* 名字不可以随意更改
    if(username_input.value!=profile_username){
        await updateDoc(profileRef,{
            name:username_input.value
        })
        console.log("username保存更改")
    }
    */

    if(password_input.value!=profile_password){
        await updateDoc(profileRef,{
            password:password_input.value
        })
        console.log("password保存更改")
    }
    window.location.href = "../test1.html"
})

