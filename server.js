
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const e = require('express');
var express = require('express');
var missionCard = require("./missioncard.js");
var itemCard = require("./itemcard.js");
var mission = require("./mission.js");
var item = require("./item.js");





app.get('/', function(req, res){
  res.sendFile(__dirname + '/main.html');
});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});

app.use(express.static('public'));

var missiontype = 5;
var itemNum = 5;
var missionIdToIndex={
  10000:0,
  10001:1,
  10010:2,
  10011:3,
  10012:4,
  10020:5,
  10021:6,
  10030:7,
  10031:8,
  10040:9,
  10041:10,
  10022:11,
  10050:12,
  
}

class player {
	constructor(playerId){
			// 以一個基本初始玩家為預設值
  this.id = playerId;  //區分玩家
  this.hp = 4; //血量 
  this.maxHp = 10; // 最大血量
  this.atk = 1; //攻擊力
  this.def = 1; //防禦力
  this.crit_rate = 0.5 //爆擊率

  this.item = -1;  // 應該會放item卡的id
  this.sprite = -1; //同上 精靈卡的id
  this.mission = -1; //同上
  this.nextMissionAvailable = [0, 0, 0, 0]; //新增
  this.action = {"basic":"none", "item":"none", "card":"none"}; //使用者該回合採取的行動 (可能可以分為 0: 攻擊, 1:防守, 2:祈禱 ....)
  this.prevAction= "none"; //上一回合的行動
  this.damageDef={"normal": 0, "sprite":0 , "item":0 } //會計算對方防禦的傷害
  this.damageNoDef={"spike":0} // 不會計算對方防禦的傷害
  this.takenDamage={"normal": 0 , "spike":0, "sprite":0 , "item":0} // 承受傷害
  this.remaining=0;
  this.isCritical = false; // 是否爆擊
  this.actionReady = {"basic":false, "mission":false}; //是否完成一回合的行動
  this.state ={"stun":false} //玩家狀態
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
    /*
    if(this.action.item=="use"){
      this.damageDef.item = this.item; //待補
    }else{
      this.damageDef.item = 0;
    }
    */
  }

  // 實際總傷害:
  realDamage(enemy){
    var sumDef=0, sumNoDef=0;

    //需考慮對方防禦
    if(enemy.action.basic=="def"){
      for(const k in this.damageDef){
        enemy.takenDamage[k] = Math.ceil(Math.max(this.damageDef[k]-enemy.def*1.5, 0));
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
    if(enemy.action.basic!="atk"){
      sumNoDef -= this.damageNoDef.spike;
    }else{
      enemy.takenDamage.spike = this.damageNoDef.spike;
    }
    //console.log(this.id + " 荊棘:" + this.damageNoDef.spike + " 傷害:" + sumNoDef + " 敵人行動:" + enemy.action.basic);
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
var player1 = new player(1),player2 = new player(2);

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
function getRandomCard(player)
{ 
  var main=0, sub=0, card=0;
  //main = 1;
  main = Math.ceil(Math.random()*2);
  if(main==1){
    sub = Math.floor(Math.random()*missiontype);
    if(player.nextMissionAvailable!=-1){
      card = main*10000 + sub*10 + player.nextMissionAvailable[sub];
    }else{
      getRandomCard(player);
    }
  }else if(main==2){
    sub = Math.floor(Math.random()*itemNum);
    card = main*10000 + sub;
  }
  return card;
};

// 任務處理
function missionAction(action, me, enemy)
{
  var state, cardId;
  if(action=="get" && !me.actionReady.mission){
    cardId =getRandomCard(me);
    console.log("cardid:" + cardId);
    //cardId = 10000; //測試
    if(cardId<20000){
      me.mission = missionIdToIndex[cardId];
      mission[me.mission].mission_start(me, enemy);
      io.emit("mission_state", me, missionCard[me.mission], "start");
      console.log(me.id + " " + cardId);
      me.actionReady.mission = true;
    }else if(cardId>=20000){
      me.item = cardId-20000;
      io.emit("item_state", me, itemCard[me.item], "get");
    }
  }else if(action=="discard"){
    if(me.mission>=0){
      state = mission[me.mission].mission_fail(me, enemy);
      io.emit("mission_state", me, missionCard[me.mission], "discard");
    }
  }else if(action=="check"){
    if(me.mission>=0){
      state = mission[me.mission].mission_check(me, enemy);
      io.emit("mission_state", me, missionCard[me.mission], state);
      console.log("player" + me.id + " mission " + state);
    }else{
      io.emit("mission_state", me, missionCard[me.mission], "noMission");
      console.log("player" + me.id + " has no mission");
    }
  }
}

function itemAction(action, me, enemy)
{
  if(me.item>=0){
    if(action=="use" ){
      item[me.item].use(me, enemy);
    }else if(action=="discard"){
      item[me.item].discard(me, enemy);
    }
    io.emit("item_state", me, item[me.item], action);
  }else{
    io.emit("item_state", me, 0, "no_item");
  }
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
    console.log(id + " " + player1.mission + " " + player2.mission);
  })

  //結算回合
  socket.on("action_done", (playerId, action, iteem, caard)=>{
    if(playerId==1 && !player1.actionReady.basic){
      player1.getAction(action, iteem, caard);
      player1.actionReady.basic = true;
      console.log("player1 done");
    }else if(playerId==2 && !player2.actionReady.basic){
      player2.getAction(action, iteem, caard);
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
      itemAction(player1.action.item, player1, player2);
      itemAction(player2.action.item, player2, player1);
      //血量判定
      io.emit("dmg", p1top2, p2top1, player1.action.basic, player2.action.basic);
      io.emit("next_round", player1, player2);

      if(!isGameOver(player1, player2)){
        missionAction("check", player1, player2);
        missionAction("check", player2, player1);
        console.log("p1 mission remain: " + player1.remaining + " p2 mission remain: " + player2.remaining);
        player1.actionReady.basic = player1.actionReady.mission = false;
        player2.actionReady.basic = player2.actionReady.mission = false;
      }
    }
  })
});



