import ParallelCoordinates from './ParallelCoordinates';
export default class Flow {
	constructor(data,options) {

		this.name="FLOW";

		this.data=data;
		this.options=options;

		let search=window.location.search.replace(/\?/gi,""),
			rankings=this.options.ranking.map((d)=>d.country);

		//console.log(search,rankings)
		this.COUNTRY=rankings.find((d)=>{
			return d.toLowerCase() == search.toLowerCase();
		});
		this.options.country=this.COUNTRY;
		//alert(this.COUNTRY)

		this._buildCountrySelector();
		this._buildRestartCountrySelector();
		
		this.user={
			questions:[
			]
		};

		//this.currentQuestion=-1;
		//new ParallelCoordinates(this.data,this.options)

	}

	_buildCharts(index,info) {
		let self=this;

		console.log("_buildCharts",index)

		index++;
		this.currentQuestion=index;

		if(!this.currentQuestion) {
			
			this.options.question=this.options.questions[index].id;
			this.options.nextCallback=function(d,info){
				self._buildCharts(d,info)
			};

			//console.log("1 currentQuestion",this.options.question.id)

			this.pc=new ParallelCoordinates(this.data,this.options);
		} else {
			
			console.log(index,this.options.questions.length)
			info["difference (mean-actual)"]=info.mean-info.actual;
			console.log("INFOOOOO",info)
			this.user.questions.push(info);
			console.log("USER USER USER",this.user)
			//console.log("2 currentQuestion",this.options)
			if(index<this.options.questions.length){// && index < 2){

				this.options.question=this.options.questions[index].id;
				console.log(this.options)
				this.pc.nextQuestion(this.options.question);	
			} else {
				console.log("DONE!!!! USER USER USER",this.user)
				let obj={
					answers:{
						country:this.user.country,
						q:this.user.questions.map((d)=>d.mean)
					}
				};
				console.log(obj)

				this._buildRanking();
				console.log("REMIND TO ACTIVATE XHR")
				return;
				d3.xhr("http://ec2-54-72-6-69.eu-west-1.compute.amazonaws.com/")
					.header("Content-Type", "application/json")
					.post(JSON.stringify(obj),function(error,data){
						//console.log("SEND!")
					})
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
												console.log(self.COUNTRY)

												self.user.country=self.COUNTRY;

												d3.select("#countrySelector").attr("disabled",true);
												d3.select(this).attr("disabled",true).classed("disabled",true)

												self._buildCharts(-1);
											}
											
											
										})

		let countries=d3.select("#countrySelector")
						.on("change",function(d){
							//console.log()
							self.COUNTRY=this.options[this.selectedIndex].value;
							self.options.country=self.COUNTRY;

							confirm_button.classed("disabled",false)

						})
						.selectAll("option")
						.data(this.data.map((d)=>d.country))
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
											console.log(window.location)
											if(COUNTRY) {
												console.log(window.location.origin+window.location.pathname+"?"+COUNTRY)

												let url=window.location.origin+window.location.pathname+"?"+COUNTRY;


												window.location=url;	
											}
											
											
										})

		let countries=d3.select("#restartCountrySelector")
						.on("change",function(d){
							//console.log()
							COUNTRY=this.options[this.selectedIndex].value;
							

							confirm_button.classed("disabled",false)

						})
						.selectAll("option")
						.data(this.data.map((d)=>d.country))
						.enter()
						.append("option")
							.attr("value",(d)=>d)
							.text((d)=>d)

	}

	_buildRanking(){
		


		let avg={
				country:"YOU",
				avg:d3.mean(this.user.questions,(d)=>Math.abs(d.mean-d.actual)),
				standardized:d3.mean(this.user.questions,(q)=>{
	                let question=this.options.questions.find((qq)=>{
	                    return (qq.id===q.question);
	                });
	                if(question) {
	                    let accuracy_score=(Math.abs(q.mean-q.actual)),
	                        Pm = (q.mean+q.actual)/2,
	                        sdm = Math.sqrt(Pm * (100-Pm)),
	                        sd50 = 50,
	                        st_acc_score = accuracy_score * (sd50 / sdm);
	                    if(question.range) {
	                        st_acc_score=accuracy_score;
	                    }
	                    
	                    return accuracy_score;
	                }
	                return 0;
	            })
			},
			ranking=this.options.ranking.concat([avg]);



		d3.select("#ranking")
			.classed("hidden",false)
			.select("ul")
			.selectAll("li")
				.data(ranking.sort((a,b)=>(a.standardized-b.standardized)))
				.enter()
				.append("li")
					.attr("class",(d)=>{
						return this._getCountryArea(d.country);
					})
					.classed("you",(d)=>d.country==="YOU")
					.classed("selected",(d)=>d.country===this.options.country)
					.html((d,i)=>("<span>"+(i<10?"0":"")+(i+1)+".</span> "+d.country))
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
		//console.log(country)
		//console.log(region_codes[this.options.country_info[country]["region-code"]])

		if(sub_region_codes[this.options.country_info[country]["sub-region-code"]]) {
			return sub_region_codes[this.options.country_info[country]["sub-region-code"]]
		}
		
		return region_codes[this.options.country_info[country]["region-code"]]
	}
}