var WAVE = WAVE || {};

WAVE.instance = (function()
{
// private
// public
    function _tick()
    {
        let delta = MODEL.instance.waveSpeed() * MODEL.instance.waveDirection();
        MODEL.instance.wavePhase(MODEL.instance.wavePhase() + delta);
    }
    return {
        tick: _tick
    };
})();
// singleton
