import Column from './Column'
export default class Row extends Column {

	constructor(data,options) {
		super(data,options)

		console.log("ROW",options)
		
		this._addYourSlider();
		//this._addCountries();
	}

	_buildVisual() {
		let self=this;

		this.margins={
			top:40,
			left:30,
			bottom:40,
			right:30
		}
		this.padding={
			top:40,
			left:50,
			bottom:40,
			right:30
		}

		

		


		this.container
				.classed("hidden",!this.options.visible)
				.append("div")
				.attr("class","q-title")
				.append("p")
					.html((d,i)=>{
						//return this.options.question.id+" "+this.options.question.question
						return this.options.question.id+" "+this.options.question.question.replace(/\[Country\]/gi,"<i>"+this.options.country+"</i>")
					})

		let chart_container=this.container.append("div")
									.attr("class","chart-container")

		this.svg = chart_container
					.append("svg")
					/*.on("mousemove",function(){
						let coords=d3.mouse(this),
							x=coords[0]-(self.margins.left+self.padding.left)

						console.log(x,self.xscale.invert(x))
					})*/

		let defs=this.svg.append("defs");

		
		let bbox=this.svg.node().getBoundingClientRect(),
			WIDTH=bbox.width,
			HEIGHT=bbox.height;

		

		console.log(bbox)

		let w=WIDTH-(this.margins.left+this.padding.left+this.margins.right+this.padding.right),
			h=HEIGHT-(this.margins.top+this.padding.top+this.margins.bottom+this.padding.bottom);

		this.xscale=d3.scale.linear().domain(this.extents.values).range([0,w])
		this.yscale=d3.scale.ordinal().domain(["mean","actual"]).rangePoints([0,h])
		this.colorscale=d3.scale.linear().domain(this.extents.difference).range(["#b82266","#298422","#b82266"])
		
		this.voronoi = d3.geom.voronoi()
    					.clipExtent([[-2, -2], [w + 2, HEIGHT + 2]]);
    	

		this.line=this.svg.selectAll("g.line")
					.data(["mean","actual"])
					.enter()
					.append("g")
					.attr("class","line")
					.classed("hidden",(d)=>d==="actual")
					.attr("transform",(d)=>{
						let x=this.margins.left,
							y=this.yscale(d)+this.margins.top+this.padding.top;
						return `translate(${x},${y})`;
					})

		this.line
			.append("line")
				.attr("class","bg")
				.attr("x1",this.padding.left)
				.attr("y1",0)
				.attr("x2",this.xscale.range()[1]+this.padding.left)
				.attr("y2",0)
		this.line
			.append("text")
				.attr("class","zero")
				.attr("x",this.padding.left-3)
				.attr("y",4)
				.text((this.options.question.range?this.options.question.range[0]:"0")+(this.options.question.units||""))
		this.line
			.append("text")
				.attr("class","hundred")
				.attr("x",this.xscale.range()[1]+this.padding.left+3)
				.attr("y",4)
				.text((this.options.question.range?this.options.question.range[1]:"100")+(this.options.question.units||""))
				//.text("100%")

		this.line
			.append("text")
				.attr("class","title")
				.attr("x",this.padding.left-3-25)
				.attr("y",4)
				.text((d)=>{
					return (d==="mean"?"Answer":"Actual");
				})

		this.countries=this.svg
						.append("g")
							.attr("class","countries")
							.attr("transform",`translate(${this.margins.left+this.padding.left},${this.margins.top})`);

	}

