import Column from './Column'
export default class Row extends Column {


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

		

		let row=this.container;

		row.append("div")
				.attr("class","q-title")
				.append("p")
					.text((d,i)=>{
						//return this.options.question.id+" "+this.options.question.question
						return this.options.question.id+" "+this.options.question.question
					})

		let chart_container=row.append("div")
									.attr("class","chart-container")

		this.svg = chart_container
					.append("svg")
					/*.on("mousemove",function(){
						let coords=d3.mouse(this),
							x=coords[0]-(self.margins.left+self.padding.left)

						console.log(x,self.xscale.invert(x))
					})*/
		/*
		this.topTooltip=new Tooltip({
					    	container:chart_container.node(),
					    	margins:{
					    		top:0,
					    		left:this.margins.left,
					    		right:0,
					    		bottom:0
					    	},
					    	padding:"10px 2px",
					    	width:150,
					    	html:"<ul></ul><h4></h4>"
					    });*/

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
    	

		let line=this.svg.selectAll("g.line")
					.data(["mean","actual"])
					.enter()
					.append("g")
					.attr("class","line")
					.attr("transform",(d)=>{
						let x=this.margins.left,
							y=this.yscale(d)+this.margins.top+this.padding.top;
						return `translate(${x},${y})`;
					})

		line
			.append("line")
				.attr("class","bg")
				.attr("x1",this.padding.left)
				.attr("y1",0)
				.attr("x2",this.xscale.range()[1]+this.padding.left)
				.attr("y2",0)
		line
			.append("text")
				.attr("class","zero")
				.attr("x",this.padding.left-3)
				.attr("y",4)
				.text((this.options.question.range?this.options.question.range[0]:"0")+(this.options.question.units||""))
		line
			.append("text")
				.attr("class","hundred")
				.attr("x",this.xscale.range()[1]+this.padding.left+3)
				.attr("y",4)
				.text((this.options.question.range?this.options.question.range[1]:"100")+(this.options.question.units||""))
				//.text("100%")

		line
			.append("text")
				.attr("class","title")
				.attr("x",this.padding.left-3-25)
				.attr("y",4)
				.text((d)=>{
					return (d==="mean"?"Answer":"Actual");
				})


		this.country=this.svg
						.append("g")
							.attr("class","countries")
							.attr("transform",`translate(${this.margins.left+this.padding.left},${this.margins.top})`)
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
					.attr("r",4)
					.attr("class",(d)=>{
						return this._getCountryArea(d.country)
					})
		
		this.mean
			/*.filter((d)=>{
				
				let same=this.data.filter((c)=>{
					return d.question.mean===c.question.mean;
				}).sort((a,b)=>{
					return b.question.actual - a.question.actual;
				}).map(c => c.country);

				return same.indexOf(d.country)===0;
			})*/
			.append("text")
					.attr("class","country-value")
					.attr("x",-2)
					.attr("y",(d)=>{
						return -10;
						return (d.country===this.options.country || d.country==="YOU")?-26:-10
					})
					.text((d)=>{
						return d.question.mean+(this.options.question.units||"");
					})

		this.mean.append("text")
					.attr("class","country-name")
					.attr("x",2)
					.attr("y",(d)=>{
						/*
						let same=this.data.filter((c)=>{
							return d.question.mean===c.question.mean;
						}).sort((a,b)=>{
							return b.question.actual - a.question.actual;
						}).map(c => c.country);

						//console.log("MEAN!!!",same)
	
						return -25 - 15 * same.indexOf(d.country)
						*/
						return -10;
						return (d.country===this.options.country || d.country==="YOU")?-26:-25
					})
					.text(function(d){
						return d.country;
					})
					.each(function(d){
						d.width=this.getBBox().width+45+3*2
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
			.append("line")
				.attr("class","c")
				.attr("x1",0)
				.attr("x2",0)
				.attr("y1",-6)

		this.actual=this.country.append("g")
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
						return this._getCountryArea(d.country)
					})

		this.actual
			/*.filter((d)=>{
				
				let same=this.data.filter((c)=>{
					return d.question.actual===c.question.actual;
				}).sort((a,b)=>{
					return b.question.mean - a.question.mean;
				}).map(c => c.country);
				
				return same.indexOf(d.country)===0;
			})*/
			.append("text")
					.attr("class","country-value")
					.attr("x",-2)
					.attr("y",(d)=>{
						return 18;
						return (d.country===this.options.country || d.country==="YOU")?-26:-10
					})
					.text((d)=>{
						return d.question.actual+(this.options.question.units||"");
					})
					

