import d3 from 'd3';
import Flow from '../components/Flow';

export function retrieveAVG(q) {
    let avgSrc="https://interactive.guim.co.uk/2016/01/nhs-quiz/averages-"+(q?"embed":"")+"nhs.json";

    d3.json(avgSrc, (json) => {
        //console.log("JSON",json)
        loadData(q,json);
    })

}
export function loadData(q,avg) {

    let data=[];
    let country_info={};

    let dataKey = "1PMgGCWZtZGctS_TynkMZxzzvtCbwr2rM8bEFxAgLdC8";

    if(q) {
        //http://interactive.guim.co.uk/docsdata-test/17diSfLk__ZaslGCKaXf4h6N7QW4WZ2wfRWsIWHP7G7A.json
        dataKey = "17diSfLk__ZaslGCKaXf4h6N7QW4WZ2wfRWsIWHP7G7A"; //load embeddable questions
    }

    let dataSrc = "https://interactive.guim.co.uk/docsdata/" + dataKey + ".json";

    d3.json(dataSrc, (json) => {
        let questions = json.sheets.Sheet1;
        //console.log(questions);
        if(q<1 || q>questions.length) {
            q=1;
        }
        //return d.answer.indexOf("-")<0
        new Flow([
            {
                country:"Others",
                questions:questions.filter((d,i)=>{
                    //return i<3;
                    if(typeof q === "number") {
                        return i===q-1;
                    }
                    return 1;
                }).map((d,i)=>{

                        let index=q || i;
                        
                        let q_avg=0,
                            range_mean=d3.mean([+d.min,+d.max]);

                        //if(typeof q === "number") {
                        q_avg=avg.find((a)=>(a.q===index));
                        //}
                        
                            

                        //console.log("AVGGGGG",avg,i,q_avg)

                        let answer=d.answer,
                            mean=q_avg?(q_avg.avg>100?Math.round(q_avg.avg):q_avg.avg):range_mean,
                            actual=+d.answer;


                        if(answer.indexOf("-")>-1) {
                            answer=answer.split("-").map((d)=>(+d));
                            actual=d3.mean(answer);
                        }

                        //console.log(d.answer,actual);
                        //console.log(d.min,d.max,mean)
                        return {
                            actual:actual,
                            answer:answer,
                            range:[+d.min,+d.max],
                            mean:mean,
                            "difference (mean-actual)": mean-actual,
                            question:i,
                            source:d.source,
                            units:d.symbol
                        }
                    }
                )
            }
        ],{
            country:"Others",
            container:"#NHSQuiz",
            embed:q,
            questions:questions
                        .filter((d,i)=>{
                            //return i<3;
                            if(typeof q === "number") {
                                return i===q-1;
                            }
                            return 1;
                        })
                        .map((d,i)=>{
                            return {
                                id:i,
                                index:i,
                                question:d.question,
                                text:d.explanation,
                                range:[+d.min,+d.max],
                                units:d.symbol,
                                source:d.source,
                                chart:d.chart,
                                chart_height:d.h
                            }
                        })
        })

    });

}
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};