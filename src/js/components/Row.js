import Column from './Column'
import { hasTouchScreen } from '../lib/detect'
import { getViewport } from '../lib/detect'
import { detectIE } from '../lib/detect'
import { isAndroid } from '../lib/detect'

export default class Row extends Column {

	constructor(data,options) {
		super(data,options)

		//console.log("ROW",options)
		this.IE=detectIE();
		this._addYourSlider();
		this.isAndroid=isAndroid();

		this.touch=false;
		//this._addCountries();
	}

	_buildVisual() {
		let self=this;

		this.margins={
			top:50,
			left:15,//this.options.isSmallScreen?5:30,
			bottom:36,
			right:15//this.options.isSmallScreen?5:30
		}
		this.padding={
			top:40,
			left:20,//this.options.isSmallScreen?0:50,
			bottom:40,
			right:20//this.options.isSmallScreen?0:30
		}

		

		


		this.container
				.classed("inactive",!this.options.visible)
				.classed("your",true)
				.attr("rel",this.options.index)
				.append("div")
				.attr("class","q-title")
				.append("div")
					.html((d,i)=>{

						let the_country = this.options.country;

						if(the_country==="UK" || the_country==="United States" || the_country==="Netherlands") {
							the_country="the "+the_country
						}

						let the_question = this.options.question.question.replace(/\[Country\]/gi,the_country);

						the_question=the_question.replace(/(the the)/gi,"the");

						return "<span>"+((this.options.i+1)+(this.options.isSmallScreen?(" of "+this.options.n):""))+".</span><p>"+the_question+"</p>";
					})

		let chart_container=this.container.append("div")
									.attr("class","chart-container init")

		this.svg = chart_container
					.append("svg")
					.attr("class","chart")
					.on("touchstart",()=>{
						if(this.container.classed("your")) {
							return;
						}
						
						this.touch=true;

						if(this.voronoi_centers) {

							if (this.isAndroid && window.GuardianJSInterface) {
								window.GuardianJSInterface.registerRelatedCardsTouch(true);
							}

							d3.event.preventDefault();
					    	let touch=d3.event.targetTouches[0];

					    	var e = touch.target;
						    var dim = this.svg.node().getBoundingClientRect();
						    var x = touch.clientX - dim.left;
						    var y = touch.clientY - dim.top;

					    	let countries=this._findVoronoi(x,y)
					    	this.highlightCountry(countries)

						}
					})
					.on("touchend",()=>{
						this.touch=false;
						if (this.isAndroid && window.GuardianJSInterface) {
							window.GuardianJSInterface.registerRelatedCardsTouch(false);
						}
					})
					.on("touchmove",()=>{
							if(this.container.classed("your")) {
								return;
							}
							if(this.voronoi_centers) {
								d3.event.preventDefault();
						    	let touch=d3.event.targetTouches[0];

						    	var e = touch.target;
							    var dim = this.svg.node().getBoundingClientRect();
							    var x = touch.clientX - dim.left;
							    var y = touch.clientY - dim.top;

						    	let countries=this._findVoronoi(x,y)
						    	this.highlightCountry(countries)

							}
					    	
					})
					.on("mouseout",()=>{
						if(this.voronoi_centers) {
							this.highlightCountry()
						}
					})
		this._addLegend();
		let defs=this.svg.append("defs");
		this._addDefsShadow(defs);
		
		let bbox=this.svg.node().getBoundingClientRect(),
			WIDTH=bbox.width,
			HEIGHT=bbox.height;

		this.WIDTH=WIDTH;

		////console.log(bbox)

		let w=WIDTH-(this.margins.left+this.padding.left+this.margins.right+this.padding.right),
			h=HEIGHT-(this.margins.top+this.padding.top+this.margins.bottom+this.padding.bottom);

		this.xscale=d3.scale.linear().domain(this.extents.values).range([0,w]).nice()

		

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
			.append("rect")
				.attr("class","bg")
				.attr("x",this.padding.left)
				.attr("y",-4)
				.attr("width",this.xscale.range()[1])
				.attr("height",8)
				.attr("rx",4)
				.attr("ry",4)
		this.line
			.append("text")
				.attr("class","zero")
				.attr("x",this.padding.left-3)
				.attr("y",(d)=>{
					/*
					if(this.options.isSmallScreen) {
						return d==="mean"?-10:20;
					}
					*/
					return 4;
				})
				//.text((this.options.question.range?this.options.question.range[0]:"0")+(this.options.question.units||""))
				.text(this.xscale.domain()[0]+(this.options.question.units||""))
		this.line
			.append("text")
				.attr("class","hundred")
				.attr("x",this.xscale.range()[1]+this.padding.left+3)
				.attr("y",(d)=>{
					/*
					if(this.options.isSmallScreen) {
						return d==="mean"?-10:20;
					}
					*/
					return 4;
				})
				//.text((this.options.question.range?this.options.question.range[1]:"100")+(this.options.question.units||""))
				.text(this.xscale.domain()[1]+(this.options.question.units||""))
				//.text("100%")

		this.line
			.append("text")
				.attr("class","title")
				.attr("x",0)//this.padding.left-3-(this.options.isSmallScreen?0:25))
				.attr("y",(d)=>{
					
					/*if(this.options.isSmallScreen) {
						return -25;
					}*/

					return d==="mean"?-22:32;
				})
				.text((d)=>{
					if(this.options.isSmallScreen) {
						return (d==="mean"?"SURVEY":"ACTUAL");	
					}
					return (d==="mean"?"SURVEY ANSWERS":"ACTUAL NUMBERS");
				})

		this.countries=this.svg
						.append("g")
							.attr("class","countries")
							.attr("transform",`translate(${this.margins.left+this.padding.left},${this.margins.top})`);

	}

