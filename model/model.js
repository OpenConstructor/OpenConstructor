'use strict'

var MODEL = MODEL || {};

// enums
MODEL.Modes = {
    SIMULATE: "simulate",
    CONSTRUCT: "construct",
    DELETE: "delete"
}
Object.freeze(MODEL.Modes);

MODEL.WaveModes = {
    AUTOREVERSE: "auto-reverse",
    FORWARD: "forward",
    REVERSE: "reverse",
    MANUAL: "manual"
}

Object.freeze(MODEL.WaveModes);

// model
MODEL.instance = (function()
{
// private
    var _mode = MODEL.Modes.SIMULATE;
    var _g = -0.1;
    var _f = 0.1;
    var _k = 2;
    var _width = 5.475;
    var _height = 3.57;
    var _surfaceFriction = 0.7;
    var _surfaceReflection = -0.75;
    var _waveAmplitude = 0.5;
    var _wavePhase = 0;
    var _waveSpeed = 0.1;
    var _waveMode = MODEL.WaveModes.AUTOREVERSE;
    var _waveDirection = 1;
    var _selectedItem = undefined;
    var _masses = [];
    var _springs = [];
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
    function __selectedItem(selectedItem)
    {
        if (selectedItem !== undefined)
        {
            _selectedItem = selectedItem;
        }
        return _selectedItem;
    }
    function _exportModel()
    {
        //TODO
    }
    function _importModel()
    {
        //TODO
    }
    function _addMass(m)
    {
        var i = _masses.indexOf(m);
        if (i === -1)
        {
            _masses.push(m);
        }
    }
    function _removeMass(m)
    {
        var removed = false;
        var i = _masses.indexOf(m);
        if (i !== -1)
        {
            _masses.splice(i, 1);

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
    function _addSpring(s)
    {
        if (_springExists(s.m1, s.m2))
        {
            return;
        }
        var i = _springs.indexOf(s);
        if (i === -1)
        {
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
    function _findNearestMass(s)
    {
        var state = {
            sqrSmallestDistance: Number.POSITIVE_INFINITY,
            smallestIndex: -1
        };

        _masses.forEach(function(mass, i) {
            var distance = VECTOR.magSq(VECTOR.sub(s, mass.s))
            if (distance < this.sqrSmallestDistance)
            {
                this.sqrSmallestDistance = distance;
                this.smallestIndex = i;
            }
        }, state);

        if (state.smallestIndex !== -1)
        {
            var ret = {
                item: _masses[state.smallestIndex],
                distance: Math.sqrt(state.sqrSmallestDistance)
            };
            return ret;
        }
    }
    function _findNearestSpring(s)
    {
        var state = {
            sqrSmallestDistance: Number.POSITIVE_INFINITY,
            smallestIndex: -1
        };
        _springs.forEach(function(spr, i) {
            var distance = VECTOR.magSq(VECTOR.sub(s, 
                VECTOR.div(VECTOR.add(spr.m1.s, spr.m2.s), 2)))
            if (distance < this.sqrSmallestDistance)
            {
                this.sqrSmallestDistance = distance;
                this.smallestIndex = i;
            }
        }, state);

        if (state.smallestIndex !== -1)
        {
            var ret = {
                item: _springs[state.smallestIndex],
                distance: Math.sqrt(state.sqrSmallestDistance)
            };
            return ret;
        }
    }
    return {
        mode: __mode,
        g: __g,
        f: __f,
        k: __k,
        width: __width,
        height: __height,
        surfaceFriction: __surfaceFriction,
        surfaceReflection: __surfaceReflection,
        waveAmplitude: __waveAmplitude,
        wavePhase: __wavePhase,
        waveSpeed: __waveSpeed,
        waveMode: __waveMode,
        waveDirection: __waveDirection,
        selectedItem: __selectedItem,
        masses: _masses,
        springs: _springs,
        exportModel: _exportModel,
        importModel: _importModel,
        addMass: _addMass,
        removeMass: _removeMass,
        addSpring: _addSpring,
        removeSpring: _removeSpring,
        findNearestMass: _findNearestMass,
        findNearestSpring: _findNearestSpring,
    }
})();
// singleton

