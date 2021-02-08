
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const e = require('express');
var express = require('express');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/main.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

app.use(express.static('public'));

class player {
	constructor(id){
			// 以一個基本初始玩家為預設值
  this.id = id;  //區分玩家
  this.hp = 10; //血量 
  this.atk = 1; //攻擊力
  this.def = 1; //防禦力
  this.crit_rate = 0.5 //爆擊率

  this.item = 0 ;  // 應該會放item卡的id
  this.sprite =  0; //同上 精靈卡的id
  this.mission = 0 ; //同上
  this.action = {"basic":"none", "item":"none"}; //使用者該回合採取的行動 (可能可以分為 0: 攻擊, 1:防守, 2:祈禱 ....)
  this.prevAction= "none"; //上一回合的行動
  this.DamageDef={"normal": 0, "sprite":0 , "item":0 } //會計算對方防禦的傷害
  this.DamageNoDef={"spike":0} // 不會計算對方防禦的傷害
  this.takenDamage={"normal": 0 , "spike":0, "sprite":0 , "item":0} // 承受傷害
  this.remaining=1
  this.isCritical = false // 是否爆擊
  this.actionReady = false; //是否完成一回合的行動
  }
  getAction(action, item){
    this.prevAction = this.action.basic;
    this.action.basic = action;
    this.action.item = item;
  }
  // 造成傷害(未計算防禦)
  totalDamage(){
    if(this.action.basic=="atk"){
      this.critical();
      if(this.isCritical){
        this.DamageDef.normal = this.atk * 2;
      }else{
        this.DamageDef.normal = this.atk;
      }
    }else{
      this.DamageDef.normal = 0;
    }
    if(this.action.item=="use"){
      this.DamageDef.item = this.item; //待補
    }else{
      this.DamageDef.item = 0;
    }
  }

  // 實際總傷害:
  realDamage(enemy){
    var sumDef=0, sumNoDef=0;

    //需考慮對方防禦
    if(enemy.action=="def"){
      for(const k in this.DamageDef){
        sumDef += (this.DamageDef[k]-enemy.def*1.5);
      }
    }else{
      for(const k in this.DamageDef){
        sumDef += (this.DamageDef[k]-enemy.def);
      }
    }

    //不需考慮對方防禦
    for(const k in this.DamageNoDef){
      sumNoDef += this.DamageNoDef[k];
    }
    if(enemy.action!="atk"){
      sumNoDef -= this.DamageNoDef.spike;
    }
    return sumDef + sumNoDef;
  }

  //造成傷害
  takeDamage(realDamage){
    this.hp = this.hp - realDamage;
  }

  //判斷爆擊成功
  critical(){
    var crit = Math.round(Math.random()*100);
    if(crit<this.def*100){
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
    if(player1.actionReady && player2.actionReady){
      io.emit("start_game", 10, 1, 1, 0.5);
      player1.actionReady = player2.actionReady = false;
      console.log("start game");
    }
  });


  socket.on("action_done", (id, action, item)=>{
    if(id==1 && !player1.actionReady){
      player1.getAction(action, item);
      player1.actionReady = true;
      console.log("player1 done");
    }else if(id==2 && !player2.actionReady){
      player2.getAction(action, item);
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
      io.emit("msg", p1top2, p2top1);
      if(player1.hp<=0 || player2.hp<=0){
        if(player1.hp<player2.hp){
          io.on("game_done", 1); //player1 lose
        }else if(player1.hp>player2.hp){
          io.on("game_done", 2); // player2 lose
        }else{
          io.emit("game_done", 0); // tieed
        }
      }else{
        io.emit("next_round", player1.hp, player2.hp);
        player1.actionReady = player2.actionReady = false;
      }
    }
  })

  /*
  //選擇行動 & 計算傷害 (舊版)
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
    }
  })
  */
});



