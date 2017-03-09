'use strict'

// MODEL stores the vast majority of the constructor's state.  Its name is
// doubly apt: in addition to representing the "model" made of springs and
// masses, it is also the "model" in the model-view controller architecture
// that the constructor uses.
var MODEL = MODEL || {};

// Enum of simulation modes.
MODEL.Modes = {
    SIMULATE: "simulate",
    CONSTRUCT: "construct",
    DELETE: "delete"
};
Object.freeze(MODEL.Modes);

// Enum of wave modes.
MODEL.WaveModes = {
    AUTOREVERSE: "auto reverse",
    FORWARD: "forward",
    REVERSE: "reverse",
    MANUAL: "manual"
};
Object.freeze(MODEL.WaveModes);

// Enum of gravity modes.
MODEL.GravityDirections = {
    DOWN: "gravity on",
    OFF: "gravity off",
    UP: "gravity reverse"
};
Object.freeze(MODEL.GravityDirections);

// Enum for describing the last wall the model touched while auto-reversing.
MODEL.Walls = {
    LEFT: "left",
    RIGHT: "right",
    UNKNOWN: "unknown"
};
Object.freeze(MODEL.Walls);

// Creates the model singleton.  This is the data-structure used all throughout
// the constructor for passing state around.
MODEL.instance = (function()
{
// private
    // The human-readable name of the model, as christened by its creator.
    var _name = "untitled";
    // The name of the person who created the model
    var _author = "yourname";
    // Current simulation mode
    var _mode = MODEL.Modes.SIMULATE;
    // Physical parameters of the model
    var _g = -0.1;
    var _f = 0.1;
    var _k = 2;
    // Model area, measured in meters.
    var _width = 5.475;
    var _height = 3.57;
    // More various parameters...
    var _gravityDirection = MODEL.GravityDirections.DOWN;
    var _surfaceFriction = 0.7;
    var _surfaceReflection = -0.75;
    // Wave amplitude, ranging from 0 to 1.
    var _waveAmplitude = 0.5;
    // Wave phase, measured in radians.  Increases when the wave is running
    // forward and decreases when it is running backward.
    var _wavePhase = 0;
    // Wave speed, measured in radians per frame.
    var _waveSpeed = 0.1;
    var _waveMode = MODEL.WaveModes.AUTOREVERSE;
    // Wave direction.  This is a multiplier:  1 means it's running forwards,
    // -1 means it's running backwards, and 0 means it's stopped (as in manual
    // mode).
    var _waveDirection = 1;
    // The last wall the model touched (used for auto-reverse).
    var _lastWall = MODEL.Walls.UNKNOWN;
    // The mass/spring that's been selected (clicked) in the UI.
    var _selectedItem = undefined;
    // The mass/spring that the mouse is hovering over in the UI.
    var _hoveredItem = undefined;
    // Array of masses in the model.
    var _masses = [];
    // Array of springs in the model.
    var _springs = [];
    // Find whether the two masses (m1, m2) are connected by a spring.
    // Return true if there is a spring connecting them, otherwise false.
    function _springExists(m1, m2)
    {
        _springs.forEach(function(spr) {
            if ((spr.m1 === m1 && spr.m2 === m2) ||
                (spr.m1 === m2 && spr.m2 === m1))
            {
                return true;
            }
        });
        return false;
    }
// public
    // Accessors for the various fields described above.
    // Takes the new value (or undefined to leave unchanged).
    // Returns the current value.
    function __name(name)
    {
        if (name !== undefined)
        {
            _name = name;
        }
        return _name;
    }
    function __author(author)
    {
        if (author !== undefined)
        {
            _author = author;
        }
        return _author;
    }
    function __mode(mode)
    {
        if (mode !== undefined)
        {
            _mode = mode;
        }
        return _mode;
    }
    function __g(g)
    {
        if (g !== undefined)
        {
            _g = g;
        }
        return _g;
    }
    function __f(f)
    {
        if (f !== undefined)
        {
            _f = f;
        }
        return _f;
    }
    function __k(k)
    {
        if (k !== undefined)
        {
            _k = k;
        }
        return _k;
    }
    function __width(width)
    {
        if (width !== undefined)
        {
            _width = width;
        }
        return _width;
    }
    function __height(height)
    {
        if (height !== undefined)
        {
            _height = height;
        }
        return _height;
    }
    function __gravityDirection(gravityDirection)
    {
        if (gravityDirection !== undefined)
        {
            _gravityDirection = gravityDirection;
        }
        return _gravityDirection;
    }
    function __surfaceFriction(surfaceFriction)
    {
        if (surfaceFriction !== undefined)
        {
            _surfaceFriction = surfaceFriction;
        }
        return _surfaceFriction;
    }
    function __surfaceReflection(surfaceReflection)
    {
        if (surfaceReflection !== undefined)
        {
            _surfaceReflection = surfaceReflection;
        }
        return _surfaceReflection;
    }
    function __waveAmplitude(waveAmplitude)
    {
        if (waveAmplitude !== undefined)
        {
            _waveAmplitude = waveAmplitude;
        }
        return _waveAmplitude;
    }
    function __wavePhase(wavePhase)
    {
        if (wavePhase !== undefined)
        {
            _wavePhase = wavePhase;
        }
        return _wavePhase;
    }
    function __waveSpeed(waveSpeed)
    {
        if (waveSpeed !== undefined)
        {
            _waveSpeed = waveSpeed;
        }
        return _waveSpeed;
    }
    function __waveMode(waveMode)
    {
        if (waveMode !== undefined)
        {
            _waveMode = waveMode;
            // if needed, change current wave direction to comply with the mode
            switch (waveMode)
            {
            case MODEL.WaveModes.AUTOREVERSE:
                _waveDirection = (_waveDirection == 0)? 1 : _waveDirection;
            case MODEL.WaveModes.FORWARD:
                _waveDirection = 1;
                break;
            case MODEL.WaveModes.REVERSE:
                _waveDirection = -1;
                break;
            case MODEL.WaveModes.MANUAL:
                _waveDirection = 0;
                break;
            }
        }
        return _waveMode;
    }
    function __waveDirection(waveDirection)
    {
        if (waveDirection !== undefined)
        {
            _waveDirection = waveDirection;
        }
        return _waveDirection;
    }
    function __lastWall(lastWall)
    {
        if (lastWall !== undefined)
        {
            _lastWall = lastWall;
        }
        return _lastWall;
    }
    function __selectedItem(selectedItem)
    {
        if (selectedItem !== undefined)
        {
            _selectedItem = selectedItem;
        }
        return _selectedItem;
    }
    function __hoveredItem(hoveredItem)
    {
        if (hoveredItem !== undefined)
        {
            _hoveredItem = hoveredItem;
        }
        return _hoveredItem;
    }
    // Returns a JSON string describing the current model geometry and state,
    // suitable for saving to file.
    function _exportModel()
    {
        // The "version" field describes the format of the exported JSON.  It
        // started with 0 with the first release and is intended to increment
        // if fields are added or removed in future revisions of the save file
        // format.  This allows the constructor to be backwards-compatible with
        // old saves.
        return JSON.stringify({"version": 0,
                               "name": _name,
                               "author": _author,
                               "g": _g,
                               "f": _f,
                               "k": _k,
                               "width": _width,
                               "height": _height,
                               "gravityDirection": _gravityDirection,
                               "surfaceFriction": _surfaceFriction,
                               "surfaceReflection": _surfaceReflection,
                               "waveAmplitude": _waveAmplitude,
                               "wavePhase": _wavePhase,
                               "waveSpeed": _waveSpeed,
                               "waveMode": _waveMode,
                               "waveDirection": _waveDirection,
                               "masses": MODEL.instance.masses,
                               "springs": MODEL.instance.springs});
    }
    // Appends the saved model state to the window URL, as base64-encoded JSON
    // stored in a fragment identifier.  This lets you "save the model" by
    // bookmarking that URL, and lets you share models by sharing the URL.
    // Replaces any fragment identifier that was already present (like an
    // earlier saved model).
    // See: https://en.wikipedia.org/wiki/Fragment_identifier
    function _exportModelToURL()
    {
        var exportStr = _exportModel();
        window.location.href = window.location.href.split("#")[0] + "#" + btoa(exportStr);
    }
    // Restores model from a JSON string (see _exportModel).
    function _importModel(jstr)
    {
        // Clear any masses and springs in the current model
        _masses.length = 0;
        _springs.length = 0;
        // Restore model from string
        var myJson = JSON.parse(jstr);
        _name = myJson.name;
        _author = myJson.author;
        _g = myJson.g;
        _f = myJson.f;
        _k = myJson.k;
        _width = myJson.width;
        _height = myJson.height;
        _gravityDirection = myJson.gravityDirection;
        _surfaceFriction = myJson.surfaceFriction;
        _surfaceReflection = myJson.surfaceReflection;
        _waveAmplitude = myJson.waveAmplitude;
        _wavePhase = myJson.wavePhase;
        _waveSpeed = myJson.waveSpeed;
        _waveMode = myJson.waveMode;
        _waveDirection = myJson.waveDirection;
        myJson.masses.forEach(function(jMass) {
            var myMass = MASS.create(VECTOR.create(jMass.s.x, jMass.s.y));
            myMass.v.x(jMass.v.x);
            myMass.v.y(jMass.v.y);
            myMass.a.x(jMass.a.x);
            myMass.a.y(jMass.a.y);
            _addMass(myMass);
        });
        myJson.springs.forEach(function(jSpring) {
            var mySpring = SPRING.create(_masses[jSpring.m1], _masses[jSpring.m2], jSpring.restlength, jSpring.amplitude, jSpring.phase, jSpring.isBar, jSpring.reflection, jSpring.friction);
            _addSpring(mySpring);
        });
    }
    // Restores model from a base64-encoded JSON fragment identifier in the URL
    // (see _exportModelToURL).
    function _importModelFromURL()
    {
        var importStr = atob(window.location.href.split("#")[1]);
        _importModel(importStr);
    }
    // Add a mass into the model (takes a reference to an existing MASS that is
    // not yet part of the model).
    function _addMass(m)
    {
        var i = _masses.indexOf(m);
        if (i === -1)
        {
            _masses.push(m);
        }
    }
    // Remove a mass from the model (takes a reference to a MASS that is
    // currently part of the model).  Returns true if the mass was removed, or
    // false if it couldn't be removed because it wasn't in the model.
    function _removeMass(m)
    {
        var removed = false;
        var i = _masses.indexOf(m);
        if (i !== -1)
        {
            // Delete the mass
            _masses.splice(i, 1);
            // Also delete any springs that contain the mass
            var state = {
                victimSprings: []
            }
            _springs.forEach(function(spr, i) {
                if (spr.m1 == m || spr.m2 == m)
                {
                    this.victimSprings.push(spr);
                }
            }, state);
            for (i = state.victimSprings.length-1; i >= 0; i--)
            {
                _removeSpring(state.victimSprings[i]);
                removed = true;
            }
        }
        return removed;
    }
    // Add a spring into the model (takes a reference to an existing SPRING
    // that is not yet part of the model).
    function _addSpring(s)
    {
        // If the two masses are already connected by a spring in the model,
        // don't add another connection between them.
        if (_springExists(s.m1, s.m2))
        {
            return;
        }
        var i = _springs.indexOf(s);
        if (i === -1)
        {
            // Also add the masses (at each end of the spring) if they aren't
            // already part of the model.
            if (_masses.indexOf(s.m1) === -1)
            {
                _addMass(s.m1);
            }
            if (_masses.indexOf(s.m2) === -1)
            {
                _addMass(s.m2);
            }
            _springs.push(s);
        }
    }
    // Remove a spring from the model (takes a reference to a SPRING that is
    // currently part of the model).  The masses connected to the spring are
    // not affected.  Returns true if the spring was removed, or false if it
    // couldn't be removed because it wasn't in the model.
    function _removeSpring(s)
    {
        var removed = false;
        var i = _springs.indexOf(s);
        if (i !== -1)
        {
            _springs.splice(i, 1);
            removed = true;
        }
        return removed;
    }
    // Find the mass in the model that is closest to the given vector (s).  s
    // is measured in meters.
    function _findNearestMass(s)
    {
        return UTIL.findNearest(s, _masses, function(mass) {
            return mass.s;
        });
    }
    // Find the spring in the model that is closest to the given vector (s).
    // The "closest" spring is the one whose midpoint is closest to s.
    // s is measured in meters.
    function _findNearestSpring(s)
    {
        return UTIL.findNearest(s, _springs, function(spring) {
            return VECTOR.div(VECTOR.add(spring.m1.s, spring.m2.s), 2);
        });
    }
    return {
        name: __name,
        author: __author,
        mode: __mode,
        g: __g,
        f: __f,
        k: __k,
        width: __width,
        height: __height,
        gravityDirection: __gravityDirection,
        surfaceFriction: __surfaceFriction,
        surfaceReflection: __surfaceReflection,
        waveAmplitude: __waveAmplitude,
        wavePhase: __wavePhase,
        waveSpeed: __waveSpeed,
        waveMode: __waveMode,
        waveDirection: __waveDirection,
        lastWall: __lastWall,
        selectedItem: __selectedItem,
        hoveredItem: __hoveredItem,
        masses: _masses,
        springs: _springs,
        exportModel: _exportModel,
        exportModelToURL: _exportModelToURL,
        importModel: _importModel,
        importModelFromURL: _importModelFromURL,
        addMass: _addMass,
        removeMass: _removeMass,
        addSpring: _addSpring,
        removeSpring: _removeSpring,
        findNearestMass: _findNearestMass,
        findNearestSpring: _findNearestSpring
    };
})();
// singleton

