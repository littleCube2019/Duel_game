var item = [
{
	id:0,
	
	use:(player,enemy)=>{
		player.hp = Math.min(player.hp+5,player.maxHp);
		item[0].discard(player,enemy)
	},

	discard:(player,enemy)=>{
		player.item = -1;
	},
},
{
	id:1,
	
	use:(player,enemy)=>{
		enemy.hp-=3;
		item[1].discard(player,enemy)
	},

	discard:(player,enemy)=>{
		player.item =-1;
	},

},
{
	id:2,
	
	use:(player,enemy)=>{
		if(player.equip== false){
			player.def+=2;
			player.equip = true;
		}
		
	},
	
	discard:(player,enemy)=>{
		player.def=Math.max(player.def-2,0);
		player.equip = false;
		player.item = -1;
	},

},
{
	id:3,
	
	use:(player,enemy)=>{
		player.def+=2;
		

		for(var k in player.takenDamage){
			if (Math.random() >= 0.5){
				player.takenDamage[k]=0;
			}
		}

		item[3].discard(player,enemy);
	},

	discard:(player,enemy)=>{
		player.item = -1;
	},

},
{
	id:4,
	
	use:(player,enemy)=>{
		enemy.hp-=5;
		item[4].discard(player,enemy)
	},

	discard:(player,enemy)=>{
		player.item = -1;
	},

},
{
	id:5,

	use:(player,enemy)=>{
	},


	turn_end:(player,enemy)=>{
		enemy.state["stun"] = false;
		if (Math.random() >= 0.9){
		   enemy.state["stun"] = true;
		}
	},

	discard:(player,enemy)=>{
		player.item = -1;
		enemy.state["stun"] = false;
	},

}

]

module.exports = item;