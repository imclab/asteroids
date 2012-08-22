/*global define:true */

define(['app/stage','app/motionelementfactory'],
function(Stage,MotionElementFactory) {

    return {
        start : function(){
            var stage = new Stage(1000);
            stage.init();
            var mef = new MotionElementFactory({'stage':stage});
            stage.addMotionElement(mef.createElement('ship'));
            stage.initAnim();
        }
    };

});
