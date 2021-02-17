# Introduction 
This is a game made by littleCube2019 and brad1024   

Language : HTML , JavaScript , CSS 
Module : Socket.io , Node.js , JQuery





# Useage
### Step1
Open terminal and
`cd <dir> //your path`
### Step2
`npm start`

### Step3 
Open your web browser and enter the url "localhost:3000"

(Note: you should play this game with full screen)

# Online version
online version:  
https://duel-the-game.herokuapp.com/  

update to horuku
```
heroku git:remote -a duel-the-game
git push heroku master
```

online log:  
https://dashboard.heroku.com/apps/duel-the-game/logs


# Learning Note
可以先切分LEFT & RIGHT 此處可以並行 (運用float) (float:left)
然後再在LEFT裡切TOP DOWN , TOP RIGHT (此時css檔的width %數是外層div的)

EX:
   
L TOP    |R
_________|
L BOTTOM |
         |

div寫法
LEFT (float)
   LEFT_TOP (float)
       section1 
       section2 

   LEFT_BOTTOM (float)
       section1 
       section2 

RIGHT (float)


2. width , height 可以用% 表示佔了外層div的幾%  

3. 除了%、px,還有第三種單位vh,vw，這是相對整個視窗的幾%，但是目前搭配float似乎會出問題  

# Install













