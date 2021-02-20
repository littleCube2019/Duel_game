
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const e = require('express');
var express = require('express');
var missionCard = require("./missioncard.js");
var itemCard = require("./itemcard.js");
var mission = require("./mission.js");
var item = require("./item.js");
const itemcard = require('./itemcard.js');





app.get('/', function(req, res){
  res.sendFile(__dirname + '/main.html');
});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});

app.use(express.static('public'));

var missionIdToIndex={ //共23張 (0~22)
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
  10060:13,
  10070:14,
  10080:15,
  10090:16,
  10100:17,
  10110:18,
  10120:19,
  10130:20,
  10140:21,
  10150:22,
}
const numOfSerialMission =  16;  //看上面object最大值的 千百十 +1
const numOfItem =  6;  //道具總數
var initailNotAvaiableMission =[11,12,13]; 
//用在如  神與天罰系列在一開始不應被選到，解完基礎任務後會依次打開，但又不是系列關係
//的任務奇怪關係上

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
  this.item2 = -1;  //第二個道具欄
  this.itemRecord=[]; //紀錄道具使用次數
  for(var temp=0; temp<numOfItem; temp++){
      this.itemRecord.push(0); //所有道具一開始使用次數皆為0
  }  



  this.sprite = -1;   //精靈id
  this.spriteHp=0;

  this.mission = -1; //同上
  

  this.prayHealth=0; //祈禱回血量
  this.prayRemaining=0; //祈禱效果影響時長

  this.nextMissionAvailable =  [];  //系列任務
  for(var temp=0; temp<numOfSerialMission; temp++){
    if(initailNotAvaiableMission.includes(temp)){
        this.nextMissionAvailable.push(-1); //如果在不應一開始被抽到的任務，設為-1
    }
    else{
      this.nextMissionAvailable.push(0);  //其他就設為0，可以被選到起始任務
    }
  }  


  this.action = {"basic":"none", "item":"none", "card":"none"}; //使用者該回合採取的行動 (可能可以分為 0: 攻擊, 1:防守, 2:祈禱 ....)
  this.prevAction= "none"; //上一回合的行動
  this.damageDef={"normal": 0, "sprite":0 , "item":0 } //會計算對方防禦的傷害
  this.damageNoDef={"spike":0} // 不會計算對方防禦的傷害
  this.takenDamage={"normal": 0 , "spike":0, "sprite":0 , "item":0} // 承受傷害
  
  this.remaining=0; //任務用暫存計數變數
  this.tempObj={}; //任務用暫存物件

  
  this.isCritical = false; // 是否爆擊
  this.actionReady = {"basic":false, "mission":false}; //是否完成一回合的行動
  this.state ={
                "stun":false,
                "rage":false,
                "undeath":false,
                "suckBlood":false,
                "sprite_sacrifice":false,
                "sprite_snail":false, 
                "canPray":false ,
                "canRedBless":false,
                "canBlueBless":false,
                "secondItem":false,
                "thief":false, }; //玩家狀態
  this.equip = false; //道具的裝備卡使用
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
      //=========================================狀態:rage==============================================
      if(this.state.rage){
        console.log("玩家" + this.id + "觸發rage");
        this.critical();
        if(this.isCritical){
          this.damageDef.normal += this.atk * 2;
        }else{
          this.damageDef.normal += this.atk;
        }
      }
      //=================================================================================================
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
    //==============================================狀態:suckblood===================================
    if(this.state.suckBlood){
      console.log("玩家" + this.id + "觸發suckblood");
      this.hp = Math.max(this.maxHp, this.hp + enemy.takenDamage.normal);
    }
    //=================================================================================================

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
    //=================================狀態:sprite_sacrifice========================================
    if(this.state.sprite_sacrifice){
      console.log("玩家" + this.id + "觸發sprite_sacrifice");
      this.hp -= Math.max(0, realDamage - this.spriteHp);
      this.spriteHp = Math.max(0, this.spriteHp - realDamage);
      //=========================================================================================
    }else{
      this.hp = this.hp - realDamage;
    }
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
function getRandomCard(player, type)
{ 
  var main=0, sub=0, card=0;
  //main = 1;
  if(type=="mission"){
    main = 1;
  }else if(type=="item"){
    main = 2;
  }
  if(main==1){
    sub = Math.floor(Math.random()*numOfSerialMission);
    if(player.nextMissionAvailable[sub]!=-1){
      card = main*10000 + sub*10 + player.nextMissionAvailable[sub];
    }else{
      getRandomCard(player, "mission");
    }
  }else if(main==2){
    sub = Math.floor(Math.random()*numOfItem);
    card = main*10000 + sub;
  }
  return card;
};

