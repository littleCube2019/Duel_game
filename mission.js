
function sumOfObj(obj) {
  				return Object.keys(obj).reduce((sum,key)=>sum+parseFloat(obj[key]||0),0);
			} //sum of object




// outter only use mission_start and mission check

var mission = [
{
	id:10000,
	mission_start:(player,enemy)=>{
		player.remaining = 3;
	},
	mission_check:(player,enemy)=>{

		
		if(player.action.basic == "def"){ //action == defend

			player.remaining-=1;
			if(player.remaining==0){
					return mission[0].mission_success(player,enemy);

			}
		}

		return "ongoing";
				
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mssion remove
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.damageNoDef.spike+=1;
		player.remining=0;
		player.mission=-1; //mission remove 
		player.nextMissionAvailable[0] = 1;
		return "success";
	},
},
{
	id:10001,

	mission_start:(player,enemy)=>{
		player.remaining = 3;
	},
	mission_check:(player,enemy)=>{
		
		
		player.remaining-=player.damageNoDef["spike"] ;
		if(player.remaining<= 0){
			return mission[1].mission_success(player,enemy);
		}


		return "ongoing";
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.damageNoDef.spike+=1;
		player.mission=-1; //mission remove
		player.remining=0; 
		player.nextMissionAvailable[0] = -1;
		return "success";
	},
},
{
	id:10010,

	mission_start:(player,enemy)=>{
		player.remaining = 3;
	},
	mission_check:(player,enemy)=>{
		
		
		if(player.action.basic=="def"){ //action == defend
			player.remaining-=1;
			if(player.remaining==0){
				return mission[2].mission_success(player,enemy);
			}
		}
			
		return "ongoing";
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
		return "fail";
	},
	mission_success:(player,enemy)=>{
		console.log(player.id+"完成銅牆鐵壁");
		player.def+=1;
		player.mission=-1; //mission remove 
		player.remining=0;
		player.nextMissionAvailable[1] = 1;
		return "success";
	},
},
{
	id:10011,

	mission_start:(player,enemy)=>{
		player.remaining = 3;
	},
	mission_check:(player,enemy)=>{
	
			if(player.remaining==3){
				if(player.action.basic=="def" ){ //action == defend
					player.remaining-=1;
				}
				else{
					return mission[3].mission_fail(player,enemy);
				}
			}
			else{
				if(player.action.basic=="def" && player.prevAction == "def"){ //action == defend
					player.remaining-=1;
					if(player.remaining==0){
						return mission[3].mission_success(player,enemy);
					}
				}
				else{
					return mission[3].mission_fail(player,enemy);
				}
			}
		
			return "ongoing";
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.def+=2;
		player.mission=-1; //mission remove 
		player.remining=0;
		player.nextMissionAvailable[1] = 2;
		return "success";
	},
},
{
	id:10012,

	mission_start:(player,enemy)=>{
		player.remaining = 3;
	},
	mission_check:(player,enemy)=>{
			
			if (sumOfObj(player.takenDamage)>0){
				return mission[4].mission_fail(player,enemy);
			}

			else{
				player.remaining-=1;
				if(player.remaining ==0){
					return mission[4].mission_success(player,enemy);
				}
			}
		
			return "ongoing";
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.def+=3;
		player.mission=-1; //mission remove 
		player.remining=0;
		player.nextMissionAvailable[1] = -1;
		return "success";
	},
},
{
	id:10020,

	mission_start:(player,enemy)=>{
		player.remaining = 3;
	},
	mission_check:(player,enemy)=>{
		
		if(player.action.basic=="atk"){ //action == attack
			player.remaining-=1;
			if(player.remaining==0){
				return mission[5].mission_success(player,enemy);
			}
		}
			
		return "ongoing";
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.atk+=1;
		player.mission=-1; //mission remove 
		player.remaining=0;
		player.nextMissionAvailable[2] = 1;
		return "success";
	},
},
{
	id:10021,

	mission_start:(player,enemy)=>{
		player.remaining = 3;
	},
	mission_check:(player,enemy)=>{
	
			if(player.remaining==3){
				if(player.action.basic=="atk" ){ //action == defend
					player.remaining-=1;
				}
				else{
					return mission[6].mission_fail(player,enemy);
				}
			}
			else{
				if(player.action.basic=="atk" && player.prevAction =="atk"){ //action == defend
					player.remaining-=1;
					if(player.remaining==0){
						return mission[6].mission_success(player,enemy);
					}
				}
				else{
					return mission[6].mission_fail(player,enemy);
				}
			}
		
			return "ongoing";
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.atk+=2;
		player.mission=-1; //mission remove 
		player.remaining=0;
		player.nextMissionAvailable[2] = 2;
		return "success";
	},
},
{
	id:10030,

	mission_start:(player,enemy)=>{
		player.remaining = 3;
	},
	mission_check:(player,enemy)=>{
		dmg=sumOfObj(player.takenDamage);
		
		player.remaining-=dmg;
		

		if(player.remaining <= 0){
			return mission[7].mission_success(player,enemy);
		}
	
			
		return "ongoing";
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.maxHp+=5;
		player.mission=-1; //mission remove 
		player.remaining=0;
		player.nextMissionAvailable[3] = 1;
		return "success";
	},
},
{
	id:10031,

	mission_start:(player,enemy)=>{
		player.remaining = 5;
	},
	mission_check:(player,enemy)=>{
		dmg=sumOfObj(player.takenDamage);
		
		player.remaining-=dmg;
		

		if(player.remaining <= 0){
			return mission[8].mission_success(player,enemy);
		}
	
			
		return "ongoing";
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.maxHp+=10;
		player.mission=-1; //mission remove 
		player.remaining=0;
		player.nextMissionAvailable[3] = -1;
		return "success";
	},
},
{
	id:10040,

	mission_start:(player,enemy)=>{
		player.remaining = 2;
	},
	mission_check:(player,enemy)=>{
	    if (player.isCritical == true){
	    	player.remaining-=1;
	    	if(player.remaining==0){
	    		return mission[9].mission_success(player,enemy);
	    	}
	    }
			
		return "ongoing";
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.crit_rate+=0.1;
		player.mission=-1; //mission remove 
		player.remaining=0;
		player.nextMissionAvailable[4] = 1;
		return "success";
	},
},
{
	id:10041,

	mission_start:(player,enemy)=>{
		player.remaining = 4;
	},
	mission_check:(player,enemy)=>{
	    if (player.isCritical == true ){
	    	player.remaining-=1;
	    	if(player.remaining==0){
	    		return mission[10].mission_success(player,enemy);
	    	}
	    }
			
		return "ongoing";
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.crit_rate+=0.2;
		player.mission=-1; //mission remove 
		player.remaining=0;
		player.nextMissionAvailable[4] = -1;
		return "success";
	},
},
{
	id:10022,

	mission_start:(player,enemy)=>{
		player.remaining = 4;
	},
	mission_check:(player,enemy)=>{
	
			if(player.remaining==4){
				if(player.action.basic=="atk" ){ //action == defend
					player.remaining-=1;
				}
				else{
					return mission[11].mission_fail(player,enemy);
				}
			}
			else{
				if(player.action.basic=="atk" && player.prevAction =="atk"){ //action == defend
					player.remaining-=1;
					if(player.remaining==0){
						return mission[11].mission_success(player,enemy);
					}
				}
				else{
					return mission[11].mission_fail(player,enemy);
				}
			}
		
			return "ongoing";
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remaining=0; 
		player.mission=-1; //mission remove
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.atk+=3;
		player.mission=-1; //mission remove 
		player.remining=0;
		player.nextMissionAvailable[2] = -1;
		return "success";
	},
},
{
	id:10050,

	originMaxHp:0,
	mission_start:(player,enemy)=>{
		player.remaining = 3;
		mission[12].originMaxHp=player.maxHp;
		player.maxHp = 5;
		player.hp=5;

	},
	mission_check:(player,enemy)=>{
		player.remaining-=1;
		if(player.remaining==0){
			return mission[12].mission_success(player,enemy);
		}
		return "ongoing";
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.maxHp=mission[12].originMaxHp; 
		player.mission=-1;
		player.remining=0;
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.maxHp=mission[12].originMaxHp+5; 
		player.hp+=5;
		player.mission=-1; //mission remove 
		player.remining=0;
		player.nextMissionAvailable[5]= -1;
		return "success";
	},
},
{
	id:10060,

	mission_start:(player,enemy)=>{
		player.remaining = 4;
	},
	mission_check:(player,enemy)=>{
		
		if(player.action.basic=="atk"){
			player.hp-=1;
			if(player.realDamage(enemy)>0){
				player.remaining-=1;
			}
			if(player.remaining==0){
				return mission[13].mission_success(player,enemy);
			}			
		}
		return "ongoing";
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.mission=-1;
		player.remining=0;
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.state["rage"]=true; 
		player.mission=-1; //mission remove 
		player.remining=0;
		player.nextMissionAvailable[6]=-1;
		return "success";
	},
},
{
	id:10070,

	mission_start:(player,enemy)=>{
		
	},
	mission_check:(player,enemy)=>{
		mission[14].mission_success(player,enemy);
	
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.mission=-1; //mission remove 
		player.remining=0;
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.state["undeath"]=true;
		player.hp-=10; 
		player.mission=-1; //mission remove 
		player.remining=0;
		
		player.nextMissionAvailable[7]=-1;
		return "success";
	},
},
{
	id:10080,

	mission_start:(player,enemy)=>{
		
	},
	mission_check:(player,enemy)=>{
		return mission[15].mission_success(player,enemy);
		
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.mission=-1; //mission remove 
		player.remining=0;
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.state["suckBlood"]=true;
		player.maxHp-=8;
		player.hp = Math.min(player.maxHp,player.hp); 
		player.mission=-1; //mission remove 
		player.remining=0;
		player.nextMissionAvailable[8]=-1;
		return "success";
	},
},
{
	id:10090,
	
	mission_start:(player,enemy)=>{
		player.remining=1;
		player.state["canPray"]=true;

	},
	mission_check:(player,enemy)=>{
		
		if(player.action.basic == "pray" && enemy.action.basic == "atk"){
			return 	mission[16].mission_success(player,enemy);	
		}
		return "ongoing";
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.remining=0;
		player.mission=-1;
		player.state["canPray"]=false;
		return "fail";
	
	},
	mission_success:(player,enemy)=>{
		enemy.atk = Math.ceil(enemy.atk/2);
		player.mission=-1; //mission remove 
		player.nextMissionAvailable[9]=-1;
		player.nextMissionAvailable[11]=0;
		player.nextMissionAvailable[12]=0;
		player.nextMissionAvailable[13]=0;
		player.remining=0;
		return "success";
	},
},
{
	id:10100,
	
	mission_start:(player,enemy)=>{
		player.state["canPray"]=true;
		player.remining=0;

	},
	mission_check:(player,enemy)=>{
		
		if(player.action.basic == "pray" && enemy.action.basic == "def"){
			return 	mission[17].mission_success(player,enemy);	
		}
		return "ongoing";
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.mission=-1;
		player.remining=0;
		player.state["canPray"]=false;
		return "fail";
	},
	mission_success:(player,enemy)=>{
		enemy.def = Math.ceil(enemy.def/2);
		player.mission=-1; //mission remove 
		player.nextMissionAvailable[10]=-1;
		player.nextMissionAvailable[11]=0;
		player.nextMissionAvailable[12]=0;
		player.nextMissionAvailable[13]=0;
		player.remining=0;
		return "success";
	},
},
{
	id:10110,
	
	mission_start:(player,enemy)=>{
		
	},
	mission_check:(player,enemy)=>{
		
		if(player.action.basic == "pray"){
			return 	mission[18].mission_success(player,enemy);	
		}
		return "ongoing";
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.mission=-1;

		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.prayHealth+=2;
		player.mission=-1; //mission remove 
		player.nextMissionAvailable[11]=-1;
		return "success";
	},
},
{
	id:10120,
	
	mission_start:(player,enemy)=>{
		player.remaining=3;
	},
	mission_check:(player,enemy)=>{
		
		if(player.action.basic == "pray"){
			player.remaining-=1;
			if(player.remaining==0){
				return 	mission[19].mission_success(player,enemy);
			}	
		}
		return "ongoing";
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.mission=-1;
		player.remining=0;
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.state["canRedBless"]=true;
		player.mission=-1; //mission remove 
		player.remining=0;
		player.nextMissionAvailable[12]=-1;
		player.nextMissionAvailable[13]=-1;
		player.nextMissionAvailable[10]=-1;
		return "success";
	},
},
{
	id:10130,
	
	mission_start:(player,enemy)=>{
		player.remaining=3;
	},
	mission_check:(player,enemy)=>{
		
		if(player.action.basic == "pray"){
			player.remaining-=1;
			if(player.remaining==0){
				return mission[20].mission_success(player,enemy);
			}	
		}
		return "ongoing";
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.mission=-1;
		player.remining=0;
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.state["canBlueBless"]=true;
		player.mission=-1; //mission remove 
		player.remining=0;
		player.nextMissionAvailable[12]=-1;
		player.nextMissionAvailable[9]=-1;
		player.nextMissionAvailable[13]=-1;
		return "success";
	},
},

{
	id:10140,
	
	mission_start:(player,enemy)=>{
		player.remianing=5;
		player.tempObj["total_used"]=sumOfObj(player.itemRecord);
	},
	mission_check:(player,enemy)=>{
		player.remaining = player.tempObj["total_used"] - sumOfObj(player.itemRecord) +5;
		if(sumOfObj(player.itemRecord)-player.tempObj["total_used"]>=5){
			return mission[21].mission_success(player,enemy);
		}
		return "ongoing";
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.mission=-1;
		player.remaining = 0;
		player.tempObj = {};
		return "fail";
	},
	mission_success:(player,enemy)=>{
		player.remaining =	0;
		player.mission=-1; //mission remove 
		player.tempObj = {};
		player.nextMissionAvailable[14]=-1;

		return "success";
	},
},

{
	id:10150,
	
	mission_start:(player,enemy)=>{

		player.tempObj["knife"]=player.itemRecord[4];
		player.tempObj["smoke"]=player.itemRecord[3];
	},
	mission_check:(player,enemy)=>{
		
	
		if(player.itemRecord[4]-player.tempObj["knife"]>=1 && player.itemRecord[3]-player.tempObj["smoke"]){
				return 	mission[22].mission_success(player,enemy);
		}	
		
		return "ongoing";
	
	},
	mission_fail:(player,enemy)=>{ // when violate the rule, or *discard* 
		player.mission=-1;
		player.tempObj = {};
		return "fail";
	},
	mission_success:(player,enemy)=>{

		player.mission=-1; //mission remove 
		player.tempObj = {};
		player.nextMissionAvailable[15]=-1;
		player.state["thief"]=true;
		return "success";
	},
},

]

module.exports = mission;