	_addYourSlider() {
		let self=this;

		let my_country=this.options.country?this.data.find((c)=>(c.country===this.options.country)):null;
		console.log("MY COUNTRY",my_country,this.options.country,this.data)

		this.myLine=this.svg
						.append("g")
							.attr("class","my countries")
							.attr("transform",`translate(${this.margins.left+this.padding.left},${this.margins.top})`);

		this.my_country=this.myLine
							.selectAll("g.country")
								.data([{
									country:"YOU",
									selected_country:this.options.country,
									question:{
										actual: my_country?my_country.question.actual:0,
										"difference (mean-actual)": 0,
										mean: 50,
										question: this.options.question
									}
								}])
								.enter()
								.append("g")
									.attr("class","country")
									.classed("you",(d)=>{
										return d.country === "YOU";
									})

		let drag = d3.behavior.drag()
						.origin(function(d) { return d; })
    					.on("drag", dragmove);
		drag
			.on("dragstart", function() {
				d3.event.sourceEvent.stopPropagation(); // silence other listeners
			})
			.on("dragend",function(){

			})

		function dragmove(d) {
		  	d3.select(this)
		  		.attr("transform",()=>{
		  			//console.log(d3.event)
		  			let x=d.x_mean+d3.event.dx,
		  				y=self.yscale("mean")+self.padding.top;
		  			x=x<self.xscale.range()[0]?self.xscale.range()[0]:x;
		  			x=x>self.xscale.range()[1]?self.xscale.range()[1]:x;
		  			
		  			d.question.mean=Math.round(self.xscale.invert(x));
		  			d.question["difference (mean-actual)"]=d.question.mean-d.question.actual;
		  			d.x_mean=self.xscale(d.question.mean);

		  			return `translate(${x},${y})`;
		  		})
		  		.select("text.country-value")
		  			.text((d)=>{
		  				return d3.format(",.0f")(d.question.mean)+(self.options.question.units||"");
		  			})
		}

		this.my=this.my_country.append("g")
								.attr("class","value")
								.attr("transform",(d)=>{
									let x=this.xscale(d.question.mean),
										y=this.yscale("mean")+this.padding.top;

									d.x_mean=x;

									//this.samples.push([x,y])

									return `translate(${x},${y})`;
								})
								.call(drag);

		this.my.append("circle")
					.attr("cx",0)
					.attr("cy",0)
					.attr("r",8)
					.attr("class",(d)=>{
						return this._getCountryArea(d.country=="YOU"?d.selected_country:d.country)
					})
					
		
		this.my
			.append("text")
					.attr("class","country-value")
					.attr("x",0)
					.attr("y",(d)=>{
						return 30;
						return (d.country===this.options.country || d.country==="YOU")?-26:-10
					})
					//.attr("filter","url(#dropshadow)")
					.text((d)=>{
						return d.question.mean+(this.options.question.units||"");
					})

		this.my.append("text")
					.attr("class","country-name hidden")
					.attr("x",0)
					.attr("y",(d)=>{
						return -12;
						return (d.country===this.options.country || d.country==="YOU")?-26:-25
					})
					.text(function(d){
						return d.country;
					})
					.each(function(d){
						d.width=this.getBBox().width+45+3*2
					})

		this.confirmButton=this.container.append("button")
								.attr("class","confirm-btn")
								.text("This is my best guess")
								.on("click",()=>{
									

									this.my.remove();

									this.data.push(this.my.datum())
									//console.log(this.my.datum())
									
									this._addCountries();
									d3.select(this).remove();

									this._addNextButton();
								})
	}
	_addNextButton() {
		let self=this;
		this.confirmButton.remove();
		this.container.append("button")
				.attr("class","confirm-btn")
				.text("Next question")
				.on("click",function(){

					if(typeof self.options.nextCallback !== 'undefined') {
						self.options.nextCallback(self.options.index,self.my_country.datum().question)	
					}

					d3.select(this).remove();

				})
	}
	
