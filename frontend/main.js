const socket = io();


const forms = document.querySelectorAll("form");
const userName = document.querySelector("#user-name");
const allUserInfo = document.querySelector("#all-user-info");
const welcomePage = document.querySelector("#welcome-container");
const messageContainer = document.querySelector("#message-container");
const messagePanel = messageContainer.querySelector("#message-panel");
const leaveRoom = document.querySelector("#leave-room");
const roomUsersList = document.querySelector("#room-users");
var userId;
var roomId;
var app = "Chat-App"
var root = "http://localhost:3000/joinRoom"
/* Initial Setup*/


if(window.localStorage.getItem("user")==undefined){
    socket.emit("generate userid");  
}else{
    userId = window.localStorage.getItem("user")
    
}

socket.on("generate userid",function(data){
    window.localStorage.setItem("user",data.id)
    userId = window.localStorage.getItem("user")
    
})

socket.emit("initial setup",{userId:userId})

socket.on("user setup",function(data){
   
    userName.innerHTML = userId
    allUserInfo.innerHTML = ''
    welcomePage.style.display = 'block'
    messageContainer.style.display = "none"
    for(var i = 0;i<data.userData.length;i++){
        let item = data.userData[i]
        let p = document.createElement("p");
        p.innerHTML = splitUser(item);
        p.className = item;
        p.id = "back";
        allUserInfo.appendChild(p)
    }
    if(data.roomId != undefined)
    setUpRoomMessagePanel(data.roomId)
})

function splitUser(room){
    
    if(room.indexOf('&')>-1){
        let twoUsers  = room.split('&',2)
        if(twoUsers[0] == userId)
                    twoUsers[0] = twoUsers[1]
    return  twoUsers[0];
    }
    return room
}

function setUpRoomMessagePanel(room){
    
    welcomePage.style.display="none"
    messageContainer.style.display = "block"
    
    messageContainer.querySelector("#user-name").innerHTML = splitUser(room);
    messageContainer.querySelector("#join-link").innerHTML = root+"?room="+room
    messagePanel.innerHTML = "";
    roomId = room;
    socket.emit("open messagePanel",{userId:userId,roomId:room})
}

allUserInfo.addEventListener("click",e=>{
    if(e.target && e.target.className && e.target.className != roomId){
        setUpRoomMessagePanel(e.target.className)
        
    }
})
forms[0].addEventListener("submit",e=>{
    e.preventDefault()
    let input = forms[0].querySelector("input");
    if(input.value){
        socket.emit("send request",{userId:userId,anotherUser:input.value})
        input.value=""
    }
})


forms[1].addEventListener("submit",e=>{
    e.preventDefault();
    let input = forms[1].querySelector("input");
    if(input.value){
     socket.emit("new room",{roomId:input.value,userId:userId})
        input.value=""
   }
})
forms[2].addEventListener("submit",e=>{
    e.preventDefault()
    let input = forms[2].querySelector("input");
    if(input.value){
        let date = new Date;
        let time  = date.getHours()+":"+date.getMinutes();
        let p = document.createElement("p")
        p.style.textAlign = "right"
        p.innerHTML = "<small style='color:blue'>You :: "+time+"</small><br/>&nbsp;&nbsp;"+input.value;
        messagePanel.appendChild(p)
        socket.emit("chat message",{userId:userId,roomId:roomId,message:input.value})
        input.value=""
    }
})
messageContainer.querySelector("#user-name").addEventListener("mouseover",e=>{
    socket.emit("show roomusers",{roomId:roomId})
    
})
messageContainer.querySelector("#user-name").addEventListener("mouseout",e=>{
    roomUsersList.style.display = "none";
})
forms[2].querySelector("input").addEventListener("keydown",e=>{
    socket.emit("user typing",{userId:userId,roomId:roomId,message:userId+" typing..."})
})

forms[2].querySelector("input").addEventListener("keyup",e=>{
    socket.emit("user typing",{userId:userId,roomId:roomId,message:""})
 })

 leaveRoom.addEventListener("click",e=>{
     socket.emit('leave room',{roomId:roomId,userId:userId})
 })
/* Room */

socket.on("join info",function(data){
    if(data.roomId == roomId || data.userId === 'You'){
        let date = new Date;
        let time  = date.getHours()+":"+date.getMinutes();
        let p = document.createElement("p")
        p.innerHTML = "<small style='color:blue'>"+ app+" :: <small style='color:red'>"+time+"</small></small><br/>&nbsp;&nbsp;"+data.userId+" Joined the conversation";
        messagePanel.appendChild(p)
    }
    
})

socket.on("chat message",function(data){
    if(data.roomId == roomId){
        let date = new Date;
        let time  = date.getHours()+"-"+date.getMinutes();
        let p = document.createElement("p")
        p.innerHTML = "<small style='color:blue'>"+ data.sender+" : "+time+"</small><br/>&nbsp;&nbsp;"+data.message;
        messagePanel.appendChild(p)
    }
    
})

socket.on("user typing",function(data){
    forms[2].querySelector("#user-typing").innerHTML = data.roomId == roomId ? data.message:""
})

socket.on("show roomusers",function(data){
    roomUsersList.style.display = "flex";
    roomUsersList.innerHTML = ''
    data.roomUsersList.forEach(user => {
        let p = document.createElement("p");
        
        p.innerHTML = user === userId ?user+"(You)" :user;
        p.id ="list"
        roomUsersList.appendChild(p)
    });
})
/* Alert */

socket.on("alert user",function(data){
    alert(data.message)
})