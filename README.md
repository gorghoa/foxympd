foxympd
=======

[![Build Status](https://travis-ci.org/gorghoa/foxympd.png?branch=master)](https://travis-ci.org/gorghoa/foxympd)

A mpd client for firefox os

Good to know Grunt tasks
========================

    grunt build

Prepare for device installation

    grunt watch
    
Watch scss, tpl and js files changes (both tests and src), then recompile css and run r.js optimizer

    grunt marketplace

Build and zip, ready for publication



Test the app
============

Install ffOS simulator, download the latest realeased archive, extract it, add the webapp.manifest to your simulator.


Build the app
=============

run grunt build, then upload the \_build dir to your FirefoxOS device.


Install in dev
==============

Prerequisites : 
---------------

#. FirefoxOS Simulator, node.js and npm must be available

install grunt :

    $ sudo npm install -g grunt-cli


Install dependencies :

    npm install


Release notes
=============

0.0.4

#. cover support (settingable)
#. add settings screen
#. add setting from screen locking

0.0.3
-----

#. prevent screen from beeing locked
#. add mpd connection error button




Licence
=======

FoxyMPD is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.

FoxyMPD is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with FoxyMPD.  If not, see <http://www.gnu.org/licenses/>.

Nonetheless, some libraries used by FoxyMPD are under custom licence, see files headers for details.

Credits
=======

Logo and development done by barosofts
