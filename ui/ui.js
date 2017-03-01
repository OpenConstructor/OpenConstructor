'use strict'

var UI = UI || {};

UI.ui = (function()
{
// private
    var _pixelsPerMeter = 100;
    var _viewport = undefined;
    var _ctx = undefined;
    function _pixelsToMeters(v)
    {
        return VECTOR.div(v, _pixelsPerMeter);
    }
    function _metersToPixels(v)
    {
        return VECTOR.mul(v, _pixelsPerMeter);
    }
    function _drawMasses()
    {
        // should move into "ModelPanel" class
        let massDiameter = 5;
        MODEL.model.masses.forEach(function(mass) {
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
        // should move into "ModelPanel" class
        MODEL.model.springs.forEach(function(spr) {
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
    function _draw()
    {
        // this is actually the "ModelPanel" draw function and should move soon
        // note fix dimensions
        _ctx.clearRect(0, 0, _viewport.width, _viewport.height);
        _drawMasses();
        _drawSprings();
        // draw circled mass
        // draw rubberbanding
    }
// public
    function _initialize()
    {
        _viewport = document.getElementById('viewport');
        _ctx = _viewport.getContext('2d');
    }
    function _loop(unusedTime)
    {
        _draw();
        window.requestAnimationFrame(_loop);
    }
    return {
        initialize: _initialize,
        loop: _loop
    };
})();
// singleton

