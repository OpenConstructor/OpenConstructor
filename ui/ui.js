'use strict'

// UI is the top-level user interface, which renders the MODEL to an HTML5
// canvas every frame.  It also provides various WIDGETS which can be used
// to view and control the model.
var UI = UI || {};

// Create the UI singleton.
UI.instance = (function()
{
// private
    // The HTML <canvas> where the UI will be rendered.
    var _viewport = undefined;
    // The CanvasRenderingContext2D drawing context of the <canvas>.
    var _ctx = undefined;
    // The HTML <input> displaying the name of the model's creator, and
    // allowing a new name to be specified.
    var _authorField = undefined;
    // The HTML <input> displaying the name of the model, and allowing a
    // new name to be specified.
    var _nameField = undefined;
    // The top left corner of the <canvas> in terms of the browser's client
    // coordinates, stored as a VECTOR, measured in pixels.
    // See:  https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX
    var _canvasTopLeft = undefined;
    // _rootpanel is the top-level WIDGET in the user interface.  For more
    // details, see ui/widgets/rootwidget.js.
    var _rootpanel = undefined;
    // Callback function fired when the user types in _authorField.
    function _updateAuthor()
    {
        MODEL.instance.author(_authorField.value);
    }
    // Callback function fired when the user types in _nameField.
    function _updateModelname()
    {
        MODEL.instance.name(_nameField.value);
    }
// public
    // Initialize the UI.  This cannot necessarily be done in the constructor
    // because we don't want to hook up all the callback functions until all
    // the other javascript files have also had a chance to construct their
    // singletons.
    function _initialize()
    {
        // grab a reference to the canvas so we have someplace to draw
        _viewport = document.getElementById('viewport');
        _ctx = _viewport.getContext('2d');
        _canvasTopLeft = VECTOR.create(_viewport.getBoundingClientRect()["left"],
                                       _viewport.getBoundingClientRect()["top"]);
        _rootpanel = ROOTPANEL.create(_viewport.width, _viewport.height);
        // grab references to the textboxes that display model name and author
        _authorField = document.getElementById('authorField'); 
        _nameField = document.getElementById('nameField');
        // set up the events that the UI will listen for
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
    // Update the UI from the model state.  Called once per frame.
    function _draw()
    {
        // Tell the root WIDGET to redraw itself.  This propagates down the
        // entire tree of WIDGETS so they are all redrawn too.
        _rootpanel.draw(_ctx);
        // If the author name or model name has changed (as happens when a model
        // is saved or loaded) update the <input> fields to match.
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
