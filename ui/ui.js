'use strict'

var UI = UI || {};

UI.instance = (function()
{
// private
    var _viewport = undefined;
    var _ctx = undefined;
// public
    function _initialize()
    {
        // grab the canvas so we have someplace to draw
        _viewport = document.getElementById('viewport');
        _ctx = _viewport.getContext('2d');
        // setup the events that the UI will listen for
    }
    function _draw()
    {
        _ctx.clearRect(0, 0, _viewport.width, _viewport.height);
        ROOTPANEL.instance.draw(_ctx);
    }
    return {
        initialize: _initialize,
        draw: _draw
    };
})();
// singleton

