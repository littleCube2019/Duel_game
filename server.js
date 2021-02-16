
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
  this.hp = 4; //血量 
  this.maxHp = 10; // 最大血量
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
  this.actionReady = {"basic":false, "mission":false}; //是否完成一回合的行動
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
var player1,player2;

function newGame()
{
  player1 = new player(1);
  player2 = new player(2);
}

function chooseCharacter(id)
{
  if(id==1){
    console.log("player1 has been choosed");
    player1.actionReady.basic = true;
  }else if(id==2){
    console.log("player2 has been choosed");
    player2.actionReady.basic = true;
  }
  io.emit("player_choosed", id);
}

// 隨機(暫定)
function getRandomCard()
{ 
  return Math.floor(Math.random()*5);
};

// 任務處理
function missionAction(action, me, enemy)
{
  var state;
  if(action=="get" && !me.actionReady.mission){
    me.mission = getRandomCard();
    mission[me.mission].mission_start(me, enemy);
    io.emit("mission_state", me, card[me.mission], "start");
    me.actionReady.mission = true;
  }else if(action=="discard"){
    if(me.mission>=0){
      state = mission[me.mission].mission_fail(me, enemy);
      io.emit("mission_state", me, card[me.mission], "discard");
    }
  }else if(action=="check"){
    if(me.mission>=0){
      state = mission[me.mission].mission_check(me, enemy);
      io.emit("mission_state", me, card[me.mission], state);
      console.log("player" + me.id + " mission " + state);
    }else{
      io.emit("mission_state", me, card[me.mission], "noMission");
      console.log("player" + me.id + " has no mission");
    }
  }
}

function itemAction(action, me, enemy)
{
  if(action=="use"){
    item[me.item].use(me, enemy);
  }else if(action=="discard"){
    item[me.item].discard(me, enemy);
  }
  io.emit("item_state", me, item[me.item], action);
}

function isGameOver(player1, player2){
  if(player1.hp<=0 || player2.hp<=0){
    if(player1.hp<player2.hp){
      io.emit("game_over", player1.id); //player1 lose
    }else if(player1.hp>player2.hp){
      io.emit("game_over", player2.id); // player2 lose
    }else{
      io.emit("game_over", 0); // tieed
    }
    return true;
  }else{
    return false;
  }
}

io.on('connection', (socket) => {
  newGame();
  io.emit("welcome");
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));

  //選角
  socket.on("choose_character", (id)=>{
    chooseCharacter(id);
    if(player1.actionReady.basic && player2.actionReady.basic){
      io.emit("start_game");
      player1.actionReady.basic = player2.actionReady.basic = false;
      console.log("start game");
    }
  });

  //任務
  socket.on("mission_control", (id, type)=>{ 
    if(id==1){
      missionAction(type, player1, player2);
    }else if(id==2){
      missionAction(type, player2, player1);
    }
  })

  //結算回合
  socket.on("action_done", (playerId, action, item, caard)=>{
    if(playerId==1 && !player1.actionReady.basic){
      player1.getAction(action, item, caard);
      player1.actionReady.basic = true;
      console.log("player1 done");
    }else if(playerId==2 && !player2.actionReady.basic){
      player2.getAction(action, item, caard);
      player2.actionReady.basic = true;
      console.log("player2 done");
    }
    if(player1.actionReady.basic && player2.actionReady.basic){
      var p1top2, p2top1;
      player1.totalDamage();
      p1top2 = player1.realDamage(player2);
      player2.totalDamage();
      p2top1 = player2.realDamage(player1);
      player1.takeDamage(p2top1);
      player2.takeDamage(p1top2);
      //血量判定
      io.emit("dmg", p1top2, p2top1, player1.action.basic, player2.action.basic);
      io.emit("next_round", player1, player2);
      console.log(player1.damageNoDef.spike + " " + player2.damageNoDef.spike);

      if(!isGameOver(player1, player2)){
        missionAction("check", player1, player2);
        missionAction("check", player2, player1);
        console.log("p1: " + player1.remaining + " p2: " + player2.remaining);
        player1.actionReady.basic = player2.actionReady.basic = false;
        player1.actionReady.mission = player2.actionReady.mission = false;
      }
    }
  })
});



