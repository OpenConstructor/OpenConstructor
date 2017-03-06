'use strict'

var UI = UI || {};

UI.instance = (function()
{
// private
    var _viewport = undefined;
    var _ctx = undefined;
    var _authorField = undefined;
    var _nameField = undefined;
    var _canvasTopLeft = undefined;
    var _rootpanel = undefined;
    function _updateAuthor()
    {
        MODEL.instance.author(_authorField.value);
    }
    function _updateModelname()
    {
        MODEL.instance.name(_nameField.value);
    }
// public
    function _initialize()
    {
        // grab the canvas so we have someplace to draw
        _viewport = document.getElementById('viewport');
        _ctx = _viewport.getContext('2d');
        _canvasTopLeft = VECTOR.create(_viewport.getBoundingClientRect()["left"],
                                       _viewport.getBoundingClientRect()["top"]);
        _rootpanel = ROOTPANEL.create(_viewport.width, _viewport.height);
        // grab the textboxes that display the model name and author
        _authorField = document.getElementById('authorField'); 
        _nameField = document.getElementById('nameField');
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
        _authorField.oninput = _updateAuthor;
        _nameField.oninput = _updateModelname;
    }
    function _draw()
    {
        _rootpanel.draw(_ctx);
        if(_authorField.value != MODEL.instance.author() ||
           _nameField.value != MODEL.instance.name())
        {
            _authorField.value = MODEL.instance.author();
            _nameField.value = MODEL.instance.name();
        }
    }
    return {
        initialize: _initialize,
        draw: _draw
    };
})();
// singleton
