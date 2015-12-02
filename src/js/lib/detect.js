
/*
    Module: detect/detect.js
	
	Original: https://github.com/guardian/frontend/blob/master/static/src/javascripts/projects/common/utils/detect.js
	
    Description: Used to detect various characteristics of the current browsing environment.
                 layout mode, connection speed, battery level, etc...
*/
/* jshint ignore:start */


var supportsPushState,
    getUserAgent,
    pageVisibility = document.visibilityState ||
                     document.webkitVisibilityState ||
                     document.mozVisibilityState ||
                     document.msVisibilityState ||
                     'visible',
    detect;

/**
 * @param performance - Object allows passing in of window.performance, for testing
 */
function getPageSpeed(performance) {

    //https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html#sec-window.performance-attribute

    var startTime,
        endTime,
        totalTime,
        perf = performance || window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;

    if (perf && perf.timing) {
        startTime =  perf.timing.requestStart || perf.timing.fetchStart || perf.timing.navigationStart;
        endTime = perf.timing.responseEnd;

        if (startTime && endTime) {
            totalTime = endTime - startTime;
        }
    }

    return totalTime;
}

function isReload() {
    var perf = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
    if (!!perf && !!perf.navigation) {
        return perf.navigation.type === perf.navigation.TYPE_RELOAD;
    } else {
        // We have no way of knowing if it was a reload on unsupported browsers.
        // I figure we could only possibly want to treat it as false in that case.
        return false;
    }
}

function isIOS() {
    return /(iPad|iPhone|iPod touch)/i.test(navigator.userAgent);
}

function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

function isFireFoxOSApp() {
    return navigator.mozApps && !window.locationbar.visible;
}

function isFacebookApp() {
    return navigator.userAgent.indexOf('FBAN/') > -1;
}

function isTwitterApp() {
    // NB Android app is indistinguishable from Chrome:
    // http://mobiforge.com/research-analysis/webviews-and-user-agent-strings
    return navigator.userAgent.indexOf('Twitter for iPhone') > -1;
}

function isTwitterReferral() {
    return /\.t\.co/.test(document.referrer);
}

function isFacebookReferral() {
    return /\.facebook\.com/.test(document.referrer);
}

function socialContext() {
    var override = /socialContext=(facebook|twitter)/.exec(window.location.hash);

    if (override !== null) {
        return override[1];
    } else if (isFacebookApp() || isFacebookReferral()) {
        return 'facebook';
    } else if (isTwitterApp() || isTwitterReferral()) {
        return 'twitter';
    } else {
        return null;
    }
}

getUserAgent = (function () {
    var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem =  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR\/(\d+)/);
        if (tem !== null) { return 'Opera ' + tem[1]; }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) !== null) { M.splice(1, 1, tem[1]); }
    return {
        browser: M[0],
        version: M[1]
    };
})();

function getConnectionSpeed(performance, connection, reportUnknown) {

    connection = connection || navigator.connection || navigator.mozConnection || navigator.webkitConnection || {type: 'unknown'};

    var isMobileNetwork = connection.type === 3 // connection.CELL_2G
            || connection.type === 4 // connection.CELL_3G
            || /^[23]g$/.test(connection.type), // string value in new spec
        loadTime,
        speed;

    if (isMobileNetwork) {
        return 'low';
    }

    loadTime = getPageSpeed(performance);

    // Assume high speed for non supporting browsers
    speed = 'high';
    if (reportUnknown) {
        speed = 'unknown';
    }

    if (loadTime) {
        if (loadTime > 1000) { // One second
            speed = 'medium';
            if (loadTime > 3000) { // Three seconds
                speed = 'low';
            }
        }
    }

    return speed;

}
export function detectIE() {
  var ua = window.navigator.userAgent;

  // test values
  // IE 10
  //ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
  // IE 11
  //ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
  // IE 12 / Spartan
  //ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // IE 12 => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }

  // other browser
  return false;
}
function getFontFormatSupport(ua) {
    ua = ua.toLowerCase();
    var browserSupportsWoff2 = false,
        // for now only Chrome 36+ supports WOFF 2.0.
        // Opera/Chromium also support it but their share on theguardian.com is around 0.5%
        woff2browsers = /Chrome\/([0-9]+)/i,
        chromeVersion;

    if (woff2browsers.test(ua)) {
        chromeVersion = parseInt(woff2browsers.exec(ua)[1], 10);

        if (chromeVersion >= 36) {
            browserSupportsWoff2 = true;
        }
    }

    if (browserSupportsWoff2) {
        return 'woff2';
    }

    if (ua.indexOf('android') > -1) {
        return 'ttf';
    }

    return 'woff';
}

