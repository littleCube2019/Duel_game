
function canAcceptMission(player,mission){
// input :player object , mission object
// output: boolean , determine player can accept this mission or not
	let checker = (arr, target) => target.every(v => arr.includes(v));
// check all target ele in arr ? 
	return checker(player.doneMission,mission.preneed_id);

}


function sumOfObj(obj) {
  return Object.keys(obj).reduce((sum,key)=>sum+parseFloat(obj[key]||0),0);
} //sum of object



var mission = [
{
	id:0,
	preneed_id:[],
	mission_start:(player,enemy)=>{
		player.remaining = 3;
	},
	mission_check:(player,enemy)=>{

		console.log(player.action.basic);
		if(player.action.basic=="def"){ //action == defend
			player.remaining-=1;
			if(player.remaining==0){
				mission[0].mission_success(player,enemy);
			}
		}
				
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mssion remove
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
		
		
		player.remaining-=player.damageNoDef["spike"] ;
		if(player.remaining<0){
			mission[1].mission_success(player,enemy);
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
	id:2,
	preneed_id:[],
	mission_start:(player,enemy)=>{
		player.remaining = 3;
	},
	mission_check:(player,enemy)=>{
		
		
		if(player.action.basic=="def"){ //action == defend
			player.remaining-=1;
			if(player.remaining==0){
				mission[2].mission_success(player,enemy);
			}
		}
			
		
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
	},
	mission_success:(player,enemy)=>{
		player.def+=1;
		player.mission=-1; //mission remove 
	},
},
{
	id:3,
	preneed_id:[2],
	mission_start:(player,enemy)=>{
		player.remaining = 3;
	},
	mission_check:(player,enemy)=>{
	
			if(player.remaining==3){
				if(player.action.basic=="def" ){ //action == defend
					player.remaining-=1;
				}
				else{
					mission[3].mission_fail(player,enemy);
				}
			}
			else{
				if(player.action.basic=="def" && player.prevAction =="def"){ //action == defend
					player.remaining-=1;
					if(player.remaining==0){
						mission[3].mission_success(player,enemy);
					}
				}
				else{
					mission[3].mission_fail(player,enemy);
				}
			}
		
		
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
	},
	mission_success:(player,enemy)=>{
		player.def+=2;
		player.mission=-1; //mission remove 
	},
},
{
	id:4,
	preneed_id:[3],
	mission_start:(player,enemy)=>{
		player.remaining = 3;
	},
	mission_check:(player,enemy)=>{
		  if (sumOfObj(player.takenDamage)>0){
			mission[4].mission_fail(player,enemy);
			}

			else{
				player.remaining-=1;
				if(player.remaining ==0){
					mission[4].mission_success(player,enemy);
				}
			}
		
		
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
	},
	mission_success:(player,enemy)=>{
		player.def+=3;
		player.mission=-1; //mission remove 
	},
},
]
module.exports = mission;