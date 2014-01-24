/*!
OC-Utils 0.1.0
http://www.orlandocastillo.com
(c) 2014 Orlando Castillo
This may be freely distributed under the MIT license.
*/

var oc = oc || {};

oc.Ajax = (function() {

    'use strict';

    // Handles ajax requests.
    // args parameter must include:
    // url (string) (Required): url to query
    // type (string) (Default "GET"): Query type
    // async (bool) (Default true): Choose asynchronous or synchronous
    // success (function): Callback if request receives status 200
    // error (function): Callback if request fails
    // loading (function): Callback while responseText is loading
    // data (object): Key/value query parameters
    // cache (bool): Set to false to prevent caching

    // EXAMPLE USAGE:
    // oc.Ajax({
    //     url: 'http://api.openweathermap.org/data/2.5/weather', 
    //     data:{q: 'austin,tx'} 
    // });

    function _parseResponse(httpRequest) {
        var content_type = httpRequest.getResponseHeader('content-type');
        if(content_type.match('application/json')) {
            return JSON.parse(httpRequest.responseText);
        } else if(content_type.match('text/xml')) {
            return httpRequest.responseXML;
        }

        return httpRequest.responseText;
    }


    return function(args) {

        if(typeof args !== 'object') {
            throw new Error('Expecting object as a parameter');
        }

        if(!args.url || (args.url && typeof args.url !== 'string')) {
            throw new Error('url is required parameter (string)');
        }

        if(args.data && typeof args.data !== 'object') {
            throw new Error('Expecting object for data parameter');
        }

        var httpRequest;
        var encoded_data = '';
        var type = args.type || 'GET';
        var url = args.url;
        var async = args.async || true;
        var success = args.success || false;
        var error = args.error || false;
        var loading = args.loading || false;
        var data = args.data || {};
        var cache = (typeof args.cache === 'undefined') ? true : args.cache;

        if (window.XMLHttpRequest) {
            httpRequest = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {}
            }
        }

        if (!httpRequest) {
            throw new Error('Unable to create an XMLHTTP instance');
        }

        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4) {
                if (httpRequest.status === 200) {
                    var data = _parseResponse(httpRequest);
                    if(success) {
                        success(data, httpRequest.statusText, httpRequest);
                    }
                } else {
                    if(error) {
                        error(httpRequest, httpRequest.status, httpRequest.statusText);
                    }
                }
            } else if (httpRequest.readyState === 3 && loading) {
                loading();
            }
        };

        if(!cache) {
            data['_'] = new Date().getTime();
        }

        for(var key in data) {
            if(encoded_data !== '') {
                encoded_data += '&';
            }
            encoded_data += key + '=' + encodeURIComponent(data[key]);
        }

        if(type === 'GET' && encoded_data.length) {
            var q = (url.match(/\?/)) ? '&' : '?';
            url += q + encoded_data;
        }
        
        httpRequest.open(type, url, async);

        if(type === 'POST') {
            httpRequest.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        }

        httpRequest.send(encoded_data);
    }

})();
