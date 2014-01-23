/*!
OC-Utils 0.1.0
http://www.orlandocastillo.com
(c) 2014 Orlando Castillo
This may be freely distributed under the MIT license.
*/

var oc = oc || {};

oc.Router = (function() {

    'use strict';

    // Creates a router for your single page application.
    // This does not use url hashes.  For older browsers, the page will simply reload.
    // args parameter must include:
    // routes (object) - routes and their callbacks
    // root (string) (optional) - root of your application if not '/'
    // not_found (string or function) (optional) - location or callback if route is not found

    // EXAMPLE USAGE
    // <a href="/app/users/1">User 1</a>
    // oc.Router.start({
    //     not_found: function() { console.log('Page not found.'); },
    //     root: '/app',
    //     routes: {
    //           'users/:id': function(id) { console.log('User id is ' + id); }
    //     }
    // });

    var _push_state = (typeof window.history.pushState === 'undefined') ? false : true;
    var _compiled_routes = [];
    var _routes,
        _root,
        _not_found,
        _running;

    function _cleanRoute(route_str) {
        return route_str.replace(/^\/|\#\/|\#/, '');
    }

    function _applyRoute(path) {
        path = _cleanRoute(path);
        for(var i in _compiled_routes) {
            var cr = _compiled_routes[i];
            var re = cr.route;
            var params = re.exec(path);
            if(params && params.length) {
                params.shift();
                cr.callback.apply(this, params);
                return params;
            }
        }
        
        if(_not_found && typeof _not_found === 'string') {
            return window.location = _not_found;
        } else if (_not_found && typeof _not_found === 'function') {
            return _not_found();
        }

        throw new Error('That route does not exist');
    }

    function _clickHandler(Event) {
        if(Event.target.tagName.toLowerCase() === 'a') {
            Event.preventDefault();
            var href = Event.target.href;
            var new_path = href.replace(_root, '');
            var split_path = new_path.split('#');
            var route_params = _applyRoute(split_path[0]);

            history.pushState(route_params, Event.target.textContent, href);
        }
    }

    function _popstateHandler(Event) {
        if(Event.state && Event.state.input) {
            _applyRoute(Event.state.input);
        }
        Event.preventDefault();
    }

    return {
        start: function(args) {

            if(_running) {
                throw new Error('The router is already started.');
            }

            if(typeof args !== 'object') {
                throw new Error('Expecting object as a parameter');
            }

            if(!args.routes) {
                throw new Error('Please specify one or more routes');
            }

            _running = true;
            _routes = args.routes;
            _not_found = args.not_found || false;
            _root = args.root || '';
            _root = window.location.origin + _root;

            for(var i in _routes) {
                var route = _cleanRoute(i);
                var param_pattern = /\:([a-zA-Z.]+)/ig;
                var route = route.replace(param_pattern, '([^\/]+)');
                var re = new RegExp('^' + route + '$');
                _compiled_routes.push({'route': re, 'callback': _routes[i]});
            }

            var init_path = window.location.href.replace(_root, '');

            if(_push_state) {
                document.addEventListener('click', _clickHandler);
                window.addEventListener('popstate', _popstateHandler);
            } 

            var route_params = _applyRoute(init_path);

            if(_push_state) {
                history.replaceState(route_params, document.title, document.location.href);
            }
        },

        stop: function() {
            document.removeEventListener('click', _clickHandler);
            window.removeEventListener('popstate', _popstateHandler);
            _running = null;
        }
    }

})();
