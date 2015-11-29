//import Tooltip from './Tooltip';

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

		

        window.addEventListener("optimizedResize", () => {
            this._resize();
        });

		this._buildVisual();
	}
	_resize() {
		
	}
	_buildVisual() {

	}
	_setExents() {
		this.extents={
			values:this.options.question.range || [0,100],
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
			//console.log(this.question)
			return {
				country:d.country,
				question:d.questions.find((q)=>{
					return q.question === this.question.id
				})
			}

		}).filter((d)=>{
			//console.log("------>",d)
			return !isNaN(d.question.mean) && !isNaN(d.question.actual)
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
		//console.log(country)
		//console.log(region_codes[this.options.country_info[country]["region-code"]])

		if(sub_region_codes[this.options.country_info[country]["sub-region-code"]]) {
			return sub_region_codes[this.options.country_info[country]["sub-region-code"]]
		}
		
		return region_codes[this.options.country_info[country]["region-code"]]
	}
}