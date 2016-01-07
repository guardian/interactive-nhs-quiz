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
		
		//console.log("BUILD RANKING",this.user)


		let avg={
				country:"YOU",
				avg:d3.mean(this.user.questions,(d)=>Math.abs(d.mean-d.actual)),
				adj:this.user.questions.map((q)=>{
	                let question=this.options.questions.find((qq)=>{
	                	//console.log(q,qq)
	                    return (qq.id===q.question.id);
	                });
	                if(question) {
	                	//console.log(question)
	                    let accuracy_score=(Math.abs(q.mean-q.actual)),
	                        Pm = (q.mean+q.actual)/2,
	                        sdm = Math.sqrt(Pm * (100-Pm)),
	                        sd50 = 50,
	                        st_acc_score = accuracy_score * (sd50 / sdm);
	                    if(question.range) {
	                        st_acc_score=accuracy_score;
	                    }
	                    
	                    return st_acc_score;
	                }
	                return 0;
	            })
			};

		//console.log(avg)
		/*let ranking=this.options.ranking.concat([
			{
				country:"YOU",
				adj:Math.round(d3.sum(avg.adj)*(122/171.85))
			}
		]);*/



		d3.select("#ranking")
			.classed("hidden",false)
			
			/*.select("ul")
			.selectAll("li")
				.data(ranking.sort((a,b)=>(a.adj-b.adj)))
				.enter()
				.append("li")
					.attr("class",(d)=>{
						return d.country;//this._getCountryArea(d.country);
					})
					.classed("you",(d)=>d.country==="YOU")
					.classed("selected",(d)=>d.country===this.options.country)
					.html((d,i)=>("<span>"+(i<9?"0":"")+(i+1)+".</span> "+d.country))*/

		/*this._buildShare(ranking.filter((c)=>{
			return c.country==="YOU" || c.country===this.options.country
		}));*/
		this._buildShare([
			{
				country:"YOU",
				adj:Math.round(d3.sum(avg.adj)*(122/171.85))
			},
			{
				country:"UK",
				adj:Math.round(d3.sum(avg.adj)*(122/171.85))	
			}
		])
	}
	_buildShare(values) {
		//console.log("_buildShare",values)

		let you=values.find((d)=>d.country==="YOU"),
			country=values.find((d)=>d.country===this.options.country);

		let diff="---";

		let tweets=([
			"I know [Country] better than people in [Country]! How well do you know your country? Take the quiz ",
			"I don't know [Country] as well as people in [Country] :( How well do you know your country? Take the quiz ",
			"I know [Country] just as well as people in [Country]. How well do you know your country? Take the quiz ",
			"How well do you really know the NHS? Take the quiz"
		])

		if(country && country.adj) {
			diff=country.adj/you.adj;
			let the_country=country.country;
			if(the_country==="UK" || the_country==="United States" || the_country==="Netherlands") {
				the_country="the "+the_country
			}
			tweets=tweets.map((d)=>{
				return d.replace(/\[Country\]/gi,the_country)
			})
		}

		

		

		//console.log(country,"/",you,diff)

		let tweet=tweets[2];

		if(diff==="---") {
			tweet=tweets[3]
		}

		if(diff>1.4) {
			tweet=tweets[0]
		}

		if(diff<0.6) {
			tweet=tweets[1]
		}

		d3.select(".share")
			.select("p")
				.text(tweet);
		let url="http://www.theguardian.com/world/ng-interactive/2015/dec/02/how-well-do-you-really-know-your-country-take-our-quiz";
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