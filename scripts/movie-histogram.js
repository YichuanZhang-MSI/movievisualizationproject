var movie_histogram = {
	x: null,
    y: null,
	color: null,
    height: 0,
    margin: null,
	startyear: 0,
	endyear: 0,
	typenum: 0,
	rectwidth: 0,
	upnum:0,
    initialize: function(){
        var self = this;
        var movieHistogramWidth = $('#movie-histogram-svg').width();
        var movieHistogramHeight = $('#movie-histogram-svg').height();
        var margin = {top: 10, right: 40, bottom: 50, left: 40},
            width = movieHistogramWidth - margin.left - margin.right,
            height = movieHistogramHeight - margin.top - margin.bottom;
		self.margin = margin;
        self.height = height;
        var svg = d3.select("#movie-histogram-svg")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        var g1=svg.append("g")
            .attr('id', 'movie-histogram-g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		
		var Type=new Array("喜剧","动作","爱情","剧情","悬疑","家庭","惊悚","奇幻",
		                       "古装","音乐","歌舞","恐怖","冒险","同性","动画",
							   "武侠","儿童","历史","战争","运动","科幻","犯罪");
							   
        d3.tsv("datasets/finaldata.tsv", function(error, dataset) {
			if (error) throw error;
			dataset.forEach(function(d,i) {
			    d.id=i;
				d.showtime=+d.showtime;
			    d.award=+d.award;
			    d['box office']=+d['box office'];
			    d.rate=+d.rate;
			    d.category=(d.category).split('/');
			    if(d.category.length==1)
				{
					for(var i=0;i<Type.length;i++)
					{
						if(Type[i]==d.category[0])
						{
							d.type=i;
							break;
						}
					}
				}
			    else
			    {
				    if(d.category[0]!='剧情')
					{
						for(var i=0;i<Type.length;i++)
						{
							if(Type[i]==d.category[0])
							{
								d.type=i;
								break;
							}
						}
					}
				    else 
					    for(var i=0;i<Type.length;i++)
						{
							if(Type[i]==d.category[1])
							{
								d.type=i;
								break;
							}
						}
			    }
            });
		    
			var typeset=new Array();
			for(var i=0;i<dataset.length;i++)
			{
				if(typeset.indexOf(dataset[i].type) == -1)
				{
					typeset.push(dataset[i].type);
				}
			}
			typeset.sort(d3.ascending);
			
			for(var i=0;i<dataset.length;i++)
			{
				dataset[i].type=typeset.indexOf(dataset[i].type);
			}
			self.typenum=typeset.length;

			var range = d3.extent(dataset, function(d,i){
				return d.showtime;
			});
			self.startyear=range[0];
			self.endyear=range[1];
			var xz=new Array();			
			for(var i=0;i+range[0]<=range[1];i++)
			{
				xz.push(i+range[0]);
			}			
			var n=xz.length;
			var yz=new Array(typeset.length);
			for(var i=0;i<yz.length;i++)
			{
				yz[i] = new Array();
				for(var j=0;j<n;j++)
				{
					yz[i].push(0);
				}
			}			
			for(var i=0;i<dataset.length;i++)
			{
				var index1=dataset[i].showtime-range[0];
				var index2=dataset[i].type;
				yz[index2][index1]++;			
			}
			y01z = d3.stack().keys(d3.range(typeset.length))(d3.transpose(yz)),
			yMax = d3.max(yz, function(y) { return d3.max(y); }),
			y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); });
			/* console.log(dataset);
			console.log(xz);
			console.log(yz);
			console.log(y01z);
			console.log(yMax);
			console.log(y1Max); */

			var x = d3.scaleBand()
					.domain(xz)
					.rangeRound([0, width])
					.padding(0.3);

			var y = d3.scaleLinear()
					.domain([0, y1Max])
					.range([height, 0]);
			self.x=x;
			self.y=y;
			/* var color = d3.scaleOrdinal()
					.domain(d3.range(typeset.length))
					.range(d3.schemeCategory20c); */
			var colornew=["#FFC125", "#beaed4", "#EE6363", "#32CD32"];
			/* var color =d3.scaleOrdinal(d3.schemeCategory20c)
						  .domain([0, 20]); */
			var color = d3.scaleOrdinal()
					.domain(d3.range(typeset.length))
					.range(colornew);
			self.color=color;	
			var series = g1.selectAll(".series")
						  .data(y01z)						  
						  .enter().append("g")
						  .attr("class","series")
						  .attr("id",function(d,i) {return "series_"+i; })
						  .attr("fill", function(d, i) { return color(i); });

			var rect = series.selectAll("rect")
						  .data(function(d) { return d; })
						  .enter().append("rect")
						    .attr("class","bar")
							.attr("x", function(d, i) { return x(i+range[0]); })
							.attr("y", height)
							.attr("width", x.bandwidth())
							.attr("height", 0);
							
			self.rectwidth=x.bandwidth();
			rect.transition()
				.delay(function(d, i) { return i * 10; })
				.attr("y", function(d) { return y(d[1]); })
				.attr("height", function(d) { return y(d[0]) - y(d[1]); });
			
			var yAxis = d3.axisRight(y);		
			//y轴
            g1.append("g")
               .attr("class", "y axis")
			   .attr("transform", "translate("+ (width) +"," + 0 +")")
               .call(yAxis);
 
            g1.append("text")
               //.attr("class", "label")
               .attr("transform", "translate("+ (width-20) +"," + 0 +")"+"rotate(-90)")
			   .attr("x",0)
               .attr("y", 6)
               .attr("dy", ".71em")
               .style("text-anchor", "end")
               .text("number") 
			   
			g2=svg.append("g")
				.attr("transform", "translate("+ margin.left+"," + (height + margin.top) +")")
               .attr("class", "axis axis--x")
			   g2.call(d3.axisBottom(x)
					.tickSize(0)
					.tickPadding(6))
			    .selectAll("text")
				.attr("transform", "rotate(-30)")
				.style("text-anchor","end")
				.attr("dx",".5em")
				/*.style("writing-mode", "tb")
				.style("glyph-orientation-vertical", 0)				
				.attr("dy",".15em"); */			
			
			/* g2=svg.append("g")
				.attr("transform", "translate("+ margin.left+"," + (height + margin.top) +")") */
			var brush = d3.brushX()
						.on('start',brushstart)
						.on('brush',brushmove)
						.on('end',brushend);	
						
			g2.append("g")
			  .call(brush);
			
			/* g2=svg.append("g")
				.attr("class", "axis axis--x")
				.attr("transform", "translate("+ margin.left+"," + (height + margin.top) +")") */
			
			var ifnew=0;
			var brushCell;
			var selectArray = new Array();
			function brushstart() {
				if (brushCell !== this) {
					selectArray = new Array();
					svg.selectAll('.brush').call(brush);
					var selectArray = new Array();
					brushCell = this;
				}
			}
			// Highlight the selected circles.
			function brushmove() {
				var e=d3.event.selection;
				var xmin=e[0],xmax=e[1];
				if(d3.selectAll('.append-rect')['_groups'][0].length == 0)
				{
					d3.selectAll('.bar')
						.classed('rect-hidden',function(d) {
							  var x0 = parseInt(d3.select(this).attr('x'));
							  var x1 = parseInt(d3.select(this).attr('width'))+x0;
							  var x=(x0+x1)/2;
							  if(x<xmin || x>xmax)
							  {
								return true;
							  }
							  else
							  {
								return false;
							  }
						});
					d3.selectAll('.dot')
						.classed('circle-hidden',function(d) {				
							  var year=parseInt(self.x(parseInt(d.showtime)))+self.rectwidth/2;
							  if(year<xmin || year>xmax)
							  {						  
								return true;
							  }
							  else
							  {
								return false;
							  }
						});
				}
				else
				{
					d3.selectAll('.append-rect')
						.classed('rect-hidden',function(d) {
							  var x0 = parseInt(d3.select(this).attr('x'));
							  var x1 = parseInt(d3.select(this).attr('width'))+x0;
							  var x=(x0+x1)/2;
							  if(x<xmin || x>xmax)
							  {
								return true;
							  }
							  else
							  {
								return false;
							  }
						});
					if(self.upnum>ifnew)
					{
						select_dot=new Array();	
						ifnew=self.upnum;
					}
					d3.selectAll('.dot')
						.filter(function(o){
							if(d3.select(this).attr("class")=='dot')
							{
								var ii=0;
								for(ii=0;ii<select_dot.length;ii++)
								{
									if(o.id==select_dot[ii].id)
									break;
								}
								if(ii>=select_dot.length)
								{
									select_dot.push(o);
								}
								return true;
							}
							else
							{	
								return false;
							}
						})
					d3.selectAll('.dot')
						.filter(function(o){
							var ii=0;
							for(ii=0;ii<select_dot.length;ii++)
							{
								if(o.id==select_dot[ii].id)
								break;
							}
							if(ii<select_dot.length)
							{
								return true;
							}
							else return false;	
						})					
						.classed('circle-hidden',function(d) {				
							  var year=parseInt(self.x(parseInt(d.showtime)))+self.rectwidth/2;
							  if(year<xmin || year>xmax)
							  {								  
								return true;
							  }
							  else
							  {
								return false;
							  }
						});
				}
            }
            // If the brush is empty, select all circles.
            function brushend() {
				var e=d3.event.selection;
				if(d3.selectAll('.append-rect')['_groups'][0].length == 0)
				{
					if(e != null)
					{
					  var xmin=e[0][0],xmax=e[1][0];
					  if(((xmax - xmin) < 3)&&((ymax - ymin) < 3))
					  {
						  svg.selectAll(".rect-hidden").classed("rect-hidden", false);
						  d3.selectAll(".circle-hidden").classed("circle-hidden", false);
						  selectArray = new Array(); 
					  }
					}
					else
					{
					  svg.selectAll(".rect-hidden").classed("rect-hidden", false);
					  d3.selectAll(".circle-hidden").classed("circle-hidden", false);
					  selectArray = new Array(); 
					}  
				}
				else
				{
					if(e != null)
					{
						var xmin=e[0][0],xmax=e[1][0];
						if(((xmax - xmin) < 3)&&((ymax - ymin) < 3))
						{
							d3.selectAll('.append-rect')
								.filter(function(o){
									if(d3.select(this).attr("class")=='append-rect')
										return false;
									else
									{	console.log(d3.select(this).attr("class"));
										return true;
									}
								})
								.classed('rect-hidden',false);
						
							d3.selectAll('.dot')
								.filter(function(o){
									var ii=0;
									for(ii=0;ii<select_dot.length;ii++)
									{
										if(o.id==select_dot[ii].id)
										break;
									}
									if(ii<select_dot.length)
									{
										return true;
									}
									else return false;	
								})		
								.classed("circle-hidden", false);
							selectArray = new Array(); 
						}
					}
					else
					{
						d3.selectAll('.append-rect')
							.filter(function(o){
								if(d3.select(this).attr("class")=='append-rect')
									return false;
								else
								{	console.log(d3.select(this).attr("class"));
									return true;
								}
							})
							.classed('rect-hidden',false);			
						d3.selectAll('.dot')
							.filter(function(o){
								var ii=0;
								for(ii=0;ii<select_dot.length;ii++)
								{
									if(o.id==select_dot[ii].id)
									break;
								}
								if(ii<select_dot.length)
								{
									return true;
								}
								else return false;	
							})		
							.classed("circle-hidden", false);
							selectArray = new Array(); 
					}  
				}
			}
		});
    },
    update: function(select_object_array){
		var self = this;
	    var x = self.x;
		var y = self.y;
	    var color = self.color;
		var height = self.height;
		var margin = self.margin;
		var startyear = self.startyear;
		var endyear = self.endyear;
		var typenum=self.typenum;
		var g1 = d3.select("#movie-histogram-g");
		self.upnum=self.upnum+1;
		g1.selectAll(".append-series").selectAll(".append-rect").remove();
		g1.selectAll(".append-series").remove();
	    var xz=new Array();			
		for(var i=0;i+startyear<=endyear;i++)
		{
			xz.push(i+startyear);
		}				
		var n=xz.length;
		var yz=new Array(typenum);
		for(var i=0;i<yz.length;i++)
		{
			yz[i] = new Array();
			for(var j=0;j<n;j++)
			{
				yz[i].push(0);
			}
		}	
		for(var i=0;i<select_object_array.length;i++)
		{
			var index1=select_object_array[i].showtime-startyear;
			var index2=select_object_array[i].type;
			yz[index2][index1]++;			
		}
		y01z = d3.stack().keys(d3.range(typenum))(d3.transpose(yz)),
		yMax = d3.max(yz, function(y) { return d3.max(y); }),
		y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); });
        if(select_object_array.length != 0)
		{
			/* g1.selectAll(".bar")
			.attr("fill","steelblue")
			.attr("opacity",0.2); */
			d3.selectAll('.bar')
					.classed('rect-hidden',true);
		}
		else
		{
			/* for(var i=0;i<typenum;i++)
			{
				g1.select("#series_"+i)
				.attr("fill",color(i))
				.attr("opacity",0.9);
			} */
			d3.selectAll('.bar')
					.classed('rect-hidden',false);

		}
		
	    var appendSeries = g1.selectAll(".append-series")
							.data(y01z)							
							.enter().append("g")
							.attr("class","append-series")
							.attr("fill", function(d, i) { return color(i); });

	    var appendRect = appendSeries.selectAll(".append-rect")
						  .data(function(d) { return d; })						  
						  .enter().append("rect")
						  .attr("class","append-rect")
						  .attr("x", function(d, i) { return x(i+startyear); })
					      .attr("y", height)
						  .attr("width", x.bandwidth())
						  .attr("height", 0);

		appendRect.transition()
				.delay(function(d, i) { return i * 10; })
				.attr("y", function(d) { return y(d[1]); })
				.attr("height", function(d) { return y(d[0]) - y(d[1]); }); 
 		 
    }
}
