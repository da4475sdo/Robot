/**
 * Created by 周哥 on 2015/12/7.
 */
//组件状态
var componentState={
    washer:0,
    basket:0,
    clothesLine:0,
    wardrobe:3,
    transformClothCount:0,
    isRobotWalk:true
};

//基础条件
var baseCondition={
    weather:0,//天气情况（0：晴天，1：阴天；2：下雨）
    rubbish:0,//是否有垃圾（0：没有，1：有）
    isDry:0,//衣服是否干了（0：没有，1：有）
    isWasherFree:1,//洗衣机是否空闲（0：没有，1：有）
    washerHasClothes:0,//洗衣机是否有衣服（0：没有，1：有）
    isClotheslineFree:1,//晾衣杆是否空闲（0：没有，1：有）
    basketHasClothes:0,//篮子里是否有衣服（0：没有，1：有）
    isBasketFree:1,//篮子是否空闲（0：没有，1：有）
    isWardrobeFree:1//衣柜是否空闲（0：没有，1：有）
};

//基础参数设置
var baseParameter={
    dryTimeForSun:30000,
    dryTimeForOvercast:50000,
    washTime:30000,
    basketMax:6,
    wardrobeMax:10,
    clotheslineMax:6
}

//通过条件组合来判断机器人应该做的事
function conditionJudge(conditionCode){
   if(conditionCode.match(/(^[^2][0-1]{2}111)(\w+)/)){//机器人晾衣服
       hangTheClothes();
   }else if(conditionCode.match(/(^[^2][0-1]1[0-1][0-1]0)(\w+)/)){//机器人收衣服
       collectClothes();
   }else if(conditionCode.match(/(^[0-2]{3}10[0-1]1)(\w+)/)){//机器人洗衣服
       washClothes();
   }else if(conditionCode.match(/(2)(\w+)/)){//下雨时机器人回屋内
       goBackHome();
   }else{//机器人空闲散步
       robotWalk();
   }
}

//收衣服
function collectClothes(){
    //还原机器人移动速度
    common.robotSpeed=30;
    //还原机器人移动距离
    common.robotDistance=3;
    operationRecord("收衣服");
    //状态表更新机器人状态
    stateListOperation(stateList.robot,"<strong>机器人：</strong>收衣服");
    var source=common.robot;
    //收衣服操作
    routeGeneration(source,targetsCoordinates.clothesline,function (){
        var clothes=document.getElementById("main-yard-clothes");
        //设置运输中的衣服数量
        componentState.transformClothCount=document.getElementsByName("cloth").length;
        //将衣服节点删除
        clothes.innerHTML="";
        componentState.clothesLine=0;
        //设置晾衣架为空闲
        baseCondition.isClotheslineFree=1;
        //状态表更新晾衣架状态
        stateListOperation(stateList.clothesLine,"<strong>晾衣架：</strong>有0件衣服");
        targetStop(false,function(){});
        //切换图标
        changeIcon(1);
        //将衣服送回衣柜
        routeGeneration(source,targetsCoordinates.wardrobe,function (){
            componentState.wardrobe+=componentState.transformClothCount;
            //状态表更新衣柜状态
            stateListOperation(stateList.wardrobe,"<strong>衣柜：</strong>有"+componentState.wardrobe+"件衣服");
            //设置衣柜不空闲且有衣服
            baseCondition.isWardrobeFree=0;
            //设置运输中的衣服数量
            componentState.transformClothCount=0;
            //切换图标
            changeIcon(0);
            //继续检测
            targetStop(true,function(){});
        });
    });
}

//晾衣服
function hangTheClothes(){
    //还原机器人移动速度
    common.robotSpeed=30;
    //还原机器人移动距离
    common.robotDistance=3;
    operationRecord("晾衣服");
    //状态表更新机器人状态
    stateListOperation(stateList.robot,"<strong>机器人：</strong>晾衣服");
    var source=common.robot;
    //从洗衣机里取衣服
    routeGeneration(source,targetsCoordinates.washer,function (){
        //洗衣机里衣服的数量
        componentState.transformClothCount=componentState.washer;
        componentState.washer=0;
        //设置洗衣机空闲且没有衣服
        baseCondition.isWasherFree=1;
        baseCondition.washerHasClothes=0;
        //状态表更新洗衣机状态
        stateListOperation(stateList.washer,"<strong>洗衣机：</strong>空闲且没有衣服");
        targetStop(false,function(){
            //切换洗衣机空闲无衣物状态
            common.washer.src="image/xyjkxwyw.png";
        });
        //切换图标
        changeIcon(1);
        //将衣服放到晾衣架上
        routeGeneration(source,targetsCoordinates.clothesline,function (){
            var clothes=document.getElementById("main-yard-clothes");
            //添加衣服节点
            var html='';
            for(var i= 0;i<componentState.transformClothCount;i++){
                html+='<li class="main-yard-clothe"><img name="cloth" src="image/yf.png" alt="衣服"/></li>';
            }
            clothes.innerHTML=html;
            //设置晾衣架不空闲
            baseCondition.isClotheslineFree=0;
            //设置衣服为湿的
            baseCondition.isDry=0;
            //状态表更新晾衣架状态
            stateListOperation(stateList.clothesLine,"<strong>晾衣架：</strong>"+componentState.transformClothCount+"件湿衣服");
            //继续检测
            targetStop(true,function(){});
            //切换图标
            changeIcon(0);
            //设置衣服干的时间
            var dryTime=baseCondition.weather===0?baseParameter.dryTimeForSun:baseParameter.dryTimeForOvercast;
            common.clothesDryTimer=setTimeout(function (){
                baseCondition.isDry=1;
                var clothes=document.getElementsByName("cloth");
                for(var i= 0,len=clothes.length;i<len;i++){
                    clothes[i].src="image/gyf.png";
                }
                //状态表更新晾衣架状态
                stateListOperation(stateList.clothesLine,"<strong>晾衣架：</strong>"+clothes.length+"件干衣服");
            },dryTime);
        });
    });
}

