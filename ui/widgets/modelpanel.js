'use strict'

var MODELPANEL = MODELPANEL || {};

MODELPANEL.instance = (function(x, y, w, h)
{
// private
    var _x = x;
    var _y = y;
    var _w = w;
    var _h = h;
    //var _children = [];   // this one doesn't have children
    var _pixelsPerMeter = 120;
    function _pixelsToMeters(v)
    {
        return VECTOR.div(v, _pixelsPerMeter);
    }
    function _metersToPixels(v)
    {
        var vv = VECTOR.mul(v, _pixelsPerMeter);
        // TODO the below is a dirty hack
        vv.y(450 - vv.y()); // replace 450 with _h
        return vv;
    }
    function _drawMasses(ctx)
    {
        var massRadius = 4;
        MODEL.instance.masses.forEach(function(mass) {
            var [x, y] = _metersToPixels(mass.s).get();
            ctx.beginPath();
            ctx.arc(
                x, y, massRadius,
                0, Math.PI * 2, false
            );
            ctx.fillStyle = '#000000';
            ctx.fill();
            ctx.closePath();
        });
    }
    function _drawSprings(ctx)
    {
        var muscleDotRadius = 1.5;
        MODEL.instance.springs.forEach(function(spr) {
            // draw line
            var [x1, y1] = _metersToPixels(spr.m1.s).get();
            var [x2, y2] = _metersToPixels(spr.m2.s).get();
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = '#000000';
            ctx.stroke();
            ctx.closePath();
            // draw muscle dot
            if (spr.amplitude() != 0.0)
            {
                var xm = (x1 + x2)/2;
                var ym = (y1 + y2)/2;
                ctx.beginPath();
                ctx.arc(
                    xm, ym, muscleDotRadius,
                    0, Math.PI * 2, false
                );
                ctx.fillStyle = '#000000';
                ctx.fill();
                ctx.closePath();
            }
        });
    }
// public
    function __x(x)
    {
        if (x !== undefined)
        {
            _x = x;
        }
        return _x;
    }
    function __y(y)
    {
        if (y !== undefined)
        {
            _y = y;
        }
        return _y;
    }
    function __w(w)
    {
        if (w !== undefined)
        {
            _w = w;
        }
        return _w;
    }
    function __h(h)
    {
        if (h !== undefined)
        {
            _h = h;
        }
        return _h;
    }
    function _draw(ctx)
    {
        _drawMasses(ctx);
        _drawSprings(ctx);
        // draw circled mass
        // draw rubberbanding
    }
    function _signal(e)
    {
    }
    return {
        x: __x,
        y: __y,
        w: __w,
        h: __h,
        draw: _draw,
        signal: _signal
    };
})();
// singleton
