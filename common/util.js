'use strict'

// UTIL contains general utilities and helper functions that are needed all over
// the codebase.
var UTIL = UTIL || {};

// Finds whether (myX, myY) is within the bounding box defined by (x, y, w, h).
// Points lying on the border are still considered to be inside the box.
// Return true if the point is inside the box, otherwise false.
UTIL.inBounds = function(myX, myY, x, y, w, h)
{
    return (myX >= x) && (myX <= x+w) && (myY >= y) && (myY <= y+h);
}
// Draws a bounding rectangle defined by (x, y, w, h) to the drawing context
// ctx.  Clears the rectangle by filling its contents with white.
UTIL.drawBoundingRectangle = function(ctx, x, y, w, h)
{
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    ctx.stroke();
    ctx.closePath();
}

// Given a VECTOR (from), finds the nearest VECTOR in the array (candidates).
// Uses a function (fnCandidateToVector) to convert each array entry into a
// VECTOR for the comparison.  In case of a tie, uses an optional function
// (fnTiebreaker) to choose who wins the tie.  fnTiebreaker is given one
// parameter (the candidate to appraise) and must return true if it should win
// the tie and false otherwise.  If no tiebreaker is specified (or the
// tiebreaker always returns false) then the entry with the smallest array
// index will win the tie.  Returns the nearest vector, or undefined if there
// was no suitable vector (for example, if the candidates array is empty).

UTIL.findNearest = function(from, candidates, fnCandidateToVector, fnTiebreaker)
{
    var state = {
        sqrSmallestDistance: Number.POSITIVE_INFINITY,
        smallestIndex: -1
    };

    candidates.forEach(function(candidate, index) {
        var candidateVector = fnCandidateToVector(candidate);
        var distance = VECTOR.magSq(VECTOR.sub(from, candidateVector));
        if (distance < this.sqrSmallestDistance)
        {
            this.sqrSmallestDistance = distance;
            this.smallestIndex = index;
        }
        if (distance === this.sqrSmallestDistance &&
            fnTiebreaker && fnTiebreaker(candidate))
        {
            this.sqrSmallestDistance = distance;
            this.smallestIndex = index;
        }
    }, state);

    if (state.smallestIndex !== -1)
    {
        var ret = {
            item: candidates[state.smallestIndex],
            distance: Math.sqrt(state.sqrSmallestDistance)
        };
        return ret;
    }
}