//洗衣服
function washClothes(){
    //还原机器人移动速度
    common.robotSpeed=30;
    //还原机器人移动距离
    common.robotDistance=3;
    operationRecord("洗衣服");
    //状态表更新机器人状态
    stateListOperation(stateList.robot,"<strong>机器人：</strong>洗衣服");
    var source=common.robot;
    //从篮子里取衣服
    routeGeneration(source,targetsCoordinates.basket,function (){
        //篮子里衣服的数量
        var clothCount=componentState.basket;
        componentState.transformClothCount=clothCount;
        componentState.basket=0;
        //设置篮子空闲且没有衣服
        baseCondition.isBasketFree=1;
        baseCondition.basketHasClothes=0;
        //状态表更新篮子状态
        stateListOperation(stateList.basket,"<strong>篮子：</strong>有"+componentState.basket+"件衣服");
        targetStop(false,function(){});
        //切换图标
        changeIcon(1);
        //将衣服放到洗衣机里
        routeGeneration(source,targetsCoordinates.washer,function (){
            componentState.washer=componentState.transformClothCount;
            //设置洗衣机不空闲且有衣服
            baseCondition.isWasherFree=0;
            baseCondition.washerHasClothes=1;
            //状态表更新洗衣机状态
            stateListOperation(stateList.washer,"<strong>洗衣机：</strong>不空闲且有衣服");
            //继续检测
            targetStop(true,function(){
                //切换洗衣机运行状态
                common.washer.src="image/xyj.png";
            });
            //切换图标
            changeIcon(0);
            //设置洗衣机空闲
            var washTime=baseParameter.washTime;
            common.clothesWashTimer=setTimeout(function (){
                baseCondition.isWasherFree=1;
                //切换洗衣机不运转但有衣服状态
                common.washer.src="image/xyjkxyyw.png";
                //状态表更新洗衣机状态
                stateListOperation(stateList.washer,"<strong>洗衣机：</strong>空闲且有衣服");
            },washTime);
        });
    });
}

//机器人下雨回屋内
function goBackHome(){
    //还原机器人移动速度
    common.robotSpeed=30;
    //还原机器人移动距离
    common.robotDistance=3;
    //状态表更新机器人状态
    stateListOperation(stateList.robot,"<strong>机器人：</strong>回屋内躲雨");
    var source=common.robot;
    //机器人回屋内
    routeGeneration(source,targetsCoordinates.room,function (){
        //继续检测
        targetStop(false,function(){
        });
    });
}

