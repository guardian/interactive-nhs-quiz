import Column from './Column';
import Row from './Row';

export default class ParallelCoordinates {

	constructor(data,options) {

		this.options=options;
		this.data=data;

		console.log(this.data[0])

		this.you={
			country:"YOU",
			questions:(["1","2","3","4","7","8","9","10","11","12","13"]).map((d)=>{
				let c=this.data.find((c)=>{return c.country=="Italy"}),
					a=d3.round(Math.random()*100),//c.questions.find((q)=>{return c.question===d}).actual,
					m=d3.round(Math.random()*100),
					diff=m-a;
				return {
					actual:a,
					mean:m,
					"difference (mean-actual)":diff,
					question:d
				}
				
			})
		}
		//console.log("YOU",this.you)

		this.container=d3.select(options.container)
		this._setExtents();
		this._buildChart(true);
	}
	_setExtents() {

		console.log(this.data)
		let diffs=[];
		this.data.forEach(function(d){
			//console.log(d)
			d.questions.forEach(function(q){
				diffs.push(q["difference (mean-actual)"])
			})
		})

		this.extents={
			difference:d3.max(d3.extent(diffs).map((d)=>{return Math.abs(d);}))
		}

	}
	_buildChart(rows) {
		let self=this;

		let pc=this.container.append("div")
					.attr("class","parallel-coordinates");

		let column=pc.selectAll("div."+(rows?"row":"column"))
				.data(this.options.questions_data.filter((d,i)=>{
					return 1;
					return d==="7b";//1;//i<1;
				}))
				.enter()
				.append("div")
					.attr("class",rows?"row":"column")
					.attr("rel",(d)=>{
						return d;
					})
					.each(function(d){
						if(rows) {
							new Row(self.data,{ //.concat([self.you])
								container:this,
								question:self.options.questions.find((q)=>{
									return q.id==d;
								}),
								extents:self.extents,
								country:self.options.country,
								country_info:self.options.country_info
							})	
						}
						
					})
	}

}