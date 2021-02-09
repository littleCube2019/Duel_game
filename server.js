
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const e = require('express');
var express = require('express');
var card = require("./card.js");
var mission = require("./mission.js");

app.get('/', function(req, res){
  res.sendFile(__dirname + '/main.html');
});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});

app.use(express.static('public'));


class player {
	constructor(playerId){
			// 以一個基本初始玩家為預設值
  this.id = playerId;  //區分玩家
  this.hp = 10; //血量 
  this.atk = 1; //攻擊力
  this.def = 1; //防禦力
  this.crit_rate = 0.5 //爆擊率

  this.item = 0 ;  // 應該會放item卡的id
  this.sprite =  0; //同上 精靈卡的id
  this.mission = 0 ; //同上
  this.action = {"basic":"none", "item":"none", "card":"none"}; //使用者該回合採取的行動 (可能可以分為 0: 攻擊, 1:防守, 2:祈禱 ....)
  this.prevAction= "none"; //上一回合的行動
  this.damageDef={"normal": 0, "sprite":0 , "item":0 } //會計算對方防禦的傷害
  this.damageNoDef={"spike":0} // 不會計算對方防禦的傷害
  this.takenDamage={"normal": 0 , "spike":0, "sprite":0 , "item":0} // 承受傷害
  this.remaining=1
  this.isCritical = false // 是否爆擊
  this.actionReady = false; //是否完成一回合的行動
  }
  getAction(action, item, card){
    this.prevAction = this.action.basic;
    this.action.basic = action;
    this.action.item = item;
    this.action.card = card;
  }
  // 造成傷害(未計算防禦)
  totalDamage(){
    if(this.action.basic=="atk"){
      this.critical();
      if(this.isCritical){
        this.damageDef.normal = this.atk * 2;
      }else{
        this.damageDef.normal = this.atk;
      }
    }else{
      this.damageDef.normal = 0;
    }
    if(this.action.item=="use"){
      this.damageDef.item = this.item; //待補
    }else{
      this.damageDef.item = 0;
    }
  }

  // 實際總傷害:
  realDamage(enemy){
    var sumDef=0, sumNoDef=0;

    //需考慮對方防禦
    if(enemy.action=="def"){
      for(const k in this.damageDef){
        enemy.takenDamage[k] = Math.max(this.damageDef[k]-enemy.def*1.5, 0);
        sumDef += enemy.takenDamage[k];
      }
    }else{
      for(const k in this.damageDef){
        enemy.takenDamage[k] = Math.max(this.damageDef[k]-enemy.def, 0);
        sumDef += enemy.takenDamage[k];
      }
    }

    //不需考慮對方防禦
    for(const k in this.damageNoDef){
      sumNoDef += this.damageNoDef[k];
    }
    if(enemy.action!="atk"){
      sumNoDef -= this.damageNoDef.spike;
    }else{
      enemy.takenDamage.spike = this.damageNoDef.spike;
    }
    return sumDef + sumNoDef;
  }

  //造成傷害
  takeDamage(realDamage){
    this.hp = this.hp - realDamage;
  }

  //判斷爆擊成功
  critical(){
    var crit = Math.floor(Math.random()*100);
    if(crit<this.crit_rate*100){
      this.isCritical = true;
    }else{
      this.isCritical = false;
    }
  }
};
var player1 = new player(1);
var player2 = new player(2);
/*
var player1 = {"hp":10, "atk":1, "def":1, "crit_rate":0.5, "action":"none", 
                "item":{"type":"none", "value":0},
                "mission":{"type":"none", "value":"none", "reward_type":"none", "reward_value":"none", "discription":"none"}};
var player2 = {"hp":10, "atk":1, "def":1, "crit_rate":0.5, "action":"none", 
                "item":{"type":"none", "value":0},
                "mission":{"type":"none", "value":"none", "reward_type":"none", "reward_value":"none", "discription":"none"}};
                var ready1 = false, ready2 = false;
*/

function pickCard(){ //testing
  return Math.floor(Math.random()*5);
};

function getmission( missionId, player, enemy){
  mission[missionId].mission_start(player, enemy);
};

io.on('connection', (socket) => {
  socket.emit("welcome");
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));

  //choose player
  socket.on("choose_character", (pl)=>{
    if(pl==1){
      console.log("pl1 has been choosed");
      player1.actionReady = true;
      socket.emit("id_pl1");
      io.emit("pl1_choosed");
    }else if(pl==2){
      console.log("pl2 has been choosed");
      player2.actionReady = true;
      socket.emit("id_pl2");
      io.emit("pl2_choosed");
    }
    var caard = card[pickCard()];
    socket.emit("det_card", caard);
    if(player1.actionReady && player2.actionReady){
      io.emit("start_game", 10, 1, 1, 0.5);
      player1.actionReady = player2.actionReady = false;
      console.log("start game");
    }
  });


  socket.on("action_done", (playerId, action, item, caard)=>{
    if(playerId==1 && !player1.actionReady){
      player1.getAction(action, item, caard);
      if(player1.action.card=="pick"){
        player1.mission = 2; //測試
        getmission(player1.mission, player1, player2);
        console.log("player1 pick card" + player1.mission);
        socket.emit("get_card", card[player1.mission]);
      }
      player1.actionReady = true;
      console.log("player1 done");
    }else if(playerId==2 && !player2.actionReady){
      player2.getAction(action, item, caard);
      if(player2.action.card=="pick"){
        player2.mission = 3; // 測試
        getmission(player2.mission, player2, player1);
        console.log("player2 pick card" + player2.mission);
        socket.emit("get_card", card[player2.mission]);
      }
      player2.actionReady = true;
      console.log("player2 done");
    }
    if(player1.actionReady && player2.actionReady){
      var p1top2, p2top1;
      player1.totalDamage();
      p1top2 = player1.realDamage(player2);
      player2.totalDamage();
      p2top1 = player2.realDamage(player1);
      player1.takeDamage(p2top1);
      player2.takeDamage(p1top2);
      //血量判定
      io.emit("dmg", p1top2, p2top1, player1.action.basic, player2.action.basic);
      if(player1.hp<=0 || player2.hp<=0){
        if(player1.hp<player2.hp){
          io.emit("game_over", 1); //player1 lose
        }else if(player1.hp>player2.hp){
          io.emit("game_over", 2); // player2 lose
        }else{
          io.emit("game_over", 0); // tieed
        }
      }
      if(player1.mission>=0){
      mission[player1.mission].mission_check(player1, player2);
      }
      if(player2.mission>=0){
      mission[player2.mission].mission_check(player2, player1);
      }
      console.log("p1: " + player1.remaining + " p2: " + player2.remaining);
      io.emit("mission_check", player1.remaining, player2.remaining);

      io.emit("next_round", 1, player1.hp, player1.atk, player1.def, player1.crit_rate);
      io.emit("next_round", 2, player2.hp, player2.atk, player2.def, player2.crit_rate);
      player1.actionReady = player2.actionReady = false;
    }
  })
});



