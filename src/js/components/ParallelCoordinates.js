import Column from './Column';
import Row from './Row';
import { getViewport } from '../lib/detect'

export default class ParallelCoordinates {

	constructor(data,options) {

		this.options=options;
		this.data=data;

		console.log("ParallelCoordinates",this.options,this.data)
		/*
		this.you={
			country:"YOU",
			questions:(["1","2","3","4","7","7b","8","9","10","11","12","13"]).map((d)=>{
				let c=this.data.find((c)=>{return c.country==this.options.country}),
					a=c.questions.find((q)=>{return c.question===d}).actual,
					m=this.options.you,
					diff=m-a;
				return {
					actual:a,
					mean:m,
					"difference (mean-actual)":diff,
					question:d
				}
				
			})
		}
		*/
		//console.log("YOU",this.you)

		this.rows={};

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

		let viewport=getViewport(),
			isSmallScreen=viewport.width<740;

		let pc=this.container.append("div")
					.attr("class","parallel-coordinates");

		let column=pc.selectAll("div."+(rows?"row":"column"))
				.data(this.options.questions.filter((d,i)=>{
					return 1;
					return d==="1";//1;//i<1;
				}).sort((a,b)=>{
					//console.log(":::::::",a,b)
					return a.index-b.index
				}))
				.enter()
				.append("div")
					.attr("class",rows?"row":"column")
					.attr("rel",(d)=>{
						return d;
					})
					.each(function(d){
						if(rows) {
							/*let q=self.options.questions.find((q)=>{
											return q.id==d;
										});*/
							//console.log("Q!!!!",q,d)
							self.rows[d.id]=new Row(self.data,
									{
										container:this,
										index:d.index,//(d3.values(self.rows).length),
										last:d.index===self.options.questions.length-1,
										//qs:self.options.questions,
										//l:self.options.questions.length,
										question:d,
										visible:d.id===self.options.question,
										extents:self.extents,
										country:self.options.country,
										country_info:self.options.country_info,
										isSmallScreen:isSmallScreen,
										nextCallback:function(index,info){
											//console.log("INFO INFO INFO",info)
											self.options.nextCallback(index,info)
										}//self.options.nextCallback
									}
								)	
						}
						
					})
	}

	nextQuestion(qid) {
		this.options.question=qid;
		this.rows[qid].show();
	}

}