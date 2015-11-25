function Tooltip(options) {

	var w=options.width || 200,
		h=options.height || 110;

	//////////console.log("!!!!!!!!!!!",options)

	var LANG=options.lang;

	var tooltip=d3.select(options.container)
					.append("div")
						.attr("class","tooltip")

	var arrowBox=tooltip.append("div")
						.attr("class","arrow_box clearfix")
						.style("min-width",w+"px")

	if(options.padding) {
		arrowBox.style("padding",options.padding)
	}

	arrowBox.html(options.html);

	var tooltipTitle=arrowBox.select("h1")
								.attr("class","tooltip-title");
								
	var tooltipSubtitle=arrowBox.select("h4")
								.attr("class","tooltip-subtitle");

	var indicator;
	
		
	var ulist=arrowBox.select("ul");
	/*indicator=arrowBox.select("table")
					.selectAll("tr")
						.data(options.countries)
						.attr("rel",function(d){
							return d.key;
						})*/
			
	

	

	this.hide=function() {
		tooltip.classed("visible",false);
	};
	
	/*
	function build1Value(indicator,d,values,index) {
		var html="";
		if(index===0) {
			html+="<span class=\"country-name\">"+options.country_info[d.key][LANG].shortname+"</span>";
			if(values["Both"].value>-1) {
				html+="<span class=\"big-value\">"+values["Both"].value+"<i>"+options.fields_info[indicator].u+"</i>"+"<em>("+values["Both"].year+")</em></span>";
			} else {
				html+="<span class=\"big-value\">ND</span>";
			}
 			

		} else {
			html+="<span class=\"country-name\">"+options.country_info[d.key][LANG].shortname+"</span>";	
		}
		


		//console.log(indicator,d,values)

		return html;
	}
	function build3Value(indicator,d,values) {

		var html="";
		//console.log(options.fields_info)
		html+="<span class=\"country-name\">"+options.country_info[d.key][LANG].shortname+"</span>";

		if(values["Males"]) {
			html+="<div class=\"females\"><span>Females</span>"+(values["Females"].value>-1?(values["Females"].value+"<i>"+options.fields_info[indicator].u+"</i>"+"<em>("+values["Females"].year+")</em>"):"-")+"</div>"+"<div class=\"males\"><span>Males</span>"+(values["Males"].value>-1?(values["Males"].value+"<i>"+options.fields_info[indicator].u+"</i>"+"<em>("+values["Males"].year+")</em>"):"-")+"</div>"+"<div><span>Total</span>"+(values["Both"].value>-1?(values["Both"].value+"<i>"+options.fields_info[indicator].u+"</i>"+"<em>("+values["Both"].year+")</em>"):"-")+"</div>"	
		}
		if(values["Rural"]) {
			html+="<div class=\"rural\"><span>Rural</span>"+(values["Rural"].value>-1?(values["Rural"].value+"<i>"+options.fields_info[indicator].u+"</i>"+"<em>("+values["Rural"].year+")</em>"):"-")+"</div>"+"<div class=\"urban\"><span>Urban</span>"+(values["Urban"].value>-1?(values["Urban"].value+"<i>"+options.fields_info[indicator].u+"</i>"+"<em>("+values["Urban"].year+")</em>"):"-")+"</div>"+"<div><span>National</span>"+(values["National"].value>-1?(values["National"].value+"<i>"+options.fields_info[indicator].u+"</i>"+"<em>("+values["National"].year+")</em>"):"-")+"</div>"	
		}
		return html;
	}
	*/
	this.changeContainer=function(container) {
		
		container.node().appendChild(tooltip.node());
	}
	this.show=function(data,indicator,x,y,title,subtitle,max_width) {
		////console.log(x,y)
		//percentage.text(data.percentage+"%");
		//projection_value.text(data.total)
		//console.log(data)
		//console.log(title,subtitle)

		if(title) {
			tooltipTitle.text(title);	
		}
		if(subtitle) {
			tooltipSubtitle.text(subtitle);	
		}

		ulist.selectAll("li").remove();

		var countries=ulist.selectAll("li.country")
					.data(data);
		


		tooltip
			/*.classed("right",function(){
				if(options.small) {
					return 0;
				}
				if(!max_width) {
					return 0;
				}
				if(x+16+options.margins.left+w>max_width) {
					return 1;
				}
				return 0;
			})
			.classed("bottom",function(){
				return 1;//options.small;
			})*/
			/*.style({
				left:(x+16+options.margins.left)+"px",
				top:(y+options.margins.top-25)+"px"
			})*/
			.style("top",(y+options.margins.top+44)+"px")
			.style("left",function(){
				return (x+options.margins.left)+"px";
			})
			.classed("visible",true)
			
		
	};

}