		this.actual.append("text")
					.attr("class","country-name")
					.attr("x",2)
					.attr("y",(d)=>{
						/*
						let same=this.data.filter((c)=>{
							return d.question.actual===c.question.actual;
						}).sort((a,b)=>{
							return b.question.mean - a.question.mean;
						}).map(c => c.country);

						console.log(d.question.actual,same)

						return 16 + 15 + 15 * same.indexOf(d.country)
						*/
						return 18;
						return (d.country===this.options.country || d.country==="YOU")?32:32
					})
					.text(function(d){
						return d.country;
					})
					.each(function(d){
						d.width=this.getBBox().width+45+3*2
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
			.append("line")
				.attr("class","c")
				.attr("x1",0)
				.attr("x2",0)
				.attr("y1",6)

		this.cell = this.svg.append("g")
					    .attr("class", "voronoi")
					    .attr("transform",`translate(${this.margins.left+this.padding.left},${this.margins.top})`)
					  	.selectAll("g");

		this._resample(80);

		
		

	}
	highlightCountry(countries) {

		let __countries=this.data.filter((c)=>{
							return countries.indexOf(c.country)>-1
						})
						//.map((c)=>c.country)

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
			return a.x_mean - b.x_mean;
		})
		this.mean
				.filter((d)=>(__countries.map((d)=>(d.country)).indexOf(d.country)>-1))
				.classed("hidden-value",(d,i)=>{
					return i>0 && __countries[i-1].x_mean===d.x_mean;
					return i>0 && __countries.map((d)=>(d.country)).indexOf(d.country)>0 && __countries[i].x_mean===d.x_mean
				})
				.selectAll("text")
					.attr("dy",function(d,i){
						let dy=-18,
							y=0;
						if(i>0) {
							return dy*prev_mean.y;
						}
						
						let prev;
						__countries.forEach((c,i)=>{
							if(c.country===d.country) {
								prev=i-1;
							}
						})

						//console.log(d.country,"prev is",prev,__countries[prev])

						if(prev>-1) {
							prev=__countries[prev];
							if(prev.x_mean+prev.width>d.x_mean) {
								prev_mean.y++;
							} else {
								prev_mean.y--;
							}
						} else {
							prev_mean.y=0;
						}

						prev_mean.y=prev_mean.y<0?0:prev_mean.y;

						d.dy_mean=dy*prev_mean.y;

						return dy*prev_mean.y;
					})

		this.mean
				.filter((d)=>(__countries.map((d)=>(d.country)).indexOf(d.country)>-1))
				.select("line.c")
					.attr("y2",(d)=>(d.dy_mean-16))

		__countries=__countries.sort((a,b)=>{
			return a.x_actual - b.x_actual;
		});
		this.actual
				.filter((d)=>(__countries.map((d)=>(d.country)).indexOf(d.country)>-1))
				.classed("hidden-value",function(d,i){
					if(i>0) {
						console.log(d.country,"--",__countries[i-1].country,__countries[i-1].x_actual,"===",d.x_actual)
					}
					return i>0 && __countries[i-1].country!== d.country && __countries[i-1].x_actual===d.x_actual;
					if(__countries.length>1 && i>0 && __countries.map((d)=>(d.country)).indexOf(d.country)>0 && __countries[i-1].x_actual===d.x_actual) {
						console.log("HIDDEN VALUE",d.country,__countries[i-1].x_actual,"===",d.x_actual)
						console.log(this)
					} else {
						console.log(d.country,"NOT HIDDEN");
					}
					
					return i>0 && __countries.length>1 && __countries.map((d)=>(d.country)).indexOf(d.country)>0 && __countries[i-1].x_actual===d.x_actual
				})
				.selectAll("text")
					.attr("dy",function(d,i){
						let dy=18,
							y=0;

						if(i>0) {
							return dy*prev_actual.y;
						}
						
						let prev;
						__countries.forEach((c,i)=>{
							if(c.country===d.country) {
								prev=i-1;
							}
						})

						//console.log(d.country,"prev is",prev,__countries[prev])

						if(prev>-1) {
							prev=__countries[prev];
							if(prev.x_actual+prev.width>d.x_actual) {
								prev_actual.y++;
							} else {
								prev_actual.y--;
							}
						} else {
							prev_actual.y=0;
						}

						prev_actual.y=prev_actual.y<0?0:prev_actual.y;

						d.dy_actual=dy*prev_actual.y;

						return dy*prev_actual.y;
					})
		this.actual
				.filter((d)=>(__countries.map((d)=>(d.country)).indexOf(d.country)>-1))
				.select("line.c")
					.attr("y2",(d)=>(d.dy_actual+16))


		this.country
			.classed("highlight",(c)=>{
				//console.log(c.country,countries.indexOf(c.country)>-1,countries)
				return countries.indexOf(c.country)>-1;
			})
			.filter((c)=>{
				return (countries.indexOf(c.country)>-1) || (c.country === this.options.country)
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

}