/**
 * Created by 周哥 on 2015/12/8.
 */
(function (){
    eventBind();
    conditionTesting();
})();

function conditionTesting(){
    //获取状态码
    var conditionCode=baseCondition.weather+""+baseCondition.rubbish+""+baseCondition.isDry+""
        +baseCondition.isWasherFree+""+baseCondition.washerHasClothes+""
        +baseCondition.isClotheslineFree+""+baseCondition.basketHasClothes+""
        +baseCondition.isBasketFree+""+baseCondition.isWardrobeFree+"";
    //判断机器人要做的事情
    conditionJudge(conditionCode);

    return conditionCode;
}

//散步条件检测
function walkConditionTesting(){
    //获取状态码
    var conditionCode=baseCondition.weather+""+baseCondition.rubbish+""+baseCondition.isDry+""
        +baseCondition.isWasherFree+""+baseCondition.washerHasClothes+""
        +baseCondition.isClotheslineFree+""+baseCondition.basketHasClothes+""
        +baseCondition.isBasketFree+""+baseCondition.isWardrobeFree+"";

    if(conditionCode.match(/(^[^2][0-1]{2}111)(\w+)/)){//机器人晾衣服
        componentState.isRobotWalk=false;
    }else if(conditionCode.match(/(^[^2][0-1]1[0-1][0-1]0)(\w+)/)){//机器人收衣服
        componentState.isRobotWalk=false;
    }else if(conditionCode.match(/(^[0-2]{3}10[0-1]1)(\w+)/)){//机器人洗衣服
        componentState.isRobotWalk=false;
    }else if(conditionCode.match(/(2)(\w+)/)){//下雨时机器人回屋内
        componentState.isRobotWalk=false;
    }
}

//事件绑定
function eventBind(){
    var sunSelection=document.getElementById("sunny");
    var rainSelection=document.getElementById("rain");
    var overcastSelection=document.getElementById("overcast");
    var rubbish=document.getElementById("rubbish");
    var clothes=document.getElementById("clothes");
    var weather=document.getElementById("sun");

    sunSelection.addEventListener("click",function (){
        baseCondition.weather=0;
        weather.src="image/ty.gif";
        //晴天按钮设置为选中
        sunSelection.src="image/tyan.png";
        rainSelection.src="image/xytan.png";
        overcastSelection.src="image/ytan.png";
        //清空下一次移动
        targetPositions=[];
        //机器人状态检测
        conditionTesting();
    },false);

    rainSelection.addEventListener("click",function (){
        baseCondition.weather=2;
        weather.src="image/xyt.gif";
        //雨天按钮设置为选中
        sunSelection.src="image/tymxz.png";
        rainSelection.src="image/xytxz.png";
        overcastSelection.src="image/ytan.png";
        //清空下一次移动
        targetPositions=[];
        //机器人状态检测
        conditionTesting();
    },false);

    overcastSelection.addEventListener("click",function (){
        baseCondition.weather=1;
        weather.src="image/xy.gif";
        //阴天按钮设置为选中
        sunSelection.src="image/tymxz.png";
        rainSelection.src="image/xytan.png";
        overcastSelection.src="image/ytxz.png";
        //清空下一次移动
        targetPositions=[];
        //机器人状态检测
        conditionTesting();
    },false);

    rubbish.addEventListener("click",dropLitter,false);
    clothes.addEventListener("click",changeClothes,false);
}