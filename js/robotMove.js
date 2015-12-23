/**
 * Created by Administrator on 2015/12/4.
 */
var common={
    robot:document.getElementById("robot"),
    washer:document.getElementById("washer"),
    wardrobe:document.getElementById("wardrobe"),
    basket:document.getElementById("basket"),
    master:document.getElementById("master"),
    sun:document.getElementById("sun"),
    dustbin:document.getElementById("dustbin"),
    hanger:document.getElementById("hanger"),
    leftDoor:document.getElementById("leftDoor"),
    rightDoor:document.getElementById("rightDoor"),
    robotSpeed:30,
    robotDistance:3,
    masterSpeed:30,
    masterDistance:3,
    totalTimer:undefined,
    clothesDryTimer:undefined,
    clothesWashTimer:undefined
};

//部件状态表
var stateList={
    robot:document.getElementById("robotState"),
    master:document.getElementById("masterState"),
    washer:document.getElementById("washerState"),
    basket:document.getElementById("basketState"),
    wardrobe:document.getElementById("wardrobeState"),
    clothesLine:document.getElementById("clothesLineState")
}

//机器人移动定时器
var timer;

//主人移动定时器
var masterTimer;

//所有目标坐标
var targetsCoordinates={};

//所有障碍物坐标范围
var obstructionCoordinates={};

//移动向量数组
var targetPositions=[];

//主人移动向量数组
var targetPositionsMaster=[];

(function main(){
    calculateCoordinates();
})();

//动态计算所有目标点和障碍物的坐标
function calculateCoordinates(){
    var house=document.getElementById("main-house");
    var houseWidth=house.clientWidth||house.innerWidth;
    var houseHeight=house.clientHeight||house.innerHeight;
    var componentHeight=houseHeight*0.28;
    var componentWidth=houseWidth*0.15;

    //衣柜坐标
    targetsCoordinates.wardrobe={
        top:common.wardrobe.offsetTop+common.wardrobe.clientHeight||common.wardrobe.innerHeight,
        left:common.wardrobe.offsetLeft
    };

    //篮子坐标
    targetsCoordinates.basket={
        top:common.basket.offsetTop+common.basket.clientHeight||common.basket.innerHeight,
        left:common.basket.offsetLeft
    };

    //洗衣机坐标
    targetsCoordinates.washer={
        top:common.washer.offsetTop+common.washer.clientHeight||common.washer.innerHeight,
        left:common.washer.offsetLeft
    };

    //主人坐标
    targetsCoordinates.master={
        top:common.master.offsetTop,
        left:common.master.offsetLeft
    };

    //垃圾桶坐标
    targetsCoordinates.trash={
        top:houseHeight+common.dustbin.offsetTop,
        left:common.dustbin.offsetLeft+common.dustbin.clientWidth||common.dustbin.innerWidth
    };

    //晾衣杆坐标
    targetsCoordinates.clothesline={
        top:houseHeight+common.hanger.offsetTop,
        left:common.hanger.offsetLeft-common.robot.clientWidth||common.robot.innerWidth
    };

    //屋内坐标
    targetsCoordinates.room={
        top:houseHeight/3*2,
        left:houseWidth/2
    };

    //屋外坐标
    targetsCoordinates.yard={
        top:houseHeight+componentHeight*2,
        left:houseWidth
    };

    //横向障碍物x1
    obstructionCoordinates.x1={
        valueX:common.dustbin.offsetLeft+common.dustbin.clientWidth||common.dustbin.innerWidth,
        valueYMin:houseHeight,
        valueYMax:common.dustbin.offsetTop+common.dustbin.clientHeight||common.dustbin.innerHeight
    };

    //横向障碍物x2
    obstructionCoordinates.x2={
        valueX:houseWidth-componentWidth,
        valueYMin:componentHeight,
        valueYMax:houseHeight
    };

    //纵向障碍物y1
    obstructionCoordinates.y1={
        valueY:houseHeight,
        valueXMin:common.leftDoor.offsetLeft+4+common.leftDoor.clientWidth||common.leftDoor.innerWidth,
        valueXMax:common.rightDoor.offsetLeft
    };
}