	_addYourSlider() {
		let self=this;

		let my_country=this.options.country?this.data.find((c)=>(c.country===this.options.country)):null;
		//console.log("MY COUNTRY",my_country,this.options.country,this.data)

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
			.on("dragstart", () => {
				d3.event.sourceEvent.stopPropagation(); // silence other listeners
				//this.my.select("text.inactive").classed("inactive",false)
				this.confirmButton.classed("disabled",false)
			})
			.on("dragend",function(){

			})
		let __Y=self.yscale("mean")+self.padding.top;
		function dragmove(d) {
		  	d3.select(this)
		  		.attr("transform",()=>{
		  			//console.log(d3.event,d.x_mean,__Y)
		  			let x=d.x_mean+d3.event.dx,
		  				y=__Y;
		  			//console.log(d.x_mean,d3.event.dx)
		  			
		  			x=x<self.xscale.range()[0]?self.xscale.range()[0]:x;
		  			x=x>self.xscale.range()[1]?self.xscale.range()[1]:x;
		  			
		  			d.question.mean=Math.round(self.xscale.invert(x));
		  			d.question["difference (mean-actual)"]=d.question.mean-d.question.actual;
		  			
		  			d.x_mean=x;//self.xscale(d.question.mean);
		  			

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

		let c=this.my.append("circle")
					.attr("cx",0)
					.attr("cy",0)
					.attr("r",18)
					.attr("class",(d)=>{
						return this._getCountryArea(d.country=="YOU"?d.selected_country:d.country)
					})
		if(!this.IE) {
			c.attr("filter","url(#dropshadow)")
		}
					
					
		this.my.append("path")
					.attr("d","m20,-7l7,7l-7,7")
					.attr("class",(d)=>{
						return "float-right "+this._getCountryArea(d.country=="YOU"?d.selected_country:d.country)
					})
		this.my.append("path")
					.attr("d","m-20,-7l-7,7l7,7")
					.attr("class",(d)=>{
						return "float-left "+this._getCountryArea(d.country=="YOU"?d.selected_country:d.country)
					})
		this.my
			.append("text")
					.attr("class","country-value inactive")
					.attr("x",0)
					.attr("y",(d)=>{
						return -30;
						return (d.country===this.options.country || d.country==="YOU")?-26:-10
					})
					//.attr("filter","url(#dropshadow)")
					.text((d)=>{
						return "?"
						//return d.question.mean+(this.options.question.units||"");
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
								.attr("class","confirm-btn confirm")
								.text("See your results")
								.classed("disabled",true)
								.on("click",()=>{
									

									this.my.remove();

									this.data.push(this.my.datum())
									////console.log(this.my.datum())
									
									this._updateScale()

									this._addCountries();
									d3.select(this).remove();

									this.container
										.select(".chart-container.init")
										.classed("init",false)
										
									this._addAnalysis();
									if(typeof self.options.nextCallback !== 'undefined') {
										self.options.nextCallback(self.options.i,self.my_country.datum().question);
									}
									//this._addNextButton(this.options.last);
									this._addNextCallToAction(this.options.last);
								})
	}
	_updateScale() {

		this._setExents();

		this.xscale.domain([
			Math.min(this.extents.mean[0],this.extents.actual[0]),
			Math.max(this.extents.mean[1],this.extents.actual[1])
		]).nice()

		this.line
			.select("text.zero")
				.text(this.xscale.domain()[0]+(this.options.question.units||""))
		this.line
			.select("text.hundred")
				.text(this.xscale.domain()[1]+(this.options.question.units||""))
	}
	_addNextButton(last) {
		let self=this;
		this.confirmButton.remove();
		this.container.append("button")
				.attr("class","confirm-btn next")
				.html(last?"Check your result &rsaquo;":"Next question <svg width=\"24\" height=\"18\" viewBox=\"-0.525 -4 24 18\" overflow=\"visible\" enable-background=\"new -0.525 -4 24 18\"><path d=\"M23.2.7L12.7 9.1l-1.1.9-1.1-.898L0 .7.5 0l11.1 6.3L22.7 0l.5.7z\"/></svg>")
				.on("click",function(){

					if(typeof self.options.nextCallback !== 'undefined') {

						console.log(self.options.i)
						self.options.nextCallback(self.options.i,self.my_country.datum().question);
					}

					d3.select(this).remove();

				})
	}
	_addNextCallToAction(last) {
		let self=this;
		this.confirmButton.remove();
		this.container.append("div")
				.attr("class","call2action next")
				.html(last?"Check your result &rsaquo;":"Jump to next question <svg width=\"12\" height=\"9\" viewBox=\"-0.525 -4 24 18\" overflow=\"visible\" enable-background=\"new -0.525 -4 24 18\"><path d=\"M23.2.7L12.7 9.1l-1.1.9-1.1-.898L0 .7.5 0l11.1 6.3L22.7 0l.5.7z\"/></svg>")
				.on("mouseup",()=>{
					let next=d3.select("div.row[rel=\""+(this.options.index+1)+"\"]").node(),
						bbox=next.getBoundingClientRect();
					//console.log(next,bbox)

					d3.transition()
						    .duration(2000)
						    //.tween("scroll", this._scrollTween(bbox.top))
						    .tween("scroll", this._scrollTween(this._getElementPosition(next).top+500))

				})
	}

	_addAnalysis() {
		let self=this;
		let analysis=this.container.append("div")
				.attr("class","analysis hidden")
				.html(()=>{
					//console.log(this.options)
					return this.options.question.text
				})
		setTimeout(()=>{
			analysis.classed("hidden",false)	
		},500)
		
	}
	_addLegend() {
		let self=this;

		let regions=[
			{
				name:"Africa",
				c:"africa"
			},
			{
				name:"Asia",
				c:"asia"
			},
			{
				name:"Oceania",
				c:"oceania"
			},
			{
				name:"US & Canada",
				c:"namerica"
			},
			{
				name:"Latin America",
				c:"samerica"
			},
			{
				name:"Europe",
				c:"europe"
			}
		];
		this.legend = this.container.select(".chart-container").append("div")
						.attr("class","legend");
		this.legend.append("ul")
				.selectAll("li")
					.data(regions)
					.enter()
					.append("li")
						.attr("class",(d)=>(d.c))
						.html((d)=>{
							return "<span class=\"key "+d.c+"\"></span> "+d.name;
						})
		this.legend.append("button")
				.attr("class","confirm-btn confirm")
				.html("Compare all countries")
				.on("click",function(){
					self._toggleStatus();
					let your=self.container.classed("your");
					////console.log("AHHHH",your,d3.select(this))
					d3.select(this).html(your?"Compare all countries":"See your answer")
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
												////console.log(c.country,d.country,this)
												return (c.country === d.country) || (d.country === this.options.country)
											})
											.moveToFront()
									})*/
		this.country
			.filter((c)=>{
				return (c.country === this.options.country)
			})
			.moveToFront()

		
		this.slope=this.country.append("line")
						.attr("class",(d)=>{
							return "slope "+this._getCountryArea(d.country=="YOU"?d.selected_country:d.country)
						})
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
		
		let your=this.container.classed("your");

		this.mean.append("circle")
					.attr("cx",0)
					.attr("cy",0)
					.attr("r",(d)=>((this.options.country === d.country || d.country === "YOU") && your)?12:5)
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



		let big_label=this.mean
			.filter((d)=>((this.options.country === d.country || d.country === "YOU")))
			.append("g")
				.attr("class","big-label")
				.attr("transform",(d)=>{
					let x=0,
						y=this.margins.top;
					if(d.x_mean<100) {
						x=100-d.x_mean;
					}
					if(this.options.country === d.country) {
						y=y-25;
					}
					return `translate(${x},${-(y)})`
				})
		big_label.append("line")
				.attr("x1",(d)=>{
					let x=0,
						delta=this.options.isSmallScreen?35:100
					if(d.x_mean<delta) {
						x=delta-d.x_mean;
					}
					return -x;
				})
				.attr("x2",(d)=>{
					let x=0,
						delta=this.options.isSmallScreen?35:100
					if(d.x_mean<delta) {
						x=delta-d.x_mean;
					}
					return -x;
				})
				.attr("y1",4)
				.attr("y2",(d)=>{
					let y=this.margins.top;
					if(this.options.country === d.country) {
						y=y-25;
					}
					return y-14	
				})
		let text_guess=big_label.append("text")
				.attr("class","guess")
				.attr("dx",35);
		
		
		text_guess.append("tspan")
				.attr("class","country")
				.text((d)=>(d.country==="YOU"?"You":d.country))
		text_guess.append("tspan")
				.text(" ")

		text_guess.append("tspan")
				.classed("hidden",this.options.isSmallScreen)
				.text("guessed ")

		text_guess.append("tspan")
				.attr("class","value")
				.text((d)=>(d.question.mean))

		text_guess.append("tspan")
				.text(this.options.question.units)




		this.mean
			.append("circle")
				.attr("class",(d)=>{
					return "c "+this._getCountryArea(d.country=="YOU"?d.selected_country:d.country)
				})
				.attr("cx",0)
				.attr("cy",-14)
				.attr("r",3)

		this.actual=this.country
							//.filter((d)=>d.country!==this.options.country)
							.append("g")
								.attr("class","value")
								.attr("transform",(d)=>{
									let x=this.xscale(d.question.actual),
										y=this.yscale("actual")+this.padding.top;

									this.samples.push([x,y])

									d.x_actual=x;

									return `translate(${x},${y})`;
								})
								.filter((d)=>d.country!==this.options.country)


		this.actual.append("circle")
					.attr("cx",0)
					.attr("cy",0)
					//.attr("r",your?8:3)
					.attr("r",(d)=>((this.options.country === d.country || d.country === "YOU") && your)?12:5)
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

		big_label=this.actual
			.filter((d)=>((d.country===this.options.country || d.country==="YOU")))
			.append("g")
				.attr("class","big-label")
				//.attr("transform",`translate(0,${-(this.margins.top)})`)
				.attr("transform",(d)=>{
					let x=0,
						delta=this.options.isSmallScreen?35:100
					if(d.x_actual<delta) {
						x=delta-d.x_actual;
					}
					return `translate(${x},${-(this.margins.top)})`
				})
		big_label.append("line")
				.attr("x1",(d)=>{
					let x=0,
						delta=this.options.isSmallScreen?35:100
					if(d.x_actual<delta) {
						x=delta-d.x_actual;
					}
					return -x;
				})
				.attr("x2",(d)=>{
					let x=0,
						delta=this.options.isSmallScreen?35:100
					if(d.x_actual<delta) {
						x=delta-d.x_actual;
					}
					return -x;
				})
				.attr("y1",4)
				.attr("y2",this.margins.top-14)
		text_guess=big_label.append("text")
				.attr("class","guess")
				.attr("dx",35);//this.options.isSmallScreen?0:35);
		
		text_guess.append("tspan")
				.attr("class","country")
				.text("Actual")
		text_guess.append("tspan")
				.text(" ")

		text_guess.append("tspan")
				.classed("hidden",this.options.isSmallScreen)
				.text("answer ")
				

		text_guess.append("tspan")
				.attr("class","value")
				.text((d)=>(d.question.actual))

		text_guess.append("tspan")
				.text(this.options.question.units)

		
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
					    //.style("display","none")
					    .attr("transform",`translate(${this.margins.left+this.padding.left},${this.margins.top})`)
					  	.selectAll("g");

		this._resample(10);

		
		this.highlightCountry([])

	}
	_toggleStatus() {
		let your=!this.container.classed("your");
		this.container.classed("your",your);

		this.country.filter((d)=>{
				return this.options.country === d.country || d.country === "YOU";
			})
			.selectAll("circle:not(.c)")
				.attr("r",your?8:5)

	}
	highlightCountry(countries) {
		


		if(!countries) {
			countries=[];
		}

		let __you=this.data.find((d)=>d.country==="YOU");

		countries=countries.concat(["YOU",this.options.country]);//,__you.selected_country])

		let __countries=this.data.filter((c)=>{
				return countries.indexOf(c.country)>-1
			});
			
						

		////console.log(countries,__countries)		

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
			if(a.country===this.options.country) {
				return -1;
			}
			if(b.country===this.options.country) {
				return 1;
			}
			return a.x_mean - b.x_mean;
		})
		////console.log("sorted",__countries.map(d=>d.country).join("-"))
		////console.log("sorted",__countries.map(d=>d.x_actual).join("-"))

		__countries.forEach((d,i)=>{
			if(!i) {
				d.y_mean_pos=0;
			} else {
				let prev=__countries[i-1];
				////console.log("prev is ",prev.country)

				if(
					(d.x_mean-(prev.x_mean+prev.width_mean)>0)
					||
					(prev.x_mean-(d.x_mean+d.width_mean)>0)
				) {
					////console.log("don't overlap")
					if(
						(d.x_mean-(__you.x_mean+__you.width_mean)>0)
						||
						(__you.x_mean-(d.x_mean+d.width_mean)>0)
					) {
						d.y_mean_pos=0;
					} else {
						////console.log("but overlaps with YOU");
						d.y_mean_pos=1;	
					}
				} else {
					////console.log("they overlap")
					
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
					let index=__countries.map((c)=>(c.country)).indexOf(d.country);
					return index>0 && __countries[index-1].x_mean===d.x_mean
				})
				.selectAll("text:not(.guess)")
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
		////console.log("sorted",__countries.map(d=>d.country).join("-"))
		////console.log("sorted",__countries.map(d=>d.x_actual).join("-"))
		__countries.forEach((d,i)=>{
			////console.log(d.country)
			if(!i) {
				d.y_actual_pos=0;
			} else {

				let prev=__countries[i-1];
				////console.log("prev is ",prev.country)

				if(
					(d.x_actual-(prev.x_actual+prev.width_actual)>0)
					||
					(prev.x_actual-(d.x_actual+d.width_actual)>0)
				) {
					////console.log("don't overlap")
					if(
						(d.x_actual-(__you.x_actual+__you.width_actual)>0)
						||
						(__you.x_actual-(d.x_actual+d.width_actual)>0)
					) {
						d.y_actual_pos=0;
					} else {
						////console.log("but overlaps with YOU");
						d.y_actual_pos=1;	
					}
				} else {
					////console.log("they overlap")
					d.y_actual_pos=prev.y_actual_pos+1;
					////console.log(prev.country,"===",__you.selected_country)
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
					////console.log(__countries)
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
		

		////console.log(value,type,y)
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
		//console.log(countries[countries.length-1].country)
		*/
		////console.log(found)
		return found.map((d)=>{return d.country});

	}
	_findVoronoi(x,y) {

		////console.log(x,y,this.voronoi_centers)
		let delta=1000,
			found;
		this.voronoi_centers.find((d)=>{
			let dist=Math.sqrt(((x-d[0])*(x-d[0]))+((y-d[1])*(y-d[1])));
			
			if(dist<delta) {
				////console.log(dist,"<",delta,x,y,d)
				found=d;
				delta=dist;
			}
		})
		let countries=this._findCountry(this.xscale.invert(found[0]),(found[1]>this.padding.top)?"actual":"mean",found[1]);
		////console.log(countries)
		return countries;
	}
	_resample(samplesPerSegment) {
			
		////console.log(samples,voronoi(samples))
		this.voronoi_data=this.voronoi(this.samples).filter((d)=>{return typeof d !== 'undefined'});
		this.voronoi_centers=this.voronoi_data.map((d)=>d.point);
		this.cell = this.cell.data(this.voronoi_data);
		this.cell.exit().remove();
		
		var cellEnter = this.cell.enter().append("g");

		//if(!hasTouchScreen()) {
		cellEnter
			.on("mouseenter",(d)=>{
				if(!this.touch) {
					let countries=this._findCountry(this.xscale.invert(d.point[0]),(d.point[1]>this.padding.top)?"actual":"mean",d.point[1]);
					////console.log(countries)
					this.highlightCountry(countries)	
				}
			})
		//}
			
		
		cellEnter.append("circle").attr("r", 3.5);
		cellEnter.append("path");
		
		this.cell.select("circle").attr("transform", function(d) { return "translate(" + d.point + ")"; });
		this.cell.select("path").attr("d", function(d) { return "M" + d.join("L") + "Z"; });
	}
	
	show() {
		this.container
				.classed("hidden",false)
				.classed("inactive",false)
	}
	_update() {

		this.myLine.attr("transform",`translate(${this.margins.left+this.padding.left},${this.margins.top})`);

		this.my.attr("transform",(d)=>{
			let x=this.xscale(d.question.mean),
				y=this.yscale("mean")+this.padding.top;

			d.x_mean=x;

			//this.samples.push([x,y])

			return `translate(${x},${y})`;
		})

		this.line.attr("transform",(d)=>{
						let x=this.margins.left,
							y=this.yscale(d)+this.margins.top+this.padding.top;
						return `translate(${x},${y})`;
					})

		this.line
			.select("line.bg")
				.attr("x1",this.padding.left)
				.attr("x2",this.xscale.range()[1]+this.padding.left)

		this.line
			.select("text.zero")
				.attr("x",this.padding.left-3)
				.attr("y",(d)=>{
					if(this.options.isSmallScreen) {
						return d==="mean"?-10:20;
					}
					return 4;
				});
		this.line
			.select("text.hundred")
				.attr("x",this.xscale.range()[1]+this.padding.left+3)
				.attr("y",(d)=>{
					if(this.options.isSmallScreen) {
						return d==="mean"?20:10;
					}
					return 4;
				})

		this.line
			.select("text.title")
				.attr("x",this.padding.left-3-25)
				//.attr("x",this.padding.left-3-(this.options.isSmallScreen?0:25))
				

		this.countries.attr("transform",`translate(${this.margins.left+this.padding.left},${this.margins.top})`);

		if(!this.voronoi_centers) {
			return;
		}

		this.slope.attr("x1",(d)=>{
					return this.xscale(d.question.mean)
				})
				.attr("x2",(d)=>{
					return this.xscale(d.question.actual)
				});
		this.samples=[];
		this.mean.attr("transform",(d)=>{
						let x=this.xscale(d.question.mean),
							y=this.yscale("mean")+this.padding.top;

						d.x_mean=x;

						this.samples.push([x,y])

						return `translate(${x},${y})`;
					});
		this.actual.attr("transform",(d)=>{
									let x=this.xscale(d.question.actual),
										y=this.yscale("actual")+this.padding.top;

									this.samples.push([x,y])

									d.x_actual=x;

									return `translate(${x},${y})`;
								})

		if(this.voronoi_centers) {
			////console.log(this.samples)
			let w=this.WIDTH-(this.margins.left+this.padding.left+this.margins.right+this.padding.right);
			this.voronoi.clipExtent([[-2, -2], [w + 2, this.HEIGHT + 2]]);
			//this.cell.attr("transform",`translate(${this.margins.left+this.padding.left},${this.margins.top})`)
			this._resample(10);
		}
	}
	_resize() {
		////console.log("RESIZEEEEEE",this.options.index)

		let bbox=this.svg.node().getBoundingClientRect(),
			WIDTH=bbox.width,
			HEIGHT=bbox.height;

		this.WIDTH=WIDTH;
		this.HEIGHT=HEIGHT;

		let viewport=getViewport();
		this.options.isSmallScreen=viewport.width<740;

		/*
		this.margins.left=this.options.isSmallScreen?5:30;
		this.margins.right=this.options.isSmallScreen?5:30;
		
		this.padding.left=this.options.isSmallScreen?0:50;
		this.padding.right=this.options.isSmallScreen?0:30;
		*/

		let w=WIDTH-(this.margins.left+this.padding.left+this.margins.right+this.padding.right),
			h=HEIGHT-(this.margins.top+this.padding.top+this.margins.bottom+this.padding.bottom);

		this.xscale.range([0,w])
		
		
		this._update()

	}
	_getElementPosition(el) {

		//console.log("getElementPosition",el);

		var parentRect = el.parentNode.getBoundingClientRect(),
    		elemRect = el.getBoundingClientRect(),
    		offset   = {
    			top:elemRect.top - parentRect.top,
    			left:elemRect.left - parentRect.left
    		}
    	//console.log(offset)
    	return offset;
		
	}
	_scrollTween(offset) {
		return function() {
			var i = d3.interpolateNumber(window.pageYOffset || document.documentElement.scrollTop, offset);
			return function(t) { scrollTo(0, i(t)); };
		};
	}
}