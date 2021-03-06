/*global define:true, my:true */

define([
  'myclass',
  'jquery',
  'handlebars',
  'app/canvaswrapper',
  'app/util',
  'app/point',
  'app/actorfactory',
  'app/physics'
], function(
  my,
  $,
  Handlebars,
  CanvasWrapper,
  util,
  Point,
  ActorFactory,
  Physics
){

  var Stage = my.Class((function () {

    // tracks key status
    var keys = {
            right:false,
            left:false,
            up:false,
            down:false,
            space:false
        },

        keymap = {
            k37:'left',
            k39:'right',
            k38:'up',
            k40:'down',
            k32:'space'
        },

        // stores 
        time = 0,

        // canvas context object
        canvas = null,

        // Box2D physics object
        physics,

        // stores a list of motion objects
        actors = [],

        // actors that will be removed outside of a time step
        scheduledForRemoval = [],

        // speed for logic loop which runs 
        // independently of animation loop
        gamespeed = Math.round(1000/50),

        // info obj for output
        consoleData = {infoItems:[]},
        
        // output template
        infoPanelTemplate = Handlebars.compile(util.cleanTemplate('#info-panel-template')),
        
        // DOM node for information output
        infoPanel = $('#infoPanel'),

        renderInterval = null,

        gameLoopInterval = null,

        actorFactory = null;

    // set up key event listeners
    $(document).keydown(function(e) {
      try {
        keys[keymap['k'+e.which]]=true;
      } catch(ex) {}
    });
    
    $(document).keyup(function(e) {
      try {
        keys[keymap['k'+e.which]]=false;
      } catch(ex) {}
    });

    return {

      constructor : function() {
        if(!(this instanceof Stage)) {
            return new Stage();
        }

        physics = new Physics({
          gravity: {x:0,y:0},
          scale: 10
          // , debug: true
        });
        actorFactory = new ActorFactory({'stage':this});
        canvas = new CanvasWrapper('#canvas');
      },

      initAnim : function() {

        var gameLoop = util.initTimingLoop(gamespeed,this.update,this);
        gameLoopInterval = setInterval(gameLoop,0);

        $('.stopanim').click($.proxy(function(){
          this.stopAnim();
        },this));

        canvas.initRenderLoop(this.render,this);

      },

      stopAnim : function() {
        clearInterval(gameLoopInterval);
      },

      getCanvas : function() {
        return canvas;
      },

      getPhysics : function() {
        return physics;
      },

      getTime : function() {
        return time;
      },

      setTime : function (time_arg) {
        time = time_arg;
      },

      getBounds : function() {
        return canvas.getBounds();
      },

      getKeys : function() {
        return keys;
      },

      update : function(updTime) {
        this.updateActors(updTime);
        var world = physics.getWorld(),
            frameRate = 1/60;

        // run physics simulation
        world.Step(
          frameRate,
          8, // velocity iterations
          3  // position iterations
        );

        world.DrawDebugData();
        world.ClearForces();
        this.purgeDeadActors();
      },

      render : function(time) {
        this.setTime(time);
        canvas.clear();
        this.renderActors();
        this.updateInfoPanel();
      },

      updateActors : function(updTime) {
        var i = actors.length;
        while(i--) {
          if(!!actors[i]) {
            actors[i].update(updTime);
            this.correctPosition(actors[i]);
          }
        }
      },

      renderActors : function() {
        var i = actors.length;
        while(i--) {
          if(!!actors[i]) {
            actors[i].render();
          }
        }
      },

      correctPosition : function(actor) { // getionElement as arg
        var bounds = this.getBounds();
        if(actor) {
          var body = actor.body,
              op = body.GetPosition(),
              scale = physics.getScale(),
              x = op.x * scale,
              y = op.y * scale;
          
          if(x > bounds.x2) { body.SetPosition(physics.b2Vec2(bounds.x1/scale,op.y)); }
          if(y > bounds.y2) { body.SetPosition(physics.b2Vec2(op.x,bounds.y1/scale)); }
          if(x < bounds.x1) { body.SetPosition(physics.b2Vec2(bounds.x2/scale,op.y)); }
          if(y < bounds.y1) { body.SetPosition(physics.b2Vec2(op.x,bounds.y2/scale)); }
        }
      },

      addActor : function(actor) {
          actors.push(actor);
      },

      removeActor : function(actor) {
        var i = actors.length;

        while(i--) {
          if(actors[i] === actor) {
            actors.splice(i,1); 
          }
        }
        
      },

      getNumOfActors : function() {
        return actors.length;
      },

      getFps : function() {
        return util.round(1000/(Date.now()-this.getTime()),0);
      },

      getCenterPoint : function() {
        var bounds = this.getBounds(),
            x = bounds.x2/2,
            y = bounds.y2/2,
            point = new Point(x,y);

        return point;
      },

      createActor : function(config) {
        this.addActor(actorFactory.createActor(config));
      },

      setContactListeners : function(callbacks) {
        physics.setContactListeners(callbacks);
      },

      updateInfoPanel : function() {
        consoleData.infoItems = [];
        var numOfActors = actors.length;
        var ship = actors[0];
        
        consoleData.infoItems.push({label:'Actors on Stage',value:numOfActors});
        consoleData.infoItems.push({label:'Shields',value:ship.getShields()});
        // consoleData.infoItems.push({label:'fps',value:this.getFps()});
        infoPanel.html(infoPanelTemplate(consoleData));
      },

      scheduleActorForRemoval : function(actor) {
        scheduledForRemoval.push(actor);
      },

      purgeDeadActors : function() {
        var i = 0, l = scheduledForRemoval.length;
        for(i=0;i<l;i+=1) {
          scheduledForRemoval[i].destroy();
        }
      }
    };

  }()));

  return Stage;
});
