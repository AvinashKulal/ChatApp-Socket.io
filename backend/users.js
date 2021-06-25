var users = {}
var rooms = []
var userSocketId = {}
/* User */

function addUser(userId,socketId){
    users[userId] = users[userId] ?users[userId] :[]
    userSocketId[userId] = socketId
    
}
function userExists(userId){
    return userId in users;
}
function getUserData(userId){
    return users[userId]
}
function addRoomToUser(roomId,userId){  
    users[userId].push(roomId)
}

function getSocketId(userId){
    return userSocketId[userId]
}
/* Room */
function roomExists(roomId){
    return rooms.includes(roomId)
}
function addRoom(roomId,userId){
    rooms.push(roomId);
    addRoomToUser(roomId,userId)
}

function getRoomUserList(roomId){
    let roomUserList = [];
    for(let user in users){
        if(users[user].includes(roomId)){
            roomUserList.push(user)
        }
    }
    return roomUserList;
}

function leaveRoom(roomId,userId){
    for(let user in users){
        if(user === userId){
            users[user] = users[user].filter(room=>room!=roomId)
            break;
        }
    }
}
module.exports = {
    getUserData,addUser,roomExists,addRoom,userExists,getSocketId,leaveRoom,getRoomUserList
}