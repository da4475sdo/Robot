/**
 * Created by �ܸ� on 2015/12/8.
 */
(function (){
    eventBind();
    conditionTesting();
})();

function conditionTesting(){
    //��ȡ״̬��
    var conditionCode=baseCondition.weather+""+baseCondition.rubbish+""+baseCondition.isDry+""
        +baseCondition.isWasherFree+""+baseCondition.washerHasClothes+""
        +baseCondition.isClotheslineFree+""+baseCondition.basketHasClothes+""
        +baseCondition.isBasketFree+""+baseCondition.isWardrobeFree+"";
    //�жϻ�����Ҫ��������
    conditionJudge(conditionCode);

    return conditionCode;
}

//ɢ���������
function walkConditionTesting(){
    //��ȡ״̬��
    var conditionCode=baseCondition.weather+""+baseCondition.rubbish+""+baseCondition.isDry+""
        +baseCondition.isWasherFree+""+baseCondition.washerHasClothes+""
        +baseCondition.isClotheslineFree+""+baseCondition.basketHasClothes+""
        +baseCondition.isBasketFree+""+baseCondition.isWardrobeFree+"";

    if(conditionCode.match(/(^[^2][0-1]{2}111)(\w+)/)){//���������·�
        componentState.isRobotWalk=false;
    }else if(conditionCode.match(/(^[^2][0-1]1[0-1][0-1]0)(\w+)/)){//���������·�
        componentState.isRobotWalk=false;
    }else if(conditionCode.match(/(^[0-2]{3}10[0-1]1)(\w+)/)){//������ϴ�·�
        componentState.isRobotWalk=false;
    }else if(conditionCode.match(/(2)(\w+)/)){//����ʱ�����˻�����
        componentState.isRobotWalk=false;
    }
}

//�¼���
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
        //���찴ť����Ϊѡ��
        sunSelection.src="image/tyan.png";
        rainSelection.src="image/xytan.png";
        overcastSelection.src="image/ytan.png";
        //�����һ���ƶ�
        targetPositions=[];
        //������״̬���
        conditionTesting();
    },false);

    rainSelection.addEventListener("click",function (){
        baseCondition.weather=2;
        weather.src="image/xyt.gif";
        //���찴ť����Ϊѡ��
        sunSelection.src="image/tymxz.png";
        rainSelection.src="image/xytxz.png";
        overcastSelection.src="image/ytan.png";
        //�����һ���ƶ�
        targetPositions=[];
        //������״̬���
        conditionTesting();
    },false);

    overcastSelection.addEventListener("click",function (){
        baseCondition.weather=1;
        weather.src="image/xy.gif";
        //���찴ť����Ϊѡ��
        sunSelection.src="image/tymxz.png";
        rainSelection.src="image/xytan.png";
        overcastSelection.src="image/ytxz.png";
        //�����һ���ƶ�
        targetPositions=[];
        //������״̬���
        conditionTesting();
    },false);

    rubbish.addEventListener("click",dropLitter,false);
    clothes.addEventListener("click",changeClothes,false);
}