// 任務處理
function missionAction(action, me, enemy)
{
  var state, card1Id, card2Id;
  if(action=="get" && !me.actionReady.mission){
    card1Id = getRandomCard(me, "mission");
    card2Id = getRandomCard(me, "item");
    io.emit("choose_card", me.id,  missionCard[missionIdToIndex[card1Id]], itemCard[card2Id-20000]);
    //cardId = 10000; //測試
    /*
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
    me.actionReady.mission = true;
    */
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
    if(action=="use"){
      item[me.item].use(me, enemy);
    }else if(action=="discard"){
      item[me.item].discard(me, enemy);
    }else if(action=="use_2"){
      item[me.item2].use(me, enemy);
    }else if(action=="discard_2"){
      item[me.item2].discard(me, enemy);
    }
    io.emit("item_state", me, item[me.item], action);
  }else{
    io.emit("item_state", me, 0, "no_item");
  }
}


//========================================狀態:stun========================================
function playerStun(me, enemy){
  if(me.item>=0){
    if(typeof item[me.item].turn_end != "undefined"){
      item[me.item].turn_end(me, enemy);
      if(enemy.state.stun){
        console.log("玩家" + enemy.id + "被擊暈");
      }
    }
  }
}
//=================================================================================================


//=====================================狀態:undeath===============================================
function isUndeath(pl)
{
  if(pl.hp<=0){
    if(pl.state.undeath){
      if(pl.maxHp>1){
        pl.hp = Math.ceil(pl.maxHp/2);
        pl.atk = Math.max(1, pl.atk-1);
        console.log("玩家" + pl.id + "觸發了不死");
      }
    }
  }
}
//=================================================================================================


//=====================================狀態:bless==================================================
function bless(me, type)
{
  if(type=="start"){
    if(me.state.canRedBless){
      me.atk += 2;
      me.prayRemaining = 4;
      console.log("玩家" + me.id + "觸發了赤色祝福");
      io.emit("other_msg", me.id, "你觸發了赤色祝福，接下來3回合攻擊+2");
    }else if(me.state.canBlueBless){
      me.def += 2;
      me.prayRemaining = 4;
      console.log("玩家" + me.id + "觸發了靛色祝福，接下來3回合攻擊+2");
      io.emit("other_msg", me.id, "你觸發了靛色祝福，接下來3回合防禦+2");
    }
  }else if(type=="check"){
    if(me.state.prayRemaining>0){
      me.state.prayRemaining -= 1;
      io.emit("pray_state", 1, me.state.prayRemaining);
      console.log("玩家" + me.id + "的祈禱效果剩餘" + me.state.prayRemaining + "回合");
      if(me.state.prayRemaining==0){
        if(me.state.canRedBless){
          me.atk -= 2;
        }else{
          me.def -= 2;
        }
      }
    }
  }
}
//================================================================================================

//=================================狀態:小偷=======================================================
function isThief(me, enemy)
{
  var stole = false;
  var itemId = 0, place = 0;
  if(me.state.thief && me.action.basic){
    stole = Math.floor(Math.random()*4);
    if(stole==1){
      if(enemy.item==-1 && enemy.item2==-1){
        place = "noCard";
      }else if(enemy.item!=-1 && enemy.item2!=-1){
        if(Math.ceil(Math.random()*2)==1){
          itemId = enemy.item;
        }else{
          itemId = enemy.item2;
        }
      }else if(enemy.item!=-1 && enemy.item==1){
        itemId = enemy.item;
      }
      if(me.item==-1){
        place = 1;
        me.item = itemcard[itemId];
      }else if((me.item!=-1 && !me.state.secondItem) || (me.item!=-1 && me.item2!=-1)){
        place = 0;
      }else if(me.item!=-1 && me.state.secondItem && me.item2==-1){
        place = 2;
        me.item2 = itemcard[itemId];
      }
    }else{
      place = "fail";
    }
    io.emit("stolen_card", me.id, itemcard[itemId], place);
    console.log("玩家" + me.id + "數據: " + place + " " + itemId);
  }
}
//===============================================================================================================================

