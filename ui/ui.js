'use strict'

var UI = UI || {};

UI.instance = (function()
{
// private
    var _viewport = undefined;
    var _ctx = undefined;
    // TODO should move into "ModelPanel" class
    var _pixelsPerMeter = 100;
    function _pixelsToMeters(v)
    {
        // TODO should move into "ModelPanel" class
        return VECTOR.div(v, _pixelsPerMeter);
    }
    function _metersToPixels(v)
    {
        // TODO should move into "ModelPanel" class
        let vv = VECTOR.mul(v, _pixelsPerMeter);
        // TODO the below is a dirty stopgap until we have a real
        // ModelPanel class
        vv.y(450 - vv.y()); // hack
        return vv;
    }
    function _drawMasses()
    {
        // TODO should move into "ModelPanel" class
        let massDiameter = 4;
        MODEL.instance.masses.forEach(function(mass) {
            let [x, y] = _metersToPixels(mass.s).get();
            _ctx.beginPath();
            _ctx.arc(
                x, y, massDiameter,
                0, Math.PI * 2, false
            );
            _ctx.fillStyle = '#000000';
            _ctx.fill();
            _ctx.closePath();
        });
    }
    function _drawSprings()
    {
        // TODO should move into "ModelPanel" class
        MODEL.instance.springs.forEach(function(spr) {
            let [x1, y1] = _metersToPixels(spr.m1.s).get();
            let [x2, y2] = _metersToPixels(spr.m2.s).get();
            _ctx.beginPath();
            _ctx.moveTo(x1, y1);
            _ctx.lineTo(x2, y2);
            _ctx.strokeStyle = '#000000';
            _ctx.stroke();
            _ctx.closePath();
        });
    }
// public
    function _initialize()
    {
        _viewport = document.getElementById('viewport');
        _ctx = _viewport.getContext('2d');
    }
    function _draw()
    {
        // this is actually the "ModelPanel" draw function and TODO should move soon
        // note fix dimensions when you do that
        _ctx.clearRect(0, 0, _viewport.width, _viewport.height);
        _drawMasses();
        _drawSprings();
        // draw circled mass
        // draw rubberbanding
    }
    return {
        initialize: _initialize,
        draw: _draw
    };
})();
// singleton