//控制机器人移动
function move(source,index,maxLength,callback){
    var sourceID=source.id;
    var targetPosition;
    var speed;
    var distance;
    if(sourceID==="robot"){
        targetPosition=targetPositions[index];
        speed=common.robotSpeed;
        distance=common.robotDistance;
    }else{
        targetPosition=targetPositionsMaster[index];
        speed=common.masterSpeed;
        distance=common.masterDistance;
    }
    var robot=source;
    var sourceX=robot.offsetLeft;
    var sourceY=robot.offsetTop;
    var targetX;
    var targetY;

    //机器人先进行横向移动
    if(targetPosition.left!=0){
        targetX=targetPosition.left>0?sourceX+distance:sourceX-distance;
        robot.style.left=targetX>=0?targetX+"px":0;
        //当前机器人的位置
        var nowTargetPosition=targetPosition.left>0?targetPosition.left-distance:targetPosition.left+distance;
        //刚刚到达目标
        if(nowTargetPosition*targetPosition.left>0){
            targetPosition.left=nowTargetPosition;
        }else{//当偏移目标时，微调机器人位置
            targetPosition.left=0;
            robot.style.left=nowTargetPosition>0?robot.style.left-nowTargetPosition:robot.style.left+nowTargetPosition;
        }
    }else{
        //机器人再进行纵向移动
        targetY=targetPosition.top>0?sourceY+distance:sourceY-distance;
        robot.style.top=targetY>=0?targetY+"px":0;
        var nowTargetPosition=targetPosition.top>0?targetPosition.top-distance:targetPosition.top+distance;
        if(nowTargetPosition*targetPosition.top>0){
            targetPosition.top=nowTargetPosition;
        }else{
            targetPosition.top=0;
            robot.style.top=nowTargetPosition>0?robot.style.top-nowTargetPosition:robot.style.top+nowTargetPosition;
        }
    }
    if(targetPosition.left!=0|| targetPosition.top!=0){
        callback.name==="walk"&&walkConditionTesting();
        if(callback.name!=="walk"||componentState.isRobotWalk===true){
            sourceID==="robot"?timer=setTimeout(move,speed,source,index,maxLength,callback):
            masterTimer==setTimeout(move,speed,source,index,maxLength,callback);
        }else{
            targetPositions=[];
            clearTimeout(timer);
            //消除机器人的散步状态
            componentState.isRobotWalk=true;
            conditionTesting();
        }
    }else{
        var clearTimer=sourceID==="robot"?timer:masterTimer;
        clearTimeout(clearTimer);
        index++;
        //在机器人移动在目标后开始执行相应的动作
        if(index<maxLength){
            sourceID==="robot"?timer=setTimeout(move,speed,source,index,maxLength,callback):
            masterTimer==setTimeout(move,speed,source,index,maxLength,callback);
        }else{
            sourceID==="robot"?targetPositions=[]:targetPositionsMaster=[];
            callback();
        }
    }
}

//路径的动态规划
function routeGeneration(source,target,callback){
    var sourceX=source.offsetLeft;
    var sourceY=source.offsetTop;
    var sourceID=source.id;

    //机器人和目标不处于同一空间
    if((sourceY>=obstructionCoordinates.y1.valueY&&target.top<=obstructionCoordinates.y1.valueY)
        ||(sourceY<=obstructionCoordinates.y1.valueY&&target.top>=obstructionCoordinates.y1.valueY)){
        //将机器人同一移动到门处
        targetPositions.push({
                top:0,
                left:parseInt(obstructionCoordinates.y1.valueXMin-sourceX)
            });
        //进行纵向移动到与目标同一高度
        targetPositions.push({
            top:parseInt(target.top-sourceY),
            left:0
        });
        //最后进行横向移动到目标
        targetPositions.push({
            top:0,
            left:parseInt(target.left-obstructionCoordinates.y1.valueXMin)
        });
    }else{
        sourceID==="robot"?targetPositions.push({
            left:parseInt(target.left-sourceX),
            top:parseInt(target.top-sourceY)
        }):targetPositionsMaster.push({
                left:parseInt(target.left-sourceX),
                top:parseInt(target.top-sourceY)
            });
    }

    //分段移动数组的下标
    var index=0;
    //数组的长度
    var maxLength=sourceID==="robot"?targetPositions.length:targetPositionsMaster.length;
    //进行移动
    move(source,index,maxLength,callback);
}