const express = require('express');
const path = require('path');
const http=require('http'); 
const socketio=require('socket.io');
const app = express();
const formatMessage=require('./utils/messages');
const  {userJoin,getCurrentUser, getRoomUsers, userLeave}=require('./utils/users');
const server=http.createServer(app);
const io=socketio(server);

app.use(express.static(path.join(__dirname,'public')));

const admin = 'Fast Chat Bot';

io.on('connection', (socket)=>{

    socket.on('joinRoom',({username,room})=>{
        const user=userJoin(socket.id,username,room);
        socket.join(user.room);

        socket.emit('message', formatMessage(admin,'welcome to the chat'));

        socket.broadcast.to(user.room).emit('message', formatMessage(admin,`${user.username} has joined the chat!`));
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    });

    socket.on('chatMessage', (msg)=>{
        const user=getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });


    socket.on('disconnect',()=>{

        const user=userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(admin,`${user.username} has left the chat`));

            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users:getRoomUsers(user.room)
            });
        }

        
    });


});


server.listen(process.env.PORT || 8000,()=>{
    console.log('app listening on ...')
});