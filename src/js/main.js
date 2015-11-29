import iframeMessenger from 'guardian/iframe-messenger'
import mainHTML from './text/main.html!text'
import questions from '../assets/data/questions.json!json';
import iso from '../assets/data/iso.json!json';
import d3 from 'd3'
import Flow from './components/Flow';

import { requestAnimationFrame, cancelAnimationFrame } from './lib/request-animation-frame-shim';

export function init(el, context, config, mediator) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

    let frameRequest = requestAnimationFrame(function checkInnerHTML(time) {
        //console.log(time)
        var b=document.querySelector("#perils");
        if(b && b.getBoundingClientRect().height) {
            cancelAnimationFrame(checkInnerHTML);
            loadData()
            return; 
        }
        frameRequest = requestAnimationFrame(checkInnerHTML);
    });

    function loadData() {


        let data=[];
        let country_info={};
        d3.csv(config.assetPath+"/assets/data/perils2.csv",(d)=>{
            return d;
        },(all_data)=>{

            console.log(all_data);

            all_data.forEach((d)=>{
                let __type=d.type.trim().toLowerCase(),
                    __question=d.question;

                d3.entries(d).filter((field)=>{
                    return field.key!=="question" && field.key!=="type"
                }).forEach((field)=>{

                    
                    var country=data.find((c)=>{
                        return c.country==field.key.trim()
                    });

                    if(country) {
                        var question=country.questions.find((q)=>{
                            return q.question==__question;
                        });
                        if(question) {
                            question[__type]=isNaN(+field.value)?field.value:+field.value;
                        } else {
                            let quest={
                                question:__question
                            }
                            if(field.value==="") {
                                field.value="--"
                            }
                            quest[__type]=(isNaN(+field.value))?field.value:+field.value;
                            country.questions.push(quest);

                        }
                        //country[__type]=isNaN(+field.value)?field.value:+field.value;
                        country.questions.sort((a,b)=>{
                            return +a.question - +b.question;
                        })
                    } else {
                        let record={
                            questions:[],
                            country:field.key.trim()
                        };
                        let quest={
                            question:__question
                        }
                        quest[__type]=isNaN(+field.value)?field.value:+field.value;
                        record.questions.push(quest);
                        data.push(record);

                        country_info[record.country]=iso.find((d)=>{
                            return d.name === record.country || d.name2===record.country;
                        });
                    }



                    
                })
            })
            
            //console.log(country_info)

            let ranking=data.map((d)=>{
                return {
                    country:d.country,
                    avg:d3.mean(d.questions,(d)=>Math.abs(d["difference (mean-actual)"]))
                }
            })
            //console.log(ranking)

           // return;

            new Flow(data,{
                container:"#perils",
                //questions_data:questions_data,
                questions:questions.sort((a,b)=>(a.index-b.index)),
                country_info:country_info,
                ranking:ranking
            })
        })
    }
        
}

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
  this.parentNode.appendChild(this);
  });
};
