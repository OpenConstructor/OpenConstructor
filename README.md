# Synopsis
openconstructor is an HTML5-based physics simulation for building and animating springy creations.  It is an open-source reimplementation of the [sodaplay](https://web-beta.archive.org/web/20050213021801/http://www.sodaplay.com:80/index.htm) browser game released by [soda creative ltd](http://soda.co.uk/) in 2000.

# For users
openconstructor is [hosted at GitHub Pages](https://peterfidelman.github.io/constructor), so if you want to play with it, that's the place to go.
## Tips and tricks
openconstructor has not yet reached feature parity with the latest versions of sodaplay, but there are some ways to get it to do clever things.

- Right-clicking the bottons on the top bar will cycle through modes in the opposite direction.  Useful when repeatedly toggling between construct and simulate mode.
- When you save a model, the "spew" at the end of the URL is base64-encoded JSON describing the model contents.  This can be readily [base64-decode](http://www.url-encode-decode.com/base64-encode-decode/)d and edited, allowing one to create arbitrarily complex models that might be difficult to make by hand.
- The currently selected (light-blue) mass or spring can be manipulated at the Javascript console as `MODEL.instance.selectedItem()`.  This enables some interesting tricks:
 - `MODEL.instance.selectedItem().restLength(0)` - convert the selected spring into a 0-length zipspring
 - `MODEL.instance.selectedItem().restlength(1.5)` - set length of selected spring: useful for precise construction
 - `MODEL.instance.selectedItem().phase(Math.PI/2)` - set phase of selected muscle to pi/2
 - For a complete list of properties that you can set this way, see `model.js`.
 
## Problem?
openconstructor is an alpha, so you will encounter bugs and rough edges.  Please report them via the github issue tracker, the sodaplay facebook group, or via Peter's base64-encoded email address `ZWRsaW5mYW5AZ21haWwuY29t`.  Please include as much detail as possible so we can reproduce the issue.  Feature requests are also welcome.

# For developers
openconstructor is intended to be simple to understand and to run.  It weighs in under 2000 lines of JS and has no external dependencies.  It is heavily commented and its architecture is kept relatively simple, with the goal of being understandable by anyone who wants to know how it works, and maintainable by anyone who wants to contribute.
## Design goals
- no dependencies
- minimal codebase size and complexity
- O(1) and O(N) algorithms wherever possible
- compatibility with all modern browsers (ES5)
- look-and-feel as close as possible to classic sodaplay
- easy for anyone to create their own models and share them
- easy for anyone to check out, understand, change, and maintain the code

## Organization
openconstructor is a fairly standard [model-view-controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) application.  Predictably enough, the model lives in `model/model.js`.  The rest of the codebase focuses around *viewing* the model in various interesting ways (see `ui/`) and *controlling* the model's state according to the laws of physics (see `controller/`).  These sub-modules do not communicate with each other except through the model; this enables fairly [loose](https://en.wikipedia.org/wiki/Loose_coupling) coupling and allows each module to be swapped out fairly easily (except, of course, for the model structure itself!)

openconstructor's Javascript code is divided into modules using the design pattern described [at this StackOverflow link](http://stackoverflow.com/a/6077087).  This is a more powerful relative of the "Quick and Dirty Modules" pattern described in [Chapter 31](http://speakingjs.com/es5/ch31.html) of Speaking JS.  The pattern will look familiar to anyone who has coded in an object-oriented language like C++ or Java.

## Source documentation
The source code is heavily commented.  All files contain a descriptive header comment, all data structures are commented with their type and purpose, and all functions are commented with their expected behavior, parameters and return types.  The idea is to document openconstructor's intent so it can be updated and expanded over the years without introducing subtle lurking bugs.

## How to contribute
Contributions are most welcome.  There's a long way to go.
* [Fork and submit a pull request](http://blog.scottlowe.org/2015/01/27/using-fork-branch-git-workflow/)!
* If I know you from the old days of soda, and you promise not to screw anything up, I could probably be persuaded to add you as a full-fledged "collaborator" to the repo.  This might be more convenient for you if you want to make a lot of changes and don't want to wait for me to catch up!

# Credits
Of course, openconstructor could not have existed without [ed burton](http://web.archive.org/web/20100429234043/http://www.acmi.net.au/soda.htm), [soda creative ltd](http://soda.co.uk/) and their original (and incomparable) [sodaplay](https://web-beta.archive.org/web/20050213021801/http://www.sodaplay.com:80/index.htm).  Long live the spirit of creative play!

The code itself took a lot of ahem, "inspiration" from [DannickFox/phyzzy-js](https://github.com/DannickFox/phyzzy-js) and [cactorium/spring-crabs](https://github.com/cactorium/spring-crabs).  I would have gotten nowhere if I didn't have their working examples to dissect (and occasionally crib from).  Thanks guys!

# License
Do whatever you want!  See LICENSE for details.
