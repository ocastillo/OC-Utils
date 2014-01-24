'use strict';

var app = app || {};

(function () {

    // Start it up!
    document.addEventListener('DOMContentLoaded', function() {
        oc.Router.start({
            not_found: function() { app.showMessage('Not found.'); },
            root: '/app',
            routes: {
                'weather/:city/:state': app.getWeather,
                'users/:id/article/:article': function(id, article_id) { app.showMessage('User ' + id + ', Article ' + article_id); },
                'users/:id/edit': function(id) { app.showMessage('Editing ' + id); },
                'users/:id': function(id) { app.showMessage('The id is ' + id); },
                'testroute': function() { app.showMessage('Test Route'); },
                '/': function() { app.showMessage('default route'); }
            }
        });

        // weather demo
        document.querySelector('#weather-form').addEventListener('submit', app.getWeatherForm);
    });


    // Your contollers, views, whatever...
    app.showMessage = function(msg, is_html) {
        if(is_html) {
            document.getElementById('message-box').innerHTML = msg;
        } else {
            document.getElementById('message-box').innerText = msg;
        }
    }


    app.getWeatherForm = function(Event) {
        Event.preventDefault();
        var city = document.querySelector('#city').value;
        var state = document.querySelector('#state').value;
        app.getWeather(city, state);
    }


    app.getWeather = function(city, state) {

        // Using some underscore.js here...
        var template = '<ul>\
            <% for(var i in data) { %>\
            <li><%= i %>\
                <% if(typeof data[i] === \'object\') { %>\
                    <%= render({data: data[i], render: render}) %>\
                <% } else { %>\
                    = <%= data[i] %>\
                <% } %>\
            </li>\
            <% } %>\
        </ul>';

        oc.Ajax({
            url: 'http://api.openweathermap.org/data/2.5/weather',
            data: {q: city + ',' + state},
            success: function(data) {
                var compiled = _.template(template);
                var html = compiled({data: data, render: compiled});
                app.showMessage(html, true);
            },
            loading: function() {
                document.getElementById('message-box').innerText = 'loading...';
            },
            error: function() {
                document.getElementById('message-box').innerText = 'There was an error.';
            }
        });
    }

})();
