export default class Column {

	constructor(data,options) {
		console.log(data,options);

		

		

		this.options=options;
		this.question=options.question;

		this.data=this._filterData(data);
		console.log(this.data)

		this._setExents(this.data);
		console.log(this.extents)

		this.container=d3.select(options.container)

		this._buildVisual();
	}

	_buildVisual() {

	}
	_setExents() {
		this.extents={
			values:[0,100],
			mean:d3.extent(this.data,function(d){
				return d.question.mean
			}),
			actual:d3.extent(this.data,function(d){
				return d.question.actual
			}),
			_difference:d3.extent(this.data,function(d){
				return d.question["difference (mean-actual)"]
			}),
			diff_min:Math.abs(d3.min(this.data,function(d){
							return d.question["difference (mean-actual)"]
						})),
			diff_max:Math.abs(d3.max(this.data,function(d){
							return d.question["difference (mean-actual)"]
						})),
			difference:[-this.options.extents.difference,0,this.options.extents.difference]
		}
		//this.extents.difference=[-d3.max([this.extents.diff_min,this.extents.diff_max]),0,d3.max([this.extents.diff_min,this.extents.diff_max])]
		//this.extents.difference=[this.options.max_difference]
	}
	_filterData(data) {
		return data.map((d)=>{

			return {
				country:d.country,
				question:d.questions.find((q)=>{
					return +q.question === +this.question.id
				})
			}

		}).filter((d)=>{
			//console.log("------>",d)
			return !isNaN(d.question.mean) && !isNaN(d.question.actual)
		})
	}
}