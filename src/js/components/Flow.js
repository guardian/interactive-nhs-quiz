import ParallelCoordinates from './ParallelCoordinates';
import { share } from '../lib/share';

export default class Flow {
	constructor(data,options) {

		this.name="FLOW";

		this.data=data;
		this.options=options;

		let search=window.location.search.replace(/\?/gi,""),
			rankings=[];

		this.COUNTRY=this.options.country;
		
		console.log(data)
		console.log(options)

		//this._buildCountrySelector();
		//this._buildRestartCountrySelector();
		
		this.user={
			questions:[
			]
		};

		this._buildCharts(-1);

		//this.currentQuestion=-1;
		//new ParallelCoordinates(this.data,this.options)

	}

	_buildCharts(index,info) {
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
				console.log("DONE!!!! USER USER USER",this.user)
				let obj={
					answers:{
						country:this.user.country,
						q:this.user.questions.map((d)=>d.mean)
					}
				};
				//console.log(obj)

				this._buildRanking();
				
				console.log("REMIND TO ACTIVATE XHR")
				//return;
				/*d3.xhr("http://ec2-54-72-6-69.eu-west-1.compute.amazonaws.com/")
					.header("Content-Type", "application/json")
					.post(JSON.stringify(obj),function(error,data){
						////console.log("SEND!")
					})*/
			}
			
		}
		
	}

	_buildCountrySelector() {
		let self=this;
		let confirm_button=d3.select("button#confirmCountry")
										.classed("disabled",typeof this.COUNTRY === "undefined")
										.on("click",function(){
											d3.event.preventDefault();
											if(self.COUNTRY) {
												//console.log(self.COUNTRY)

												self.user.country=self.COUNTRY;

												d3.select("#countrySelector").attr("disabled",true);
												d3.select(this).attr("disabled",true).classed("disabled",true)

												self._buildCharts(-1);
											}
											
											
										})

		let countries=d3.select("#countrySelector")
						.on("change",function(d){
							////console.log()
							self.COUNTRY=this.options[this.selectedIndex].value;
							self.options.country=self.COUNTRY;

							confirm_button.classed("disabled",false)

						})
						.selectAll("option")
						.data(this.data.map((d)=>d.country).sort((a,b)=>{
							if(a < b) return -1;
						    if(a > b) return 1;
						    return 0;
						}))
						.enter()
						.append("option")
							.attr("value",(d)=>d)
							.text((d)=>d)
							.each(function(d){
								let search=window.location.search.replace(/\?/gi,"").toLowerCase();
								if(d.toLowerCase()===search) {
									d3.select(this).attr("selected","selected")
								}
							})

	}

	_buildRestartCountrySelector() {
		let self=this;
		let COUNTRY="";
		let confirm_button=d3.select("button#restartCountry")
										.on("click",function(){
											d3.event.preventDefault();
											//console.log(window.location)
											if(COUNTRY) {
												//console.log(window.location.origin+window.location.pathname+"?"+COUNTRY)

												let url=window.location.origin+window.location.pathname+"?"+COUNTRY;


												window.location=url;	
											}
											
											
										})

		let countries=d3.select("#restartCountrySelector")
						.on("change",function(d){
							////console.log()
							COUNTRY=this.options[this.selectedIndex].value;
							

							confirm_button.classed("disabled",false)

						})
						.selectAll("option")
						.data(this.data.map((d)=>d.country).sort((a,b)=>{
							if(a < b) return -1;
						    if(a > b) return 1;
						    return 0;
						}))
						.enter()
						.append("option")
							.attr("value",(d)=>d)
							.text((d)=>d)

	}

	_buildRanking(){
		
		console.log("BUILD RANKING",this.user)


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

		console.log(avg,other_avg)

		d3.select("#ranking")
			.classed("hidden",false)
			
			
		this._buildShare(avg)
	}
	_buildShare(avg) {

		console.log(avg)

		let you_others=[
			"Compared to other Guardian readers you answered better than most.",
			"Compared to other Guardian readers you were about as correct as most people.",
			"Compared to other Guardian readers you fared worse than most people."
		];
		let you_actual=[
			"Well, it seems you don't know too much about the NHS.",
			"Good job, it seems you know some things about the NHS.",
			"Congratulations, you know a lot about the NHS!"
		]
		let tweets=[
			"It seems I don't know too much about the NHS",
			"It seems I know some things about the NHS",
			"I know a lot about the NHS!"
		]
		let tweet=tweets[avg.you_other]+". How well do you really know the NHS? Take the quiz";
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
	
	_getCountryArea(country) {

		if(country==="YOU") {
			return "you";
		}

		let region_codes={
			"002":"africa",
			"019":"americas",
			"142":"asia",
			"150":"europe",
			"009":"oceania"
		}
		let sub_region_codes={
			"021":"namerica",
			"005":"samerica",
			"013":"samerica"
		}
		////console.log(country)
		////console.log(region_codes[this.options.country_info[country]["region-code"]])

		if(sub_region_codes[this.options.country_info[country]["sub-region-code"]]) {
			return sub_region_codes[this.options.country_info[country]["sub-region-code"]]
		}
		
		return region_codes[this.options.country_info[country]["region-code"]]
	}
}