var sprite	=[
{
		id:0,
		sprite_summon:(player,enemy)=>{
				player.hp-=5;
				player.sprite=0;
				player.spriteHp=5;
		},
		sprite_effect:(player,enemy)=>{
				player.hp=Math.min(player.hp+1,player.maxHp);
				player.spriteHp+=Math.min(player.spriteHp+1,5);
		},
		sprite_die:(player,enemy)=>{
				player.sprite=-1;
				player.spriteHp=0;
		}
},
{
		id:1,
		sprite_summon:(player,enemy)=>{
				player.hp-=5;
				player.sprite=1;
				player.spriteHp=8;
				player.state["sprite_sacrifice"]=true;
		},
		sprite_effect:(player,enemy)=>{
		
		},
		sprite_die:(player,enemy)=>{
				player.sprite=-1;
				player.spriteHp=0;
				player.state["sprite_sacrifice"]=false;
		}
},
{
		id:2,
		sprite_summon:(player,enemy)=>{
				player.atk=Math.max(0,player.atk-1);
				player.sprite=2;
				player.spriteHp=5;
				player.damageDef["sprite"]+=2;
		},
		sprite_effect:(player,enemy)=>{
				
		},
		sprite_die:(player,enemy)=>{
				player.sprite=-1;
				player.spriteHp=0;
				player.damageDef["sprite"]=0;
		}
},
{
		id:2,
		sprite_summon:(player,enemy)=>{
				player.atk-=1;
				player.sprite=2;
				player.spriteHp=5;
				player.damageDef["sprite"]+=2;
		},
		sprite_effect:(player,enemy)=>{
				
		},
		sprite_die:(player,enemy)=>{
				player.sprite=-1;
				player.spriteHp=0;
				player.damageDef["sprite"]=0;
		}
},
{
		id:3,
		sprite_summon:(player,enemy)=>{
				player.maxHp=Math.ceil(player.maxHp/2);
				player.Hp=Math.min(player.maxHp,player.hp);
				player.sprite=3;
				player.spriteHp=10;
				player.state["sprite_sacrifice"]=true;
				player.state["sprite_snail"]=true;

		},
		sprite_effect:(player,enemy)=>{
				
		},
		sprite_die:(player,enemy)=>{
				player.sprite=-1;
				player.spriteHp=0;
				player.state["sprite_sacrifice"]=false;
				player.state["sprite_snail"]=false;
		}
},

] 


module.exports = sprite;