'use strict'

// WAVE is a very simple controller that updates the MODEL's wave phase every
// tick, based on the wave direction and speed indicated in the MODEL.
var WAVE = WAVE || {};

// Creates the wave controller singleton.
WAVE.instance = (function()
{
// private
// public
    // Run the controller.  This should be called once per frame.
    function _tick()
    {
        var delta = MODEL.instance.waveSpeed() * MODEL.instance.waveDirection();
        MODEL.instance.wavePhase(MODEL.instance.wavePhase() + delta);
    }
    return {
        tick: _tick
    };
})();
// singleton
