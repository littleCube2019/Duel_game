/*
format 
{
	id (int): 1001~1999 mission , 2001~2999 item , 3001~3999 sprite
	type (string) : card type ,
	name (string) : card name ,
	description(string): card description , 

}



*/
var card = [
{
	id:1000,
	type:"任務卡",
	name:"荊棘試煉I",
	description:"任務內容:採取 防禦 三次，\
	不須連續\
	回報:獲得一層荊棘(可疊加)荊棘: \
	當採取防禦姿態，被敵人攻擊可以對敵人造成與荊棘\
	層數相等的傷害" 
},
{
	id:1001,
	type:"任務卡",
	name:"荊棘試煉II",
	description:"任務內容:(需完成荊棘試煉I)\
	以荊棘造成共計3點傷害，不須連續\
	回報:\
	獲得一層荊棘" 
},
{
	id:1002,
	type:"任務卡",
	name:"銅牆鐵壁",
	description:"任務內容:\
	採取 防禦 三次，不須連續\
	回報:\
	防禦力+1" 
},
{
	id:1003,
	type:"任務卡",
	name:"壁壘",
	description:"任務內容:\
	(需完成 銅牆鐵壁)\
	連續採取 防禦 三次，否則此任務失效\
	回報:\
	防禦力+2" 
},
{
	id:1004,
	type:"任務卡",
	name:"不動如山",
	description:"任務內容:\
	(需完成 壁壘)\
	三回合內不受到傷害，否則此任務失效\
	回報:\
	防禦力+3" 
},
{
	id:1005,
	type:"任務卡",
	name:"戰士試煉I",
	description:"任務內容:\
	採取 攻擊 三次，不須連續\
	回報:\
	攻擊力+1" 
},
{
	id:1006,
	type:"任務卡",
	name:"戰士試煉II",
	description:"任務內容:\
	(需完成戰士試煉I)\
	連續採取 攻擊 三次，否則此任務失效\
	回報:\
	攻擊力+2" 
},
{
	id:1007,
	type:"任務卡",
	name:"血之試煉I",
	description:"任務內容:\
	受到三點(含以上)傷害，不須連續\
	回報:\
	最大生命值+5" 
},
{
	id:1008,
	type:"任務卡",
	name:"血之試煉II",
	description:"任務內容:\
	(需完成血之試煉I)\
	受到五點(含以上)傷害，不需連續\
	回報:\
	最大生命值+10" 
},
{	id:1009,
	type:"任務卡",
	name:"幸運試煉I",
	description:"任務內容:\
	爆擊成功兩次，不須連續\
	回報:\
	爆擊率提升10%" 
},
{	id:1010,
	type:"任務卡",
	name:"幸運試煉II",
	description:"任務內容:\
	爆擊成功四次，不須連續\
	回報:\
	爆擊率提升20%"
},
{	id:1011,
	type:"任務卡",
	name:"合格戰士",
	description:"任務內容:\
	(需完成戰士試煉II)\
	連續採取攻擊行動四次，否則此任務失效\
	回報:\
	攻擊力+3"
},

{
	id:2000,
	type:"道具卡",
	name:"草藥",
	description:"使用後可以回復HP 5點,使用後消失" 
},
{
	id:2001,
	type:"道具卡",
	name:"土製炸彈",
	description:"使用後造成 敵方群體傷害 5點，使用後消失"
},
{
	id:2002,
	type:"道具卡",
	name:"鎖子甲",
	description:"當此道具存在，防禦力+2"
},
{
	id:2003,
	type:"道具卡",
	name:"煙幕彈",
	description:"使用後該回合對方任意攻擊有50%機率無法造成傷害，使用後消失"
},
{
	id:2004,
	type:"道具卡",
	name:"飛刀",
	description:"效果: 使用後造成3點傷害，使用後消失"
},
{
	id:2005,
	type:"道具卡",
	name:"大槌",
	description:"效果: 當此道具存在，採取攻擊有10%機率造成對方下回合暈眩\
	暈眩: 無法行動"
},
]