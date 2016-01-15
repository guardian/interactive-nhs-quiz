import ParallelCoordinates from './ParallelCoordinates';
import { share } from '../lib/share';

export default function Flow(data,options) {
	
	var self=this;

	this.name="FLOW";

	this.data=data;
	this.options=options;

	let search=window.location.search.replace(/\?/gi,""),
		rankings=[];

	this.COUNTRY=this.options.country;
	
	//console.log(data)
	//console.log(options)
	
	this.user={
		questions:[
		]
	};

	
	
	//console.log(this)
	

	this._buildCharts=function(index,info) {
		let self=this;

		

		index++;
		//console.log("_buildCharts",index)
		this.currentQuestion=index;

		if(!this.currentQuestion) {
			
			this.options.questions=this.options.questions.filter((d,i)=>{
						//console.log(d,this.data,this.options.country)
						let dd=this.data.find((c)=>c.country===this.options.country),
							qq=dd.questions.find((q)=>q.question===d.id);
						////console.log(qq)

						return !isNaN(qq.mean);

						return 1;
						return d==="1";
			}).sort((a,b)=>{
					return a.index-b.index
				})


			this.options.question=this.options.questions[index].id;
			this.options.nextCallback=function(d,info){
				self._buildCharts(d,info)
			};

			////console.log("1 currentQuestion",this.options.question.id)

			this.pc=new ParallelCoordinates(this.data,this.options);
		} else {
			
			//console.log(index,this.options.questions.length)
			info["difference (mean-actual)"]=info.mean-info.actual;
			//console.log("INFOOOOO",info)
			this.user.questions.push(info);
			//console.log("USER USER USER",this.user)
			////console.log("2 currentQuestion",this.options)

			//console.log(this.options.questions)

			if(index<this.options.questions.length){// && index < 2){

				this.options.question=this.options.questions[index].id;
				//console.log(this.options)
				this.pc.nextQuestion(this.options.question);
			} else {
				//console.log("DONE!!!! USER USER USER",this.user,this.options.embed)
				let obj={
					answers:{
						country:"NHS",
						q:this.user.questions.map((d,i)=>{
							return {
								q:this.options.embed || i,
								v:d.mean
							}
						})
					}
				};
				

				if(!this.options.embed) {
					this._buildRanking();	
				}
				
				//console.log(obj.answers.q)
				let q={answers:obj.answers.q};
				console.log(JSON.stringify(q))
				//console.log("REMIND TO ACTIVATE XHR")
				//return;
				
				//https://interactive.guardianapis.com/quiz/?key=nhs
				d3.xhr("https://interactive.guardianapis.com/quiz/?key="+(this.options.embed?"embednhs":"nhs"))
					.header("Content-Type", "application/json")
					.post(JSON.stringify(q),function(error,data){
						//console.log("SEND!")
					})
				
			}
			
		}
		
	}

	this._buildCharts(-1);

	

	

	this._buildRanking=function(){
		
		//console.log("BUILD RANKING",this.user)


		let avg={
				country:"YOU",
				diff_perc:this.user.questions.map((q)=>{
					let perc_mean=(q.mean-q.question.range[0])/(q.question.range[1]-q.question.range[0]),
						perc_actual=(q.actual-q.question.range[0])/(q.question.range[1]-q.question.range[0]),
						perc_diff=Math.abs(perc_mean-perc_actual);
					return perc_diff;
				})
			};
		let other_avg={
			country:this.data[0].country,
			diff_perc:this.data[0].questions.map((q)=>{
				let perc_mean=(q.mean-q.range[0])/(q.range[1]-q.range[0]),
					perc_actual=(q.actual-q.range[0])/(q.range[1]-q.range[0]),
					perc_diff=Math.abs(perc_mean-perc_actual);
				return perc_diff;
			})
		}
		avg.mean_diff_perc=d3.mean(avg.diff_perc);
		other_avg.mean_diff_perc=d3.mean(other_avg.diff_perc);

		
		

		avg.you_others_diff=(avg.mean_diff_perc-other_avg.mean_diff_perc);

		avg.you_other=0; //default worse
		if(Math.abs(avg.you_others_diff)<=0.05) { // -+ %5 similar
			avg.you_other=1;
		}
		if(avg.you_others_diff<-0.05) { // <-5% better
			avg.you_other=2;
		}

		avg.you_actual=0; //default bad
		if(avg.mean_diff_perc<=0.5) {
			avg.you_actual=1;
		}
		if(avg.mean_diff_perc<=0.2) {
			avg.you_actual=2;
		}

		//console.log(avg,other_avg)

		d3.select("#ranking")
			.classed("hidden",false)
			
			
		this._buildShare(avg)
	}
	this._buildShare=function(avg) {

		//console.log(avg)

		let you_others=[
			"Compared to other Guardian readers you fared worse than most people.",
			"Compared to other Guardian readers you were about as correct as most people.",
			"Compared to other Guardian readers you answered better than most."
			
		];
		let you_actual=[
			"Well, it seems you don't know too much about the NHS.",
			"Good job, it seems you know some things about the NHS.",
			"Congratulations, you know a lot about the NHS!"
		]
		let tweets=[
			"It seems I don't know too much about the NHS",
			"It seems I know some things about the NHS",
			"I know a lot about the NHS"
		]
		let tweet=tweets[avg.you_actual]+". How well do you really know the NHS? Take the quiz";
		d3.select("#ranking p")
			.html(you_actual[avg.you_actual]+"<br/>"+you_others[avg.you_other])

		d3.select(".share")
			.select("p")
				.html(tweet);

		//let url="http://www.theguardian.com/world/ng-interactive/2015/dec/02/how-well-do-you-really-know-your-country-take-our-quiz";
		let url="http://gu.com/p/4ftjf";//window.location;
		let shareLink=share(tweet,url,"");

		d3.select(".share")
			.selectAll("button.interactive-share")
			.on("click",function(){
				let _this=d3.select(this),
					network=_this.attr("data-network");
				shareLink(network)
			})
	}
	
	
}