	_addCountries() {
		this.line.classed("hidden",false)
		this.country=this.countries
							.selectAll("g.country")
								.data(this.data)
								.enter()
								.append("g")
									.attr("class","country")
									.classed("selected",(d)=>{
										return this.options.country === d.country;
									})
									.classed("you",(d)=>{
										return d.country === "YOU";
									})
									/*.on("mouseenter",(d)=>{
										country
											.classed("highlight",(c)=>{
												return c.country === d.country;
											})
											.filter((c)=>{
												//console.log(c.country,d.country,this)
												return (c.country === d.country) || (d.country === this.options.country)
											})
											.moveToFront()
									})*/
		this.country
			.filter((c)=>{
				return (c.country === this.options.country)
			})
			.moveToFront()

		
		let slope=this.country.append("line")
						.attr("class","slope")
						.attr("x1",(d)=>{
							return this.xscale(d.question.mean)
						})
						.attr("y1",(d)=>{
							return this.yscale("mean")+this.padding.top
						})
						.attr("x2",(d)=>{
							return this.xscale(d.question.actual)
						})
						.attr("y2",(d)=>{
							return this.yscale("actual")+this.padding.top
						})
						/*.style("stroke",(d)=>{
							return this.colorscale(d.question["difference (mean-actual)"]);
						})*/
		this.samples=[];

		this.mean=this.country.append("g")
								.attr("class","value")
								.attr("transform",(d)=>{
									let x=this.xscale(d.question.mean),
										y=this.yscale("mean")+this.padding.top;

									d.x_mean=x;

									this.samples.push([x,y])

									return `translate(${x},${y})`;
								});
		this.mean.append("circle")
					.attr("cx",0)
					.attr("cy",0)
					.attr("r",(d)=>(d.country==="YOU"?6:4))
					.attr("class",(d)=>{
						return this._getCountryArea(d.country=="YOU"?d.selected_country:d.country)
					})
		
		this.mean
			.append("text")
					.attr("class","country-value")
					.attr("x",-5)
					.attr("y",(d)=>{
						return -10;
						return (d.country===this.options.country || d.country==="YOU")?-26:-10
					})
					//.attr("filter","url(#dropshadow)")
					.text((d)=>{
						return d.question.mean+(this.options.question.units||"");
					})

		this.mean.append("text")
					.attr("class","country-name")
					.attr("x",5)
					.attr("y",(d)=>{
						return -10;
						return (d.country===this.options.country || d.country==="YOU")?-26:-25
					})
					.text(function(d){
						return d.country;
					})
					.each(function(d){
						d.width_mean=this.getBBox().width+45+3*2
					})

		/*this.mean
			.filter((d)=>{
				return d.country===this.options.country || d.country==="YOU"
			})
			.append("line")
				.attr("class","selected-country")
				.attr("x1",0)
				.attr("x2",0)
				.attr("y1",-6)
				.attr("y2",-22)*/
		this.mean
			.append("circle")
				.attr("class",(d)=>{
					return "c "+this._getCountryArea(d.country=="YOU"?d.selected_country:d.country)
				})
				.attr("cx",0)
				.attr("cy",-14)
				.attr("r",3)

		this.actual=this.country
							.filter((d)=>d.country!==this.options.country)
							.append("g")
								.attr("class","value")
								.attr("transform",(d)=>{
									let x=this.xscale(d.question.actual),
										y=this.yscale("actual")+this.padding.top;

									this.samples.push([x,y])

									d.x_actual=x;

									return `translate(${x},${y})`;
								});
		this.actual.append("circle")
					.attr("cx",0)
					.attr("cy",0)
					.attr("r",4)
					.attr("class",(d)=>{
						return this._getCountryArea(d.country=="YOU"?d.selected_country:d.country)
					})

		this.actual
			.append("text")
					.attr("class","country-value")
					//.attr("filter","url(#dropshadow)")
					.attr("x",-5)
					.attr("y",(d)=>{
						return 18;
						return (d.country===this.options.country || d.country==="YOU")?-26:-10
					})
					.text((d)=>{
						return d.question.actual+(this.options.question.units||"");
					})

		
					

		this.actual.append("text")
					.attr("class","country-name")
					//.attr("filter","url(#dropshadow)")
					.attr("x",5)
					.attr("y",(d)=>{
						return 18;
						return (d.country===this.options.country || d.country==="YOU")?32:32
					})
					.text(function(d){
						return d.selected_country  || d.country;
					})
					.each(function(d){
						d.width_actual=this.getBBox().width+45+3*2
						//d.width=d3.max([this.getBBox().width+5,d.width])
					})
		/*this.actual
			.filter((d)=>{
				return d.country===this.options.country || d.country==="YOU"
			})
			.append("line")
				.attr("class","selected-country")
				.attr("x1",0)
				.attr("x2",0)
				.attr("y1",6)
				.attr("y2",24)*/
		this.actual
			.append("circle")
				.attr("class",(d)=>{
					return "c "+this._getCountryArea(d.country=="YOU"?d.selected_country:d.country)
				})
				.attr("cx",0)
				.attr("cy",14)
				.attr("r",3)

		this.cell = this.svg.append("g")
					    .attr("class", "voronoi")
					    .attr("transform",`translate(${this.margins.left+this.padding.left},${this.margins.top})`)
					  	.selectAll("g");

		this._resample(80);

		
		this.highlightCountry([])

	}
	highlightCountry(countries) {
		
		let __you=this.data.find((d)=>d.country==="YOU");

		countries=countries.concat(["YOU",this.options.country]);//,__you.selected_country])

		let __countries=this.data.filter((c)=>{
				return countries.indexOf(c.country)>-1
			});
			
						

		console.log(countries,__countries)		

		let prev_mean={
				x:0,
				y:0
			},
			prev_actual={
				x:[],
				y:0
			}

		__countries.sort((a,b)=>{
			if(a.country==="YOU") {
				return -1;
			}
			if(b.country==="YOU") {
				return 1;
			}
			return a.x_mean - b.x_mean;
		})
		__countries.forEach((d,i)=>{
			if(!i) {
				d.y_mean_pos=0;
			} else {
				let prev=__countries[i-1];
				//console.log("prev is ",prev.country)

				if(
					(d.x_mean-(prev.x_mean+prev.width_mean)>0)
					||
					(prev.x_mean-(d.x_mean+d.width_mean)>0)
				) {
					//console.log("don't overlap")
					if(
						(d.x_mean-(__you.x_mean+__you.width_mean)>0)
						||
						(__you.x_mean-(d.x_mean+d.width_mean)>0)
					) {
						d.y_mean_pos=0;
					} else {
						//console.log("but overlaps with YOU");
						d.y_mean_pos=1;	
					}
				} else {
					//console.log("they overlap")
					
					d.y_mean_pos=prev.y_mean_pos+1;	
					//if(prev.country===__you.selected_country) {
					//	d.y_mean_pos--;
					//}
				}
			}
		})



		this.mean
				.filter((d)=>(__countries.map((d)=>(d.country)).indexOf(d.country)>-1))
				.select("circle.c")
					.attr("cy",(d)=>(d.y_mean_pos* -16)-14)

		this.mean
				.classed("hidden-value",true)
				.filter((d)=>(__countries.map((d)=>(d.country)).indexOf(d.country)>-1))
				.classed("hidden-value",(d,i)=>{
					return false;
					//return i>0 && __countries[i-1].x_mean===d.x_mean;
					return i>0 && __countries.map((d)=>(d.country)).indexOf(d.country)>0 && __countries[i].x_mean===d.x_mean
				})
				.selectAll("text")
					.attr("dy",(d)=>d.y_mean_pos* -16)



		__countries=__countries.sort((a,b)=>{
			if(a.country==="YOU") {
				return -1;
			}
			if(b.country==="YOU") {
				return 1;
			}
			return a.x_actual - b.x_actual;
		})

		__countries.forEach((d,i)=>{
			console.log(d.country)
			if(!i) {
				d.y_actual_pos=0;
			} else {

				let prev=__countries[i-1];
				console.log("prev is ",prev.country)

				if(
					(d.x_actual-(prev.x_actual+prev.width_actual)>0)
					||
					(prev.x_actual-(d.x_actual+d.width_actual)>0)
				) {
					console.log("don't overlap")
					if(
						(d.x_actual-(__you.x_actual+__you.width_actual)>0)
						||
						(__you.x_actual-(d.x_actual+d.width_actual)>0)
					) {
						d.y_actual_pos=0;
					} else {
						console.log("but overlaps with YOU");
						d.y_actual_pos=1;	
					}
				} else {
					console.log("they overlap")
					d.y_actual_pos=prev.y_actual_pos+1;
					console.log(prev.country,"===",__you.selected_country)
					if(prev.country===__you.selected_country) {
						d.y_actual_pos--;
					}
					//d.y_actual_pos=prev.y_actual_pos+1;	
				}
				
			}
		})
		//console.clear()

		this.actual
				.filter((d)=>(__countries.map((d)=>(d.country)).indexOf(d.country)>-1))
				.select("circle.c")
					.attr("cy",(d)=>(d.y_actual_pos*18)+14)

		this.actual
				.filter((d)=>(__countries.map((d)=>(d.country)).indexOf(d.country)>-1))
				.classed("hidden-value",(d,i)=>{
					//return i>0 && __countries[i-1].x_mean===d.x_mean;
					//console.log(__countries)
					let index=__countries.map((c)=>(c.country)).indexOf(d.country);
					return index>0 && __countries[index-1].x_actual===d.x_actual
				})
				.selectAll("text")
					.attr("dy",(d)=>d.y_actual_pos*18)
		


		this.country
			.classed("highlight",(c)=>{
				return countries.indexOf(c.country)>-1;
			})
			.filter((c)=>{
				return (countries.indexOf(c.country)>-1) || (c.country === this.options.country) || c.country==="YOU"
			})
			.moveToFront()

	}
	_findCountry(value,type,y) {
		

		//console.log(value,type,y)
		let delta=101,
			found=[];

		this.data
			.forEach((d)=>{
				let _delta=Math.abs(d.question[type] - value)
				if(_delta<delta) {
					delta=_delta;
				}
			})
		this.data
			.forEach((d)=>{
				let _delta=Math.abs(d.question[type] - value);
				if(_delta===delta) {
					found.push(d)
				}
			})
		/*
		let countries=this.data.filter((d)=>{
			return d.question[type]<=value;
		}).sort((a,b)=>{return a.question[type]-b.question[type]})
		console.log(countries[countries.length-1].country)
		*/
		//console.log(found)
		return found.map((d)=>{return d.country});

	}
	_resample(samplesPerSegment) {
			
		//console.log(samples,voronoi(samples))

		this.cell = this.cell.data(this.voronoi(this.samples).filter((d)=>{return typeof d !== 'undefined'}));
		this.cell.exit().remove();
		
		var cellEnter = this.cell.enter().append("g").on("mouseenter",(d)=>{
			let countries=this._findCountry(this.xscale.invert(d.point[0]),(d.point[1]>this.padding.top)?"actual":"mean",d.point[1]);
			
			this.highlightCountry(countries)
		})
		
		cellEnter.append("circle").attr("r", 3.5);
		cellEnter.append("path");
		
		this.cell.select("circle").attr("transform", function(d) { return "translate(" + d.point + ")"; });
		this.cell.select("path").attr("d", function(d) { return "M" + d.join("L") + "Z"; });
	}
	show() {
		this.container
				.classed("hidden",false)
	}
}