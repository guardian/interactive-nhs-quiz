import ParallelCoordinates from './ParallelCoordinates';
export default class Flow {
	constructor(data,options) {

		this.name="FLOW";

		this.data=data;
		this.options=options;

		this._buildCountrySelector();
		
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
			if(index<this.options.questions.length && index < 2){

				this.options.question=this.options.questions[index].id;
				console.log(this.options)
				this.pc.nextQuestion(this.options.question);	
			} else {
				console.log("DONE!!!! USER USER USER",this.user)

				this._buildRanking();
			}
			
		}
		
	}

	_buildCountrySelector() {
		let self=this;
		let confirm_button=d3.select("button#confirmCountry")
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

		/*d3.select("#countrySelector")
				.append("option")
					.attr("value","none")
					.text("None of the above")*/
	}

	_buildRanking(){
		


		let avg={
				country:"YOU",
				avg:d3.mean(this.user.questions,(d)=>Math.abs(d.mean-d.actual))
			},
			ranking=this.options.ranking.concat([avg]);



		d3.select("#ranking")
			.classed("hidden",false)
			.select("ul")
			.selectAll("li")
				.data(ranking.sort((a,b)=>(a.normalized_avg-b.normalized_avg)))
				.enter()
				.append("li")
					.classed("you",(d)=>d.country==="YOU")
					.classed("selected",(d)=>d.country===this.options.country)
					.html((d,i)=>("<span>"+(i<10?"0":"")+(i+1)+".</span> "+d.country))
	}
}