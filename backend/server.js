const express = require("express")
const socket = require("socket.io")
const path = require("path")
const crypto  = require("crypto")
const PORT = 3000;
const app = express();
app.use(express.static(path.join(__dirname,'../frontend')))
let user ;
const {
    getUserData,addUser,roomExists,addRoom,userExists,getSocketId,leaveRoom,getRoomUserList
} = require("./users.js")

const server = app.listen(PORT,function(req,res){
    console.log(`Server Listening to ${PORT}`)
})

const md5Encrypt = (encryptString) => {
    return crypto.createHash('md5').update(encryptString).digest('hex');
}

app.get('/joinRoom',function(req,res){
    if(roomExists(req.query.room)){

        addRoom(req.query.room,user)
    }
    res.redirect('/')
})
const io = socket(server);

io.on("connection",function(socket){
    console.log('user connected')

    /* Initial setup*/
    socket.on("generate userid",function(data){
        let userId = md5Encrypt(Date.now().toString() + Math.random().toString(36).substring(7)).substring(0,15);
        user = userId;
        socket.emit("generate userid",{id: userId})
        addUser(userId,socket.id)
    })

    socket.on("initial setup",function(data){
        user = data.userId;
        addUser(data.userId,socket.id)
        let userData = getUserData(data.userId)
        socket.emit("user setup",{userData:userData})
    })

    socket.on("send request",function(data){
        if(userExists(data.anotherUser)){
            let room = data.userId+"&"+data.anotherUser
            addRoom(room,data.userId)
            addRoom(room,data.anotherUser)
            let userData = getUserData(data.userId);
            let anotherUserData = getUserData(data.anotherUser);
            let anotherUserSocketId = getSocketId(data.anotherUser);
            socket.emit("user setup",{userData:userData,roomId:room})
            io.sockets.to(anotherUserSocketId).emit("user setup",{userData:anotherUserData})
        }else{
            socket.emit("alert user",{message:"User Not Exists"})
        }
    })
    /* Room*/

    socket.on("new room",function(data){
        
       if(!roomExists(data.roomId)){
            addRoom(data.roomId,data.userId)
            let userData = getUserData(data.userId);
            socket.emit("user setup",{userData:userData,roomId:data.roomId})
          
       }
        else
            socket.emit("alert user",{message:"Room Exists"})
        
    })
    socket.on("open messagePanel",function(data){
        socket.join(data.roomId)
        socket.emit("join info",{userId:"You"})
        socket.broadcast.to(data.roomId).emit("join info",{userId:data.userId,roomId:data.roomId})
    })

    socket.on("chat message",function(data){
        socket.broadcast.to(data.roomId).emit("chat message",{sender:data.userId,message:data.message,roomId:data.roomId})
    })

    socket.on("user typing",function(data){
        socket.broadcast.to(data.roomId).emit("user typing",{message:data.message,roomId:data.roomId})
    })

    socket.on("leave room",function(data){
        leaveRoom(data.roomId,data.userId)
        let userData = getUserData(data.userId);
        socket.emit("user setup",{userData:userData})
        socket.broadcast.to(data.roomId).emit("chat message",{sender:"Chat-App",message:data.userId+" Left the room",roomId:data.roomId})

    })

    socket.on("show roomusers",function(data){
        let roomUserList = getRoomUserList(data.roomId)
        socket.emit("show roomusers",{roomUsersList:roomUserList})
    })

    socket.on("disconnect",function(){
      console.log('user disconnected')
    })
})