//机器人在院里散步
function robotWalk(){
    var source=common.robot;
    var rubbishes=document.getElementsByName("rubbish");
    //是否有垃圾
    if(rubbishes.length){
        //还原机器人移动速度
        common.robotSpeed=30;
        //还原机器人移动距离
        common.robotDistance=3;
        operationRecord("垃圾扔到垃圾桶");
        //状态表更新机器人状态
        stateListOperation(stateList.robot,"<strong>机器人：</strong>扔垃圾");
        var rubbish=rubbishes[0];
        var house=document.getElementById("main-house");
        var houseHeight=house.clientHeight||house.innerHeight;
        routeGeneration(source,{
            top:houseHeight+rubbish.offsetTop,
            left:rubbish.offsetLeft-source.offsetWidth
        },function (){
            //删除垃圾
            document.getElementById("main-yard").removeChild(rubbish);
            //变换图标
            changeIcon(5);
            routeGeneration(source,targetsCoordinates.trash,function (){
                //继续检测
                targetStop(true,function(){});
                changeIcon(0);
            });
        });
    }else{
        //状态表更新机器人状态
        stateListOperation(stateList.robot,"<strong>机器人：</strong>散步");
        //设置机器人为散步的移动速度
        common.robotSpeed=50;
        //设置机器人为散步的移动距离
        common.robotDistance=1;
        routeGeneration(source,targetsCoordinates.yard,function walk(){
            //院子
            var yard=document.getElementById("main-yard");
            //院子的长
            var mainWidth=yard.innerWidth||yard.clientWidth;
            //院子的高
            var mainHeight=targetsCoordinates.trash.top+(yard.innerHeight||yard.clientHeight);
            var randomX=parseInt(mainWidth*Math.random());
            var randomY=parseInt(mainHeight*Math.random());
            //控制机器人每次最少移动20像素
            var targetY=randomY>5||randomY<-5?randomY:randomY*10;
            var targetX=randomX>5||randomX<-5?randomX:randomX*50;
            //碰撞检测
            if(targetY<=obstructionCoordinates.x1.valueYMin){
                targetY=obstructionCoordinates.x1.valueYMin+common.robot.clientHeight||common.robot.innerHeight;
            }else if(targetY>=targetsCoordinates.clothesline.top){
                targetY=targetsCoordinates.clothesline.top-common.robot.clientHeight||common.robot.innerHeight;
            }
            if(targetX<=obstructionCoordinates.x1.valueX){
                targetX=obstructionCoordinates.x1.valueX+common.robot.clientWidth||common.robot.innerWidth;
            }else if(targetX>=(targetsCoordinates.room.left*4-common.robot.clientWidth||common.robot.innerWidth)){
                targetX=targetsCoordinates.room.left*4-(common.robot.clientWidth||common.robot.innerWidth)*2;
            }
            var target={
                left:targetX,
                top:targetY
            };
            routeGeneration(source,target,function walk(){
                //还原机器人移动速度
                common.robotSpeed=30;
                //还原机器人移动距离
                common.robotDistance=3;
                //继续检测
                conditionTesting();
            });
        });
    }
}

//扔垃圾
function dropLitter(){
    //中断机器人散步状态
    componentState.isRobotWalk=false;
    operationRecord("扔垃圾");
    var yard=document.getElementById("main-yard");
    var rubbish=document.createElement("img");
    rubbish.src="image/lj.png";
    rubbish.className="main-yard-rubbish";
    rubbish.name="rubbish";
    rubbish.alt="垃圾";
    var top=50*Math.random();
    var left=80-40*Math.random();
    rubbish.style.top=top+"%";
    rubbish.style.left=left+"%";
    yard.appendChild(rubbish);
}

//换衣服
function changeClothes(){
    operationRecord("主人换衣服");
    //状态表更新主人状态
    stateListOperation(stateList.master,"<strong>主人：</strong>换衣服");
    routeGeneration(common.master,targetsCoordinates.basket,function (){
        if(componentState.basket<=baseParameter.basketMax){
            componentState.basket+=1;
        }
        baseCondition.basketHasClothes=1;
        baseCondition.isBasketFree=0;
        targetStop(false,function(){
        });
        //切换主人脱下衣服状态
        changeIcon(2);
        //状态表更新篮子状态
        stateListOperation(stateList.basket,"<strong>篮子：</strong>有"+componentState.basket+"件衣服");
        routeGeneration(common.master,targetsCoordinates.wardrobe,function (){
            targetStop(false,function(){
            });
            changeIcon(4);
            //状态表更新衣柜状态
            var wardrobeCount=componentState.wardrobe-1;
            stateListOperation(stateList.wardrobe,"<strong>衣柜：</strong>有"+wardrobeCount+"件衣服");
            if(componentState.wardrobe>=1){
                componentState.wardrobe-=1;
            }
            routeGeneration(common.master,targetsCoordinates.master,function (){
                targetPositions=[];
                //状态表更新主人状态
                stateListOperation(stateList.master,"<strong>主人：</strong>休息");
                //继续检测
                conditionTesting();
            });
        });
    });
}

//切换图标
function changeIcon(index){
    switch (index){
        case 1:common.robot.src="image/jqryf.png";break;
        case 2:common.master.src="image/zrmyf.png";break;
        case 3:common.master.src="image/zryg.png";break;
        case 4:common.master.src="image/zr.png";break;
        case 5:common.robot.src="image/jqrlj.png";break;
        default :common.robot.src="image/jqr.png";break;
    };
}

//操作记录
function operationRecord(content){
    var record=document.getElementById("record");
    record.innerHTML=content+"<br/>"+record.innerHTML;
}

//在目标处停留
function targetStop(isTest,handler){
    handler();
    var finishTime=new Date().getTime()+2000;
    for(var i=new Date().getTime();finishTime-i>0;i=new Date().getTime()){};
    //执行检测或者只是等待
    isTest&&conditionTesting();
}

//状态表
function stateListOperation(source,content){
    source.innerHTML=content;
}