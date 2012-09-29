/*global define:true, my:true */
define([
    'myclass',
    'underscore',
    'app/shape',
    'app/util'
] , function(
    my,
    _,
    Shape,
    util
) {

    var config = {},
    
        Asteroid = my.Class(Shape,{

        constructor : function(conf) {
            if(!(this instanceof Asteroid)) {
                return new Asteroid(conf);
            }

            config = conf;

            var points = util.generateCircPoints(8,60);

            var i = 0, l = points.length;
            for(i=0;i<l;i+=1) {
                points[i].x += (util.randRange(30) - 15);
                points[i].y += (util.randRange(30) - 15);
            }

            var states = {
                'default':{
                    'points':points,
                    'scale':config.scale,
                    'drawStyles':{
                        'lineWidth':9.0,
                        'lineCap':'round',
                        'lineJoin':'round',
                        'strokeStyle':'#222',
                        'fillStyle':'#333'
                    }
                }
            };

            this.state = 'default';

            Asteroid.Super.call(this,{
                'states':states,
                gameElement:config.gameElement
            });

        }

    });

    return Asteroid;

});
