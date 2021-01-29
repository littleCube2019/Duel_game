'use strict';

const express = require('express');
const socketIO = require('socket.io');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

var player = {"hp":10, "atk":1, "def":1, "crit_rate":0.5};
var ready1 = false, ready2 = false;

io.on('connection', (socket) => {
  socket.emit("welcome");
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
  socket.on("update", ()=>{
    console.log("update" + player.atk);
    socket.emit("update", player.hp, player.atk, player.def, player.crit_rate);
  })
  socket.on("choose", (pl)=>{
    if(pl==1){
      console.log("pl1 has been choosed");
      ready1 = true;
      socket.emit("id_pl1");
      io.emit("pl1_choosed");
      if(ready2){
        io.emit("start_game");
      }
    }else if(pl==2){
      console.log("pl2 has been choosed");
      ready2 = true;
      socket.emit("id_pl2");
      io.emit("pl2_choosed");
      if(ready1){
        io.emit("start_game");
      }
    }
    if(ready1 && ready2){
      console.log("start_game");
    }
  })
});



