import iframeMessenger from 'guardian/iframe-messenger'
import mainHTML from './text/embed.html!text';

import { retrieveAVG } from './lib/loadData';
import { requestAnimationFrame, cancelAnimationFrame } from './lib/request-animation-frame-shim';

//var templateFn = doT.template(embedHTML);
//var $$ = (el, s) => [].slice.apply(el.querySelectorAll(s));

function app(el, config, doc, charts) {

	console.log(el)

    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

    let q=1,
        query=window.location.search.replace("?","").split("=");
    if(query[0]==="q") {
        q=+query[1];
        q=(isNaN(q)||q===0)?1:q;
    }

    let frameRequest = requestAnimationFrame(function checkInnerHTML(time) {
        //console.log(time)
        var b=document.querySelector("#NHSQuiz");
        if(b && b.getBoundingClientRect().height) {
            cancelAnimationFrame(checkInnerHTML);

            if(q) {
                //d3.select(el).classed("embed",true)
                iframeMessenger.enableAutoResize();
            }
            retrieveAVG(q);
            return; 
        }
        frameRequest = requestAnimationFrame(checkInnerHTML);
    });

    
}
;(function() {
    var throttle = function(type, name, obj) {
        var obj = obj || window;
        var running = false;
        var func = function() {
            if (running) { return; }
            running = true;
            requestAnimationFrame(() => {
                obj.dispatchEvent(new CustomEvent(name));
                running = false;
            });
        };
        obj.addEventListener(type, func);
    };

    //* init - you can init any event
    throttle ("resize", "optimizedResize");
})();
//window.init = (el, config) => loadData(app.bind(null, el, config));
window.init = function (el,config) {
	
	app(el,config);
}