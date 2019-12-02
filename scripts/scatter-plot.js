var scatter_plot = {
	cnt: null,
	brushnum: 0,
    initialize: function(){
        var scatterPlot1Width = $('#scatter-plot1-svg').width();
        var scatterPlot1Height = $('#scatter-plot1-svg').height();
        var margin = {top: 10, right: 40, bottom: 50, left: 40},
            width = scatterPlot1Width - margin.left - margin.right,
            height = scatterPlot1Height - margin.top - margin.bottom;
		self.cnt=new Array(0,0,0,0,0);	
		var x = d3.scaleLinear()
                  .range([0, width]);
				  
		var y = d3.scaleLinear()
				  .range([height, 0])
					  
        var svg = d3.select("#scatter-plot1-svg").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        var g1=svg.append("g")
            .attr('id', 'scatter-plot-g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		var tooltip = d3.select("body")  
							.append("div")  
							.attr("class","tooltip1")  
							.style("opacity",0.0); 
		
		var Type=new Array("喜剧","动作","爱情","剧情","悬疑","家庭","惊悚","奇幻",
		                       "古装","音乐","歌舞","恐怖","冒险","同性","动画",
							   "武侠","儿童","历史","战争","运动","科幻","犯罪");
		var Award=new Array("金鸡奖","百花奖","金马奖","金像奖");
        d3.tsv("datasets/finaldata.tsv", function(error, dataset) {
            if (error) throw error;
		    dataset.forEach(function(d,i) {
			    d.id=i;
			    if(d.award==0)
				{
					d.power=0;
					d.award="None";
				}
				else
				{
					d.award=d.award.toString();
					d.award=d.award.split(',');
					d.power=d.award.length;
					var str="";
					for(var i=0;i<d.award.length-1;i++)
					{
						str=str+Award[d.award[i]-1]+', ';
					}
					str=str+Award[d.award[d.award.length-1]-1];
					d.award=str;
				}
			    d['box office']=+d['box office'];
				//d['box office']=Math.log(d['box office']);
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
			

			x.domain([0,Math.log(d3.max(dataset,function(d){
				return d['box office'];
			}))]);
			
		    y.domain([0,10]);
			   			  		
			/* var color1 = d3.scaleOrdinal(d3.schemeCategory20c)
						  .domain([0, 20]);
			var colornew=new Array();
			for(var i=0;i<7;i++)
			{
				colornew.push(color1(i*3));
			} */
			//console.log(colornew);
			var colornew=["#FFC125", "#beaed4", "#EE6363", "#32CD32"];
			var color = d3.scaleOrdinal()
					.domain(d3.range(typeset.length))
					.range(colornew);
			// var xAxis = d3.axisBottom(x);

			// var yAxis = d3.axisLeft(y);

			var xAxis = d3.axisBottom(x);


			var yAxis = d3.axisLeft(y);
			
			//x轴
            g1.append("g")
               .attr("class", "x axis")
               .attr("transform", "translate(0," + height + ")")
               .call(xAxis)

            g1.append("text")
               //.attr("class", "label")
               .attr("x", width+35)
               .attr("y", height-5)
               .style("text-anchor", "end")
               .text("ln(box office)");
			   
            //y轴
            g1.append("g")
               .attr("class", "y axis")
               .call(yAxis);
 
            g1.append("text")
               //.attr("class", "label")
               .attr("transform", "rotate(-90)")
			   .attr("x",0)
               .attr("y", 6)
               .attr("dy", ".71em")
               .style("text-anchor", "end")
               .text("rate") 

            var g2=svg.append("g")
			   .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			   .selectAll(".dot")
               .data(dataset)
               .enter()
               .append("circle")
               .attr("class", "dot")
               .attr("id", function(d,i){
                    return 'dot_'+d.id;
               })
               .attr("r", function(d){return (d.power)*2+3})
               .attr("cx", function(d) { return x(Math.log(d['box office'])); })
               .attr("cy", function(d) { return y(d.rate); })
               .style("fill", function(d) { return color(d.type); })		   
			   .on("mouseover",function(d){ 
					d3.select("#dot_"+d.id)
						.transition()
						.duration(200)
						.style("stroke-width","2px")
						.style("stroke","black");									
					tooltip.transition()
						.duration(200)
						.style("opacity",0.85);
					tooltip.html("title: "+"《"+d.title+"》<br/>"
									+"rate: "+d.rate+"<br/>"
									+"box office: "+d['box office']+"million<br/>"
									+"showtime: "+d['showtime']+"<br/>"
									+"award: "+d['award'])
						.style("left",(d3.event.pageX-60)+"px")
						.style("top", (d3.event.pageY + 20) + "px"); 
			   })
			   .on("mouseout",function(d){ 
					d3.select("#dot_"+d.id)
						.transition()
						.duration(500)
						.style("stroke-width","0px")
						//.style("stroke","black");	
				    tooltip.transition()
						.duration(500)
						.style("opacity",0.0); 
			   })
			   .on("click",function(d,i){ 
					console.log("click"+i); 
               		node_link.draw(i);
           	   });
			  
			var brush = d3.brush()
						.extent([[0,0],[width,height]])
						.on('start',brushstart)
						.on('brush',brushmove)
						.on('end',brushend);
			self.brushnum=0;
			g1.append("g").call(brush);
			var brushCell;
			var selectArray = new Array();
			// Clear the previously-active brush, if any.
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
				var xmin=e[0][0],xmax=e[1][0];
				var ymin=e[0][1],ymax=e[1][1];
				d3.selectAll('.dot')
					.style('fill',function(d){
						return color(d.type);
					});
				selectArray = new Array();
				d3.selectAll('.dot')
					.style('fill',function(d) {
						  var x = d3.select(this).attr('cx');
						  var y = d3.select(this).attr('cy');
						  var circleId = d3.select(this).attr('id');
						  if(x>=xmin&&x<=xmax&&y>=ymin&&y<=ymax)
						  {
							d3.select(this).classed('circle-hidden', false);
							var ii=0;
							for(ii=0;ii<selectArray.length;ii++)
							{
								if(d.id==selectArray[ii].id)
									break;
							}
							if(ii>=selectArray.length)
							{
							  selectArray.push(d);
							}
						  }
						  else
						  {
							d3.select(this).classed('circle-hidden', true);
						  }
						  return color(d.type);
					});
				self.brushnum++;
				movie_histogram.update(selectArray);
            }
            // If the brush is empty, select all circles.
            function brushend() {
				var e=d3.event.selection;
				if(e != null)
				{
				  var xmin=e[0][0],xmax=e[1][0];
				  var ymin=e[0][1],ymax=e[1][1];
				  if(((xmax - xmin) < 3)&&((ymax - ymin) < 3))
				  {
					  svg.selectAll(".circle-hidden").classed("circle-hidden", false);
					  selectArray = new Array(); 
				  }
				}
				else
				{
				  svg.selectAll(".circle-hidden").classed("circle-hidden", false);
				  selectArray = new Array(); 
				}
				self.brushnum++;
				movie_histogram.update(selectArray);
            }
			
			var ifnew=0;
			var select1_dot=new Array();
			var select2_dot=new Array();
			var g3=svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + (margin.top + height+20) + ")")
			g3.append("text")
			      .attr("x", 0)
				  .attr("y", 22)
				  .style("text-anchor", "begin")
				  .text("Type :");
			for(var i=0;i<typeset.length;i++)
			{
				g3.append("circle")
				  .attr("id","type_"+i)
				  .attr("cx",70+i*80)
				  .attr("cy",17)
				  .attr("r","10px")
				  .attr("fill",color(i))
				  .on("mouseover",function(){ 
						d3.select(this)
							.transition()
							.duration(200)
							.style("stroke-width","2px")
							.style("stroke","black");									
				   })
				   .on("mouseout",function(){ 
						d3.select(this)
							.transition()
							.duration(500)
							.style("stroke-width","0px")
				   })
				  .on("click",function(){
					  var typeid=d3.select(this).attr("id");
					  var index=parseInt(typeid[typeid.length-1]);
					  var selectArray = new Array();
					  if(self.brushnum!=ifnew)
					  {
							ifnew=self.brushnum;
							select1_dot=new Array();
					  }
					  d3.selectAll('.dot')
						.filter(function(o){
							if(d3.select(this).attr("class")=='dot')
							{
								var ii=0;
								for(ii=0;ii<select1_dot.length;ii++)
								{
									if(o.id==select1_dot[ii].id)
									break;
								}
								if(ii>=select1_dot.length)
								{
									select1_dot.push(o);
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
							for(ii=0;ii<select1_dot.length;ii++)
							{
								if(o.id==select1_dot[ii].id)
								break;
							}
							if(ii<select1_dot.length)
							{
								return true;
							}
							else return false;	
						})					
						.classed('circle-hidden',function(d) {				
							  var type=parseInt(d.type);
							  console.log(index);
							  console.log(type);
							  if(type==index)
							  {	
								selectArray.push(d);
								return false;
							  }
							  else
							  {
								return true;
							  } 
						});
					  movie_histogram.update(selectArray);
				  });
				g3.append("text")
				  .attr("x", 84+i*80)
				  .attr("y", 22)
				  .style("text-anchor", "begin")
				  .text(Type[typeset[i]]);
			}	
			
			d3.selectAll("input")
				.on("change", changed);
			
			function changed() {
				for(var i=0;i<5;i++)
				{
					if (this.value === i.toString())
					{
						self.cnt[i]++;
					}
				}
				var powerlist=new Array();
				for(var i=0;i<5;i++)
				{
					if (self.cnt[i]%2 == 1)
					{
						powerlist.push(i);
					}
				}
				if(powerlist.length==0)
					powerlist=new Array(0,1,2,3,4)
				for(var i=0;i<5;i++)
				{
					var typeid=d3.select(this).attr("id");
					var index=parseInt(typeid[typeid.length-1]);
					if(self.brushnum!=ifnew)
					{
						ifnew=self.brushnum;
						select2_dot=new Array();
					}
					var selectArray = new Array();
					d3.selectAll('.dot')
						.filter(function(o){
							if(d3.select(this).attr("class")=='dot')
							{
								var ii=0;
								for(ii=0;ii<select2_dot.length;ii++)
								{
									if(o.id==select2_dot[ii].id)
									break;
								}
								if(ii>=select2_dot.length)
								{
									select2_dot.push(o);
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
							for(ii=0;ii<select2_dot.length;ii++)
							{
								if(o.id==select2_dot[ii].id)
								break;
							}
							if(ii<select2_dot.length)
							{
								return true;
							}
							else return false;	
						})					
						.classed('circle-hidden',function(d) {				
							var power=parseInt(d.power);
							if(powerlist.indexOf(power)!=-1)
							{	
								selectArray.push(d);
								return false;
							}
						    else
							{
								return true;
							} 
						});
					movie_histogram.update(selectArray);
				}
			}
			
        });
    }
}
