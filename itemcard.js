/*
format 
{
	id (int): 1001~1999 mission , 2001~2999 item , 3001~3999 sprite
	type (string) : card type ,
	name (string) : card name ,
	description(string): card description , 

}



*/
var itemcard = [
{
	id:20000,
	type:"道具卡",
	name:"草藥",
	description:"使用後可以回復HP 5點,使用後消失" 
},
{
	id:20001,
	type:"道具卡",
	name:"土製炸彈",
	description:"使用後造成 敵方群體傷害3點，使用後消失"
},
{
	id:20002,
	type:"道具卡",
	name:"鎖子甲",
	description:"當此道具存在，防禦力+2"
},
{
	id:20003,
	type:"道具卡",
	name:"煙幕彈",
	description:"使用後該回合對方任意攻擊有50%機率無法造成傷害，使用後消失"
},
{
	id:20004,
	type:"道具卡",
	name:"飛刀",
	description:"效果: 使用後造成單體5點傷害，使用後消失"
},
]
module.exports = itemcard;