/* mission foretermine player can accept this mission
let checker = (arr, target) => target.every(v => arr.includes(v));
// check all target ele in arr ? 
return checker(player.doneMission,preneed_id);

}




var mission = [
{
	id:0,
	preneed_id:[],
	mission_start:(player,enemy)=>{
		player.remaining = 3;
	},
	mission_check:(player,enemy)=>{
		if(player.remaining==0){
			mission_success(player,enemy);
		}
		else{
			if(player.action==1){ //action == defend
				player.remaining-=1;
			}
		}
		
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
	},
	mission_success:(player,enemy)=>{
		player.spike+=1;
		player.mission=-1; //mission remove 
	},
},
{
	id:1,
	preneed_id:[0],
	mission_start:(player,enemy)=>{
		player.remaining = 3;
	},
	mission_check:(player,enemy)=>{
		if(player.remaining==0){
			mission_success(player,enemy);
		}
		else{
			if(player.action==1){ //action == defend
				player.remaining-=1;
			}
		}
		
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
	},
	mission_success:(player,enemy)=>{
		player.spike+=1;
		player.mission=-1; //mission remove 
	},
},

]