//==================================================遊戲結束======================================================================
function isGameOver(player1, player2){
  isUndeath(player1);
  isUndeath(player2);
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
//==================================================================================================================================

io.on('connection', (socket) => {
  newGame();
  io.emit("welcome");
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));

  //============================================================選角==================================================================
  socket.on("choose_character", (id)=>{
    chooseCharacter(id);
    if(player1.actionReady.basic && player2.actionReady.basic){
      io.emit("start_game");
      player1.actionReady.basic = player2.actionReady.basic = false;
      console.log("start game");
    }
  });
  //==================================================================================================================================

  //============================================================任務控制==============================================================
  socket.on("mission_control", (id, type)=>{ 
    if(id==1){
      missionAction(type, player1, player2);
    }else if(id==2){
      missionAction(type, player2, player1);
    }
    console.log(id + " " + player1.mission + " " + player2.mission);
  })
  //==================================================================================================================================

  //============================================================完成行動==============================================================
  socket.on("action_done", (playerId, basic_act, item_act, card_act)=>{
    if(playerId==1 && !player1.actionReady.basic){
      player1.getAction(basic_act, item_act, card_act);
      player1.actionReady.basic = true;
      console.log("player1 done");
    }else if(playerId==2 && !player2.actionReady.basic){
      player2.getAction(basic_act, item_act, card_act);
      player2.actionReady.basic = true;
      console.log("player2 done");
    }
    //================================================================================================================================

    //==================================================回合結算======================================================================
    if((player1.actionReady.basic || player1.state.stun) && (player2.actionReady.basic || player2.state.stun)){
      var p1top2, p2top1;

    //===================================================狀態:小偷===================================================================
    isThief(player1, player2);
    isThief(player2, player1);

    //======================================================道具結算=================================================================
      itemAction(player1.action.item, player1, player2);
      itemAction(player2.action.item, player2, player1);
    //================================================================================================================================

    //=======================================================行動結算 && 精靈結算====================================================
      if(!player1.state.stun){
        player1.totalDamage();
        p1top2 = player1.realDamage(player2);
      }
      if(!player2.sprite.stun){
        player2.totalDamage();
        p2top1 = player2.realDamage(player1);
      }
      //========================================================傷害結算===============================================================
      player1.takeDamage(p2top1);
      player2.takeDamage(p1top2);
      //血量判定
      io.emit("dmg", p1top2, p2top1, player1.action.basic, player2.action.basic);
      io.emit("next_round", player1, player2);

      //=======================================================判斷輸贏================================================================
      if(!isGameOver(player1, player2)){
        //=====================================================任務檢查====================================================================
        missionAction("check", player1, player2);
        missionAction("check", player2, player1);
        console.log("p1 mission remain: " + player1.remaining + " p2 mission remain: " + player2.remaining);

        //=====================================================狀態還原====================================================
        player1.actionReady.basic = player1.actionReady.mission = player1.state.stun = false;
        player2.actionReady.basic = player2.actionReady.mission = player2.state.stun = false;

        //====================================================狀態:stun, snail, canpray======================================================================
        playerStun(player1, player2);
        playerStun(player2, player1);  
        io.emit("player_state", player1.id, player1.state.stun, player1.state.sprite_snail, player1.state.canPray);
        io.emit("player_state", player2.id, player2.state.stun, player2.state.sprite_snail, player2.state.canPray);
        //==================================================================================================================================

        //====================================================狀態:bless====================================================================
        if(player1.action.basic=="pray"){
          bless(player1, "start");
        }
        if(player2.action.basic=="pray"){
          bless(player2, "start");
        }
        
        bless(player1, "check");
        bless(player2, "check");
        //==================================================================================================================

        //====================================================狀態:seconditem===============================================
        if(player1.state.secondItem){
          io.emit("second_item_show", player1.id);
        }
        if(player2.state.secondItem){
          io.emit("second_item_show", player2.id);
        }
        //==================================================================================================================

        //=====================================================狀態總結======================================================
        console.log("玩家1狀態 暈眩:"+player1.state.rage+"不死:"+player1.state.undeath+"吸血:"+player1.state.suckBlood+"盾精靈:"+player1.state.sprite_sacrifice
                    +"蝸精靈:"+player1.state.sprite_snail+"祈禱:"+player1.state.canPray+"赤紅:"+player1.state.canRedBless+"靛藍:"+player1.state.canBlueBless
                    +"2道具:"+player1.state.secondItem+"小偷:"+player1.state.thief);
        console.log("玩家2狀態 暈眩:"+player2.state.rage+"不死:"+player2.state.undeath+"吸血:"+player2.state.suckBlood+"盾精靈:"+player2.state.sprite_sacrifice
                    +"蝸精靈:"+player2.state.sprite_snail+"祈禱:"+player2.state.canPray+"赤紅:"+player2.state.canRedBless+"靛藍:"+player2.state.canBlueBless
                    +"2道具:"+player2.state.secondItem+"小偷:"+player2.state.thief);
        console.log("test");
      }

    }
  })
})