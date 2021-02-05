<<<<<<< HEAD
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/main.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

app.use(express.static('public'));

var player1 = {"hp":10, "atk":1, "def":1, "crit_rate":0.5, "action":"none", 
                "item":{"type":"none", "value":0},
                "mission":{"type":"none", "value":"none", "reward_type":"none", "reward_value":"none", "discription":"none"}};
var player2 = {"hp":10, "atk":1, "def":1, "crit_rate":0.5, "action":"none", 
                "item":{"type":"none", "value":0},
                "mission":{"type":"none", "value":"none", "reward_type":"none", "reward_value":"none", "discription":"none"}};
var ready1 = false, ready2 = false;
var act_ready1=false, act_ready2=false;
var item_ready1 = false, item_ready2 = false;
=======
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
>>>>>>> 8926358bb1aace458357db70fb3b7bf67feca250

io.on('connection', (socket) => {
  socket.emit("welcome");
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
<<<<<<< HEAD

  //choose player
  socket.on("choose_character", (pl)=>{
=======
  socket.on("update", ()=>{
    console.log("update" + player.atk);
    socket.emit("update", player.hp, player.atk, player.def, player.crit_rate);
  })
  socket.on("choose", (pl)=>{
>>>>>>> 8926358bb1aace458357db70fb3b7bf67feca250
    if(pl==1){
      console.log("pl1 has been choosed");
      ready1 = true;
      socket.emit("id_pl1");
      io.emit("pl1_choosed");
<<<<<<< HEAD
=======
      if(ready2){
        io.emit("start_game");
      }
>>>>>>> 8926358bb1aace458357db70fb3b7bf67feca250
    }else if(pl==2){
      console.log("pl2 has been choosed");
      ready2 = true;
      socket.emit("id_pl2");
      io.emit("pl2_choosed");
<<<<<<< HEAD
    }
    if(ready1 && ready2){
      io.emit("start_game", 10, 1, 1, 0.5);
      ready1 = ready2 = false;
      console.log("start game");
    }
  });

  //選擇行動 & 計算傷害 
  socket.on("choose_action", (type, id)=>{
    if(id==1 && !act_ready1){
      socket.emit("act_ready", type);
      player1.action = type;
      act_ready1 = true;
      console.log("player1 ready");
    }else if(id==2 && !act_ready2){
      socket.emit("act_ready", type);
      player2.action = type;
      act_ready2 = true;
      console.log("player2 ready");
    }
    if(act_ready1 && act_ready2){
      var p1_atk, p1_def, p2_atk, p2_def;
      var crit;
      var msg1, msg2;
      if(player1.action=="atk"){
        crit = Math.round(Math.random()*100);
        if(crit<player1.crit_rate*100){
          console.log("p1 爆擊");
          p1_atk = Math.round(player1.atk * 2);
        }else{
          p1_atk = Math.round(player1.atk);
        }
        p1_def = player1.def;
      }else if(player1.action=="def"){
        p1_atk = 0;
        p1_def = Math.round(player1.def * 1.5);
      }
      if(player2.action=="atk"){
        crit = Math.round(Math.random()*100);
        if(crit<player2.crit_rate*100){
          console.log("p2 爆擊");
          p2_atk = Math.round(player2.atk * 2);
        }else{
          p2_atk = Math.round(player2.atk);
        }
        p2_def = player2.def;
      }else if(player2.action=="def"){
        p2_atk = 0;
        p2_def = Math.round(player2.def * 1.5);
      }
      if(p2_atk - p1_def > 0){
        player1.hp -= p2_atk - p1_def;
        msg1 = "造成了" + (p2_atk - p1_def) +"點傷害";
      }else{
        msg1 = "造成了" + 0 +"點傷害";
      }
      if(p1_atk - p2_def > 0){
        player2.hp -= p1_atk - p2_def;
        msg2 = "造成了" + (p1_atk - p2_def) +"點傷害";
      }else{
        msg2 = "造成了" + 0 +"點傷害";
      }
      act_ready1 = act_ready2 = false;
      console.log("one round finished");
      io.emit("update", player1.hp, player2.hp, msg1, msg2);
    }
  })

  //使用道具
  socket.on("choose_item", (type, id)=>{
    if(id==1 && !item_ready1){
      item_ready1 = true;
      if(type=="use"){
        if(player1.item.type=="atk"){

        }
      }else if(type=="delete"){
        player1.item.type = "none";
        player2.item.value = 0;
        socket.emit("delete_item");
      }
    }else if(id==2 && !item_ready2){
      item_ready2 = true;
      if(type=="use"){
        if(player2.item.type=="atk"){

        }
      }else if(type=="delete"){
        player2.item.type = "none";
        player2.item.value = 0;
        socket.emit("delete_item");
      }
=======
      if(ready1){
        io.emit("start_game");
      }
    }
    if(ready1 && ready2){
      console.log("start_game");
>>>>>>> 8926358bb1aace458357db70fb3b7bf67feca250
    }
  })
});