export function hasTouchScreen2() {
    return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
}
export function hasTouchScreen() {
  return !!('ontouchstart' in window) // works on most browsers 
      || !!('onmsgesturechange' in window); // works on ie10
};

function hasPushStateSupport() {
    if (supportsPushState !== undefined) {
        return supportsPushState;
    }
    if (window.history && history.pushState) {
        supportsPushState = true;
        // Android stock browser lies about its HistoryAPI support.
        if (window.navigator.userAgent.match(/Android/i)) {
            supportsPushState = !!window.navigator.userAgent.match(/(Chrome|Firefox)/i);
        }
    }
    return supportsPushState;
}

function getVideoFormatSupport() {
    //https://github.com/Modernizr/Modernizr/blob/master/feature-detects/video.js
    var elem = document.createElement('video'),
        types = {};

    try {
        if (elem.canPlayType) {
            types.mp4 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/, '');
            types.ogg = elem.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, '');
            types.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '');
        }
    } catch (e) {/**/}

    return types;
}

function getOrientation() {
    return (window.innerHeight > window.innerWidth) ? 'portrait' : 'landscape';
}

export function getViewport() {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0];

    return {
        width:  w.innerWidth  || e.clientWidth  || g.clientWidth,
        height: w.innerHeight || e.clientHeight || g.clientHeight
    };
}


// Page Visibility
function initPageVisibility() {
    // Taken from http://stackoverflow.com/a/1060034
    var hidden = 'hidden';

    function onchange(evt) {
        var v = 'visible',
            h = 'hidden',
            evtMap = {
                focus: v,
                focusin: v,
                pageshow: v,
                blur: h,
                focusout: h,
                pagehide: h
            };

        evt = evt || window.event;
        if (evt.type in evtMap) {
            pageVisibility = evtMap[evt.type];
        } else {
            pageVisibility = this[hidden] ? 'hidden' : 'visible';
        }

    }

    // Standards:
    if (hidden in document) {
        document.addEventListener('visibilitychange', onchange);
    } else if ((hidden = 'mozHidden') in document) {
        document.addEventListener('mozvisibilitychange', onchange);
    } else if ((hidden = 'webkitHidden') in document) {
        document.addEventListener('webkitvisibilitychange', onchange);
    } else if ((hidden = 'msHidden') in document) {
        document.addEventListener('msvisibilitychange', onchange);
    } else if ('onfocusin' in document) { // IE 9 and lower:
        document.onfocusin = document.onfocusout = onchange;
    } else { // All others:
        window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
    }
}

function pageVisible() {
    return pageVisibility === 'visible';
}

function hasWebSocket() {
    return 'WebSocket' in window;
}

// Determine if what type of font-hinting we want.
// Duplicated in /common/app/views/fragments/javaScriptLaterSteps.scala.html
function fontHinting() {
    var ua = navigator.userAgent,
        windowsNT = /Windows NT (\d\.\d+)/.exec(ua),
        hinting = 'Off',
        version;

    if (windowsNT) {
        version = parseFloat(windowsNT[1], 10);
        // For Windows XP-7
        if (version >= 5.1 && version <= 6.1) {
            if (/Chrome/.exec(ua) && version < 6.0) {
                // Chrome on windows XP wants auto-hinting
                hinting = 'Auto';
            } else {
                // All others use cleartype
                hinting = 'Cleartype';
            }
        }
    }
    return hinting;
}


/*
module.exports = {
    getConnectionSpeed: getConnectionSpeed,
    getFontFormatSupport: getFontFormatSupport,
    getVideoFormatSupport: getVideoFormatSupport,
    hasTouchScreen: hasTouchScreen,
    hasPushStateSupport: hasPushStateSupport,
    getOrientation: getOrientation,
    getViewport: getViewport,
    getUserAgent: getUserAgent,
    isIOS: isIOS,
    isAndroid: isAndroid,
    isFireFoxOSApp: isFireFoxOSApp,
    isFacebookApp: isFacebookApp,
    isTwitterApp: isTwitterApp,
    isFacebookReferral: isFacebookReferral,
    isTwitterReferral: isTwitterReferral,
    socialContext: socialContext,
    isReload:  isReload,
    initPageVisibility: initPageVisibility,
    pageVisible: pageVisible,
    hasWebSocket: hasWebSocket,
    getPageSpeed: getPageSpeed,
    fontHinting: fontHinting()
};
*/