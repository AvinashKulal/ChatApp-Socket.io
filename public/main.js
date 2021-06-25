const socket = io();
const userName = document.querySelector("#user-name");
const forms = document.querySelectorAll("form");
const chatPanel = document.querySelector("#chat-panel");
const roomChatPanel = document.querySelector("#room-chat-panel");
var roomMessagePanel = document.querySelector("#display-room-message")
const roomChatOpenBtn = document.querySelector("#open-room-chat-btn")
var roomPanelTitle = document.querySelector("#room-message-title")
var toggle = false;
roomMessagePanel.innerHTML = ""
forms[0].addEventListener("submit",e=>{
    e.preventDefault();
    const input = forms[0].querySelector(".user-id")//requesting userId
    if(input.value){
        chatPanel.style.display = "none";
        chatPanel.querySelector("#display-message").innerHTML = "";
        socket.emit("request user",{anotheUser:input.value})
        input.value = "";
    }
})

socket.on("new user",function(data){
    userName.innerHTML = data.userName+" | Room"+data.roomNumber
})

socket.on("connnect request",function(data){
   forms[1].style.display = "block";
   forms[1].querySelector("#message").innerHTML = data.requestor+" Want to connect with you !"
   forms[1].querySelector("#connect").addEventListener("click",e=>{
       e.preventDefault();
       forms[1].style.display = "none";
       socket.emit("request accepted",{anotheUser:data.anotheUser,requestor:data.requestor})
   })
   forms[1].querySelector("#disconnect").addEventListener("click",e=>{
    e.preventDefault();
    forms[1].style.display = "none";
    socket.emit("reqeust canceled",{requestor:data.requestor,message:"Request Not Accepted"})
    
    })

    
})

forms[2].addEventListener("submit",e=>{
    e.preventDefault();
   
    const input = forms[2].querySelector("#message")
    if(input.value){
        socket.emit("chat message",{message:input.value})
        input.value  = "";
    }
})

socket.on("start receiver",function(data){
    chatPanel.style.display = "inline-block";
})


socket.on("start chat",function(data){
    chatPanel.style.display = "inline-block";
    socket.emit("start receiver");
})
socket.on("show message",function(data){

chatPanel.querySelector("#display-message").innerHTML +=data.message+"<br/>"
})
socket.on("already connected",function(data){
    socket.emit("request accepted",data);
})

roomChatOpenBtn.addEventListener("click",e=>{
    toggle = !toggle;
    e.preventDefault();
    if(toggle){
        roomChatOpenBtn.innerHTML = "Close Room Chat"
        roomChatPanel.style.display = "inline-block";
       
    }else{
        roomChatOpenBtn.innerHTML = "Open Room Chat"
        roomChatPanel.style.display = "none";
        
    }
})

forms[3].addEventListener("submit",e=>{
    e.preventDefault();
  
    const input = forms[3].querySelector("#message")
    if(input.value){
        roomMessagePanel.innerHTML += "<b>You</b> :<span style='color:red'> "+input.value+"</span><br/>";

        socket.emit("room message",{message:input.value})
        input.value  = "";
    }
})
socket.on("room message",function(data){
    roomMessagePanel.innerHTML += "<b style='color:red'>"+data.sender+"</b> : <span style='color:black'>"+data.message+"</span><br/>";
})

socket.on("room count",function(data){
    roomPanelTitle.innerHTML = "Room Message | "+data.clientsCount;
})

socket.on("invalid",function(data){
    alert(data);
})

