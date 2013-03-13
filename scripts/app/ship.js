/*global define:true, my:true  */

define(['underscore','myclass','app/actor','app/util'],
function(_,my,Actor,util) {

  Ship = my.Class(Actor,{

    constructor : function(config) {
      if(!(this instanceof Ship)) {
          return new Ship(config);
      }

      this.attributes = {},
      this.attributes = _.extend(this.attributes,config);

      this.attributes.states = {
        'default':{
          'points':[
            {x:-20, y:  0}, // tail
            {x:-10, y: 15},
            {x: -2, y: 15},
            {x: 40, y:  0}, // nose
            {x: -2, y:-15},
            {x:-10, y:-15}
          ],
          'scale':this.attributes.drawScale || 2,
          'drawStyles':{
            'lineWidth':3.0,
            'lineCap':'round',
            'lineJoin':'round',
            'strokeStyle':'#111',
            'fillStyle':'#666666'
          }
        }
      };

      this.attributes.readyToFire = true;
      this.attributes.firingRate = 1000/6;
      this.attributes.force = 4000;
      this.attributes.torque = (!!this.attributes.torque) ?
        this.attributes.torque : 8000;

      this.attributes.angularDamping = 1;

      Ship.Super.call(this,this.attributes);
    },

    update : function() {

      var keys = this.attributes.stage.getKeys(),
          localVector,
          worldVector,
          angle;

      if(keys.up) {
        localVector = this.attributes.physics.b2Vec2(this.attributes.force,0);
        worldVector = this.body.GetWorldVector(localVector);
        this.body.ApplyForce(worldVector,this.body.GetWorldCenter());
      }

      if(keys.left) {
        this.body.ApplyTorque(-this.attributes.torque);
      }

      if(keys.right) {
        this.body.ApplyTorque(this.attributes.torque);
      }

      Ship.Super.prototype.update.call(this);
    },

    adjustDirection : function(angle,step) {
      var d = angle + step;
      if(Math.abs(d) > Math.PI) { d = -(d - (d % Math.PI)); }
      return d;
    }

  });

  return Ship;

});
