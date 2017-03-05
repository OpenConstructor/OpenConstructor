'use strict'

var UI = UI || {};

UI.instance = (function()
{
// private
    var _viewport = undefined;
    var _ctx = undefined;
    var _canvasTopLeft = undefined;
    var _rootpanel = undefined;
// public
    function _initialize()
    {
        // grab the canvas so we have someplace to draw
        _viewport = document.getElementById('viewport');
        _ctx = _viewport.getContext('2d');
        _canvasTopLeft = VECTOR.create(_viewport.getBoundingClientRect()["left"],
                                       _viewport.getBoundingClientRect()["top"]);
        _rootpanel = ROOTPANEL.create(_viewport.width, _viewport.height);
        // setup the events that the UI will listen for
        function genericHandler(e) {
            // convert from client coordinates to canvas coordinates
            var exy = VECTOR.create(e.clientX, e.clientY);
            exy.sub(_canvasTopLeft);
            // pass along event
            _rootpanel.signal(e, exy);
        };
        _viewport.onmousedown = genericHandler;
        _viewport.onmousemove = genericHandler;
        _viewport.onmouseup = genericHandler;
    }
    function _draw()
    {
        _rootpanel.draw(_ctx);
    }
    return {
        initialize: _initialize,
        draw: _draw
    };
})();
// singleton

