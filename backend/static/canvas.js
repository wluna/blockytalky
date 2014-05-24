/*
 * Adapted from Coder's Auth app
 */

var circles = [];
var $canvas;
var ctx;
var buildCanvas = function() {
    $canvas = $('#coder-canvas');
    ctx = $canvas.get(0).getContext('2d');
    var w = $canvas.width();
    var h = $canvas.height();
    $canvas.attr('width', w);
    $canvas.attr('height', h);
    ctx.clearRect(0, 0, $canvas.width(), $canvas.height());
    
   
    for ( var x=0; x<12; x++ ) {
        var circle = { 
            x: (Math.random() * (w + 100)) - 50,
            y: (Math.random() * 400) - 200,
            r: (Math.random() * 150) + 30,
            opacity: (Math.random())
        };

        if (circle.opacity < .1) {
            circle.opacity = .1;
        } else if (circle.opacity > .9) {
            circle.opacity = .9;
        }
   
        ctx.beginPath();
        ctx.lineWidth = .8;
        ctx.strokeStyle = 'rgba(255,255,255,' + circle.opacity + ')';
        ctx.arc( circle.x, circle.y, circle.r, 0, Math.PI *2, true );
        ctx.stroke();
        ctx.closePath();
    }
};

$(document).ready(function() {
    buildCanvas();
});
