import Column from './Column'
export default class Row extends Column {


	_buildVisual() {
		let self=this;

		this.margins={
			top:10,
			left:30,
			bottom:10,
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

		this.svg = row
					.append("svg")
					/*.on("mousemove",function(){
						let coords=d3.mouse(this),
							x=coords[0]-(self.margins.left+self.padding.left)

						console.log(x,self.xscale.invert(x))
					})*/



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
				.attr("x2",this.xscale(100)+this.padding.left)
				.attr("y2",0)
		line
			.append("text")
				.attr("class","zero")
				.attr("x",this.padding.left-3)
				.attr("y",4)
				.text("0%")
		line
			.append("text")
				.attr("class","hundred")
				.attr("x",this.xscale(100)+this.padding.left+3)
				.attr("y",4)
				.text("100%")

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
							console.log(d)
							return this.xscale(d.question.actual)
						})
						.attr("y2",(d)=>{
							return this.yscale("actual")+this.padding.top
						})
						.style("stroke",(d)=>{
							return this.colorscale(d.question["difference (mean-actual)"]);
						})
		this.samples=[];

		let mean=this.country.append("g")
								.attr("class","value")
								.attr("transform",(d)=>{
									let x=this.xscale(d.question.mean),
										y=this.yscale("mean")+this.padding.top;

									this.samples.push([x,y])

									return `translate(${x},${y})`;
								});
		mean.append("circle")
					.attr("cx",0)
					.attr("cy",0)
					.attr("r",3)

		mean.append("text")
					.attr("x",0)
					.attr("y",(d)=>{
						return (d.country===this.options.country || d.country==="YOU")?-26:-10
					})
					.text(function(d){
						return d.country+" "+d.question.mean+"%";
					})

		mean
			.filter((d)=>{
				return d.country===this.options.country || d.country==="YOU"
			})
			.append("line")
				.attr("class","selected-country")
				.attr("x1",0)
				.attr("x2",0)
				.attr("y1",-6)
				.attr("y2",-22)

		let actual=this.country.append("g")
								.attr("class","value")
								.attr("transform",(d)=>{
									let x=this.xscale(d.question.actual),
										y=this.yscale("actual")+this.padding.top;

									this.samples.push([x,y])

									return `translate(${x},${y})`;
								});
		actual.append("circle")
					.attr("cx",0)
					.attr("cy",0)
					.attr("r",3)

		actual.append("text")
					.attr("x",0)
					.attr("y",(d)=>{
						return (d.country===this.options.country || d.country==="YOU")?36:16
					})
					//.attr("y",16)
					.text(function(d){
						return d.country+" "+d.question.actual+"%";
					})
		actual
			.filter((d)=>{
				return d.country===this.options.country || d.country==="YOU"
			})
			.append("line")
				.attr("class","selected-country")
				.attr("x1",0)
				.attr("x2",0)
				.attr("y1",6)
				.attr("y2",24)

		this.cell = this.svg.append("g")
					    .attr("class", "voronoi")
					    .attr("transform",`translate(${this.margins.left+this.padding.left},${this.margins.top})`)
					  	.selectAll("g");

		this._resample(80);

		
		

	}
	highlightCountry(countries) {
		this.country
			.classed("highlight",(c)=>{
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