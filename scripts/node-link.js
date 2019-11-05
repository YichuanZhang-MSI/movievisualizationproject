var node_link = {
    draw: function(num){
        //var NodeLinkWidth = $('#node_link-svg').width();
        //var NodeLinkHeight = $('#node_link-svg').height();
		var margin = {top: 8, right: 15, bottom: 20, left: 40},
		    width = 210 - margin.left - margin.right,
		    height = 210 - margin.top - margin.bottom;
        /* var margin = {top: 10, right: 90, bottom: 110, left: 40},
            width = NodeLinkWidth - margin.left - margin.right,
            height = NodeLinkHeight - margin.top - margin.bottom; */
			
		d3.tsv("datasets/finaldata.tsv",function(error,file){
			if (error) throw error;
			//alert(file[num].director);
			d3.json("datasets/final.json",function(err,graph){
				if(err) throw err;
				var directors=file[num].director.split(" / ");
				//console.log(directors);
				var actors=file[num].actor.split("/");
				//alert(actors[1]);

				var DirectorForceLayoutJSONArray=[];
				//var DirectorForceLayoutJSONAll=[];
				var iter0;
				for(var iter0=0;iter0<directors.length;iter0++){
					var DirectorForceLayoutJSON={name:directors[iter0],actualnode:{},color:1,children:[]};
					file.forEach(function(z,num){
						var flag=false;
						var tmpdirectornames=z.director.split(" / ");
						for(var j=0;j<tmpdirectornames.length;j++){
							if(tmpdirectornames[j]==directors[iter0]){
								flag=true;
								var DirectorChildrenMovie={name:z.title,actualnode:z,color:2,collapse:1,children:[]};
								var tmpactornames=z.actor.split("/");
								var k;
								for(k=0;k<tmpactornames.length;k++){
									var MovieChildrenActor={name:tmpactornames[k],actualnode:{}};

									graph.nodes.forEach(function(d){
										//alert(MovieChildrenActor.name);
										if(d.name==MovieChildrenActor.name&&d.clas==2){

											MovieChildrenActor.actualnode=d;
										}
									})
								
									DirectorChildrenMovie.children.push(MovieChildrenActor);
								}
								DirectorForceLayoutJSON.children.push(DirectorChildrenMovie);
								break;
							}
						}
						
					})

					DirectorForceLayoutJSONArray.push(DirectorForceLayoutJSON);
				}
				//console.log(DirectorForceLayoutJSONArray);
				for(var i=1;i<DirectorForceLayoutJSONArray.length;i++){
					var t={name:"",actualnode:{},color:1,collapse:1,children:[]};
					t.name=DirectorForceLayoutJSONArray[i].name;
					t.actualnode=DirectorForceLayoutJSONArray[i].actualnode;
					var m=DirectorForceLayoutJSONArray[i].children.length;
					for(var j=0;j<m;j++){
						t.children.push(DirectorForceLayoutJSONArray[i].children[j]);
					}
					//t.children=DirectorForceLayoutJSONArray[i].children;
					DirectorForceLayoutJSONArray[0].children.push(t);
				}

				var DirectorForceLayoutAll=[];
				DirectorForceLayoutAll.push(DirectorForceLayoutJSONArray[0]);
				console.log(DirectorForceLayoutJSONArray);
				console.log(DirectorForceLayoutAll);

				
				//var DirectorGraphJSON={nodes:[],links:[]};
				//var ActorGraphJSON={nodes:[],links:[]};
				var DirectorGraphJSONArray=[];
				var ActorGraphJSONArray=[];

				//var AllGraphJSONArray=[];

				var directorID=[];
				var actorsID=[];

				for(var i=0;i<directors.length;i++){
					var DirectorGraphJSON={nodes:[],links:[]};
					var tmpdirector=graph.nodes.filter(function(a){
						return (a.name==directors[i])&&(a.clas==1);
					})[0];
					//alert(tmpdirector.id);
					directorID.push(tmpdirector.id);
					DirectorForceLayoutJSONArray[i].actualnode=tmpdirector;
					DirectorGraphJSON.nodes.push(tmpdirector);
					graph.links.forEach(function(d){
						if((d.source==tmpdirector.id)&&(graph.nodes[parseInt(d.target)-1].clas==2)){
							//&&(graph.nodes[parseInt(d.target)-1].id!=tmpdirector.id)){
							DirectorGraphJSON.links.push(d);
							DirectorGraphJSON.nodes.push(graph.nodes[parseInt(d.target)-1])
						}
					})

					DirectorGraphJSONArray.push(DirectorGraphJSON);
				}

				//console.log(DirectorGraphJSONArray);


				for (var i = 0; i <= actors.length - 1; i++) {
					var ActorGraphJSON={nodes:[],links:[]};
					var tmpactor=graph.nodes.filter(function(a){
						return (a.name==actors[i])&&(a.clas==2);
					})[0];
					//console.log(tmpactor);
					actorsID.push(tmpactor.id);
					ActorGraphJSON.nodes.push(tmpactor);
					graph.links.forEach(function(d){
						if((d.source==tmpactor.id)&&(graph.nodes[parseInt(d.target)-1].clas==1)){
							//&&(graph.nodes[parseInt(d.target)-1].id!=tmpactor.id)){
							ActorGraphJSON.links.push(d);
							ActorGraphJSON.nodes.push(graph.nodes[parseInt(d.target)-1]);
						}
					})
					ActorGraphJSONArray.push(ActorGraphJSON);
					//console.log(ActorGraphJSONArray);
					//AllGraphJSONArray.push(ActorGraphJSON);
				}
				//console.log(ActorGraphJSONArray);

				var linknum=[];
				for(var i=0;i<actors.length;i++){
					linknum.push(ActorGraphJSONArray[i].links.length);
				}
				//console.log(linknum);

				////////////////////////////开始画图///////////////////////

				var it;
				//var width0=$('#node_link-svg1').width();
				//var height0=$('#node_link-svg1').height();
				var width0=950;
				var height0=600;
				
				d3.selectAll("#diresvg").remove();

				var svgdirector = d3.select("#node_link-svg1").append("svg")
				 			.attr("id","diresvg")
							.attr("width", width0)
				 			.attr("height", height0);
							
				svgdirector.append("g")
						.append("text")
						.attr("x",width0/2)
						.attr("y",25)
						.style("font","15px KaiTi")
						.text("导演： "+file[num].director);
						
				var link=svgdirector.selectAll(".link");
				var node=svgdirector.selectAll(".node");

				var root=DirectorForceLayoutAll[0];
				//console.log(DirectorForceLayoutAll);
				//console.log(DirectorForceLayoutJSONArray[0]);
				root=d3.hierarchy(root);

				var nodeSvg,linkSvg, simulation, nodeEnter, linkEnter;

				simulation=d3.forceSimulation()
					.force("link", d3.forceLink().id(function(d) { return d.id; }).distance(function(d){return 20;}))
					.force("charge", d3.forceManyBody().strength(-200).distanceMax(100))
					.force("center", d3.forceCenter(width0 / 2, height0 / 2))
					.on("tick", ticked);

				update();




				function update() {
					var nodes=flatten(root);
					var links=root.links();
					//console.log(nodes);
				  // Restart the force layout.
				    simulation
				        .nodes(nodes)
				     
				    simulation.force("link")
				    	.links(links)

				  	linkSvg = svgdirector.selectAll(".link")
				  		.data(links, function(d) { return d.target.id; })

				  	linkSvg.exit().remove();

				  	linkEnter = linkSvg.enter()
				  	      .append("line")
				  	      .attr("class", "link")
				  	      .style("stroke-width",2)
				  	      .style("stroke","#666");

				  	linkSvg = linkEnter.merge(linkSvg);

				  	nodeSvg = svgdirector.selectAll(".node")
				  	    .data(nodes, function(d) { return d.id; })

				  	nodeSvg.exit().remove();

				  	nodeEnter = nodeSvg.enter()
				  	    .append("g")
				  	      .attr("class", "node")
				  	      .on("click", click)
				  	      .on("mouseover",function(d){
				  	      	d3.select("#node_link-svg1")
				  	      		.selectAll("circle")
				  	      		.filter(function(o){
				  	      			if(o.data.name==d.data.name) return true;
				  	      			else return false;
				  	      		})
				  	      		.style("stroke","#800000")
				  	      		.style("stroke-width",3);

				  	      	d3.selectAll("#node_link-svg2")
				  	      		.selectAll("circle")
				  	      		.filter(function(o){
				  	      			if(o.name==d.data.name) return true;
				  	      			else return false;
				  	      		})
				  	      		.style("stroke","#800000")
				  	      		.style("stroke-width",3);

				  	      })
				  	      .on("mouseout",function(d){
				  	      	d3.select("#node_link-svg1")
				  	      		.selectAll("circle")
				  	      		.filter(function(o){
				  	      			if(o.data.name==d.data.name) return true;
				  	      			else return false;
				  	      		})
				  	      		.style("stroke-width",0);

				  	      	d3.selectAll("#node_link-svg2")
				  	      		.selectAll("circle")
				  	      		.filter(function(o){
				  	      			if(o.name==d.data.name) return true;
				  	      			else return false;
				  	      		})
				  	      		.style("stroke-width",0);

				  	      })
				  	      .call(d3.drag()
				  	        .on("start", dragstarted)
				  	        .on("drag", dragged)
				  	        .on("end", dragended));

				  	nodeSvg = nodeEnter.merge(nodeSvg);

				  	nodeEnter.append("circle")
				  	      .attr("r", function(d){
				  	      	if(!d.data.color){return comparepower(d.data.actualnode.power);}
				  	      	else if(d.data.color==1){return comparepower(d.data.actualnode.power);}
				  	      	else{return 5;}
				  	      })
				  	      .style("fill",function(d){
				  	      	if(!d.data.color){return "#698B22";}
				  	      	else if(d.data.color==1){return "#7D9EC0";}
				  	      	else{
				  	      		if(d.data.name==file[num].title) {return "#800000";}
				  	      		return "#EEB4B4";
				  	      	}
				  	      })
				  	      
				  	      .append("title")
							.style("font","15px KaiTi")
				  	        .text(function(d) { return d.data.name; });


				  	nodeEnter.append("text")
				  	      .attr("dy", 3)
				  	      .attr("x", function(d) { return d.children ? -8 : 8; })
				  	      .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
				  	      .style("font","15px KaiTi")
				  	      .text(function(d){
				  	      	if((!d.data.color)||d.data.color==1){return "";}
				  	      	else return d.data.name;
				  	      })

				}

				function ticked() {
				  linkSvg
				  	  .attr("x1", function(d) { return d.source.x; })
				      .attr("y1", function(d) { return d.source.y; })
				      .attr("x2", function(d) { return d.target.x; })
				      .attr("y2", function(d) { return d.target.y; });

				  nodeSvg
				      .attr("transform",function(d){return "translate(" + d.x + ", " + d.y + ")";});
				}

				// function color(d) {
				// 	if(!d.color){ 
				// 		return "#9999ff"; // terminal node
				// 	}else if(d._children){
				// 		return "#4050ff"; // collapsed node
				// 	}else{
				// 		if(d.color==1){
				// 			return "#e77471"; // central node
				// 		}else if(d.color==2){
				// 			return "#0088ff"; // first tier node
				// 		}
				// 		// else{
				// 		// 	return "#66aadd" // second tier node
				// 		// }
				// 	}
				// }


				// Toggle children on click.
				function click(d){
					if (d.children) {
					  d._children = d.children;
					  d.children = null;
					  update();
					  simulation.restart();
					} 
					else {
					  d.children = d._children;
					  d._children = null;
					  update();
					  simulation.restart();
					}
					//console.log(d.data);


					personName=d.data.name;
					var selectArray=new Array();
					d3.selectAll('.dot')
						.classed('circle-hidden', false);
					d3.selectAll('.dot')
						.filter(function(o,i){
							var filmname=o.title;
							var directorList=o.director.split(' / ');
							var actorList=o.actor.split('/');
							if(filmname==personName){
								selectArray.push(o);
								return false;
							}
							for(var i=0;i<directorList.length;i++)
							{
							if(directorList[i]==personName)
								{
									selectArray.push(o);
									return false;
								}
							}
							for(var i=0;i<actorList.length;i++)
							{
								if(actorList[i]==personName)
								{
									selectArray.push(o);
									return false;
								}
							}
							
							return true;
					 	})
						.classed('circle-hidden', true);
					movie_histogram.update(selectArray);
				}

				function dragstarted(d) {
				  if (!d3.event.active) simulation.alphaTarget(0.3).restart()
				  //simulation.fix(d);
				  d.fx = d.x;
				  d.fy = d.y;
				}

				function dragged(d) {
				  //simulation.fix(d, d3.event.x, d3.event.y);
				  d.fx = d3.event.x;
				  d.fy = d3.event.y;
				}

				function dragended(d) {
				  if (!d3.event.active) simulation.alphaTarget(0);
				  //simulation.unfix(d);
				  d.fx = null;
				  d.fy = null;
				}


				// Returns a list of all nodes under the root.
				function flatten(root) {
				  var nodes = [], i = 0;

				  function recurse(node) {
				    if (node.children) node.children.forEach(recurse);
				    if (!node.id) node.id = ++i;
				    else ++i;
				    nodes.push(node);
				  }
				
				  recurse(root);
				  return nodes;
				}

				/////////////////////////画完力导向图//////////////////////

				var r=50;

				var temp=d3.select("body").append("div")
					.attr("class","tooltip")
					.style("opacity",0);
				
				// d3.select("#diresvg").remove();

				// var it;
				// for(it=0;it<directors.length;it++){
				// 	var svgdirector = d3.select("#node_link-svg").append("svg")
				// 			.attr("id","diresvg")
				// 			.attr("width", width)
				// 			.attr("height", height);

				// 	svgdirector.append("g")
				// 		.attr("class","links")
				// 		.selectAll("line")
				// 		.data(DirectorGraphJSONArray[it].links)
				// 		.enter()
				// 		.append("line")
				// 			.attr("x1",width/2)
				// 			.attr("y1",height/2)
				// 			.attr("x2",function(d,j){
				// 				return width/2+r*Math.sin(2*Math.PI*j/DirectorGraphJSONArray[it].links.length);
				// 			})
				// 			.attr("y2",function(d,j){
				// 				return height/2+r*Math.cos(2*Math.PI*j/DirectorGraphJSONArray[it].links.length);
				// 			})
				// 			.attr("stroke","#999")
				// 			.attr("stroke-width",function(d){return 2*d.width;});

				// 	svgdirector.append("g")
				// 		.attr("class","nodes")
				// 		.selectAll("circle")
				// 		.data(DirectorGraphJSONArray[it].nodes)
				// 		.enter()
				// 		.append("circle")
				// 			//.attr("r",function(d){return d.power;})
				// 			.attr("r",function(d){
				// 				return comparepower(d.power);
				// 			})
				// 			.attr("cx",function(d,j){
				// 				//if(d.clas==1) return width/2;
				// 				if(j==0) return width/2;
				// 				else return width/2+r*Math.sin(2*Math.PI*(j-1)/DirectorGraphJSONArray[it].links.length);
				// 			})
				// 			.attr("cy",function(d,j){
				// 				//if(d.clas==1) return height/2;
				// 				if(j==0) return height/2;
				// 				else{
				// 					//var t=height/2+r*Math.cos(2*Math.PI*(j-1)/DirectorGraphJSON.links.length);
				// 					return height/2+r*Math.cos(2*Math.PI*(j-1)/DirectorGraphJSONArray[it].links.length);
				// 				}
				// 			})
				// 			.attr("fill",function(d){
				// 				if(d.clas==1) return "#7D9EC0";
				// 				//if(d3.select(this).cx==width/2) return "#7D9EC0";
				// 				else return "#698B22";
				// 			})
				// 		.on("mouseover",function(d){
				// 			temp.transition()
				// 			    .duration(200)
				// 			    .style("opacity",1);
				// 			temp.html("姓名: "+d.name)
				// 			    .style("left",(d3.event.pageX-60)+"px")
				// 			    .style("top", (d3.event.pageY + 20) + "px");
				// 			d3.select("#node_link-svg").selectAll("svg")
				// 				.selectAll("circle")
				// 				.filter(function(o){
				// 					if(o.name==d.name) return true;
				// 					else return false;
				// 				})
				// 				.style("stroke-width",3)
				// 				.style("stroke","#800000")

				// 		})
				// 		.on("mouseout",function(d){
				// 			temp.transition()
				// 			    .duration(500)
				// 			    .style("opacity",0);
				// 			d3.select("#node_link-svg").selectAll("svg")
				// 				.selectAll("circle")
				// 				.filter(function(o){
				// 					if(o.name==d.name) return true;
				// 					else return false;
				// 				})
				// 				.style("stroke-width",0)
				// 		})
				// 		.on("click",function(d){
				// 			personName=d.name;
				// 			d3.selectAll('.dot')
				// 				.classed('circle-hidden', false);
				// 			d3.selectAll('.dot')
				// 				.filter(function(o,i){
				// 					var directorList=o.director.split(' / ');
				// 					var actorList=o.actor.split('/');
				// 					for(var i=0;i<directorList.length;i++)
				// 					{
				// 						if(directorList[i]==personName)
				// 							return false;
				// 					}
				// 					for(var i=0;i<actorList.length;i++)
				// 					{
				// 						if(actorList[i]==personName)
				// 							return false;
				// 					}
									
				// 					return true;
				// 				})
				// 				.classed('circle-hidden', true);
				// 		});
				// }
				
				

				d3.selectAll(".actorsvg").remove();

				var iter;
				for ( iter = 0; iter <= actors.length-1 ; iter++) {
					var svg = d3.select("#node_link-svg2")
						.append("svg")
						.attr("class","actorsvg")
						.attr("width", width )
						.attr("height", height );

					svg.append("g")
							.append("text")
							.attr("x",60)
							.attr("y",25)
							.style("font","15px KaiTi")
							.text(ActorGraphJSONArray[iter].nodes[0].name);
							
					var link = svg.append("g")
						.attr("class","links")
						.selectAll("line")
						.data(ActorGraphJSONArray[iter].links)
						.enter()
						.append("line")
							.attr("x1",width/2)
							.attr("y1",height/2)
							.attr("x2",function(d,j){
								//console.log(linknum[iter]);
								return width/2+r*Math.sin(2*Math.PI*j/linknum[iter]);
							})
							.attr("y2",function(d,j){
								return height/2+r*Math.cos(2*Math.PI*j/linknum[iter]);
							})
							.attr("stroke","#999")
							.attr("stroke-width",2);

					var node = svg.append("g")
						.attr("class","nodes")
						.selectAll("circle")
						.data(ActorGraphJSONArray[iter].nodes)
						.enter()
						.append("circle")
							//.attr("r",function(d){return d.power;})
							.attr("r",function(d){
								return comparepower(d.power);
							})
							.attr("cx",function(d,j){
								if(d.clas==2) return width/2;
								//if(j==0) return width/2;
								else return width/2+r*Math.sin(2*Math.PI*(j-1)/linknum[iter]);
							})
							.attr("cy",function(d,j){
								if(d.clas==2) return height/2;
								//if(j==0) return height/2;
								else return height/2+r*Math.cos(2*Math.PI*(j-1)/linknum[iter]);
							})
							.attr("fill",function(d){
								if(d.clas==1) return "#7D9EC0";
								//if(d3.select(this).cx==width/2) return "#7D9EC0";
								else return "#698B22";
							})
						.on("mouseover",function(d){
							temp.transition()
							    .duration(200)
							    .style("opacity",1);
							temp.html("Name: "+d.name)
							    .style("left",(d3.event.pageX-60)+"px")
							    .style("top", (d3.event.pageY + 20) + "px");

							d3.selectAll(".actorsvg").selectAll("circle")
								.filter(function(o){
									if(o.name==d.name){return true;}
									else return false;
								})
								.style("stroke-width",3)
								.style("stroke","#800000");

							/////////与node_link-svg1的交互/////////
							d3.select("#node_link-svg1")
								.selectAll("circle")
								.filter(function(o){
									if(o.data.name==d.name) return true;
									else return false;
								})
								.style("stroke","#800000")
								.style("stroke-width",3);
							/////////完成与node_link-svg1的交互//////////
						})
						.on("mouseout",function(d){
							temp.transition()
							    .duration(500)
							    .style("opacity",0);

							d3.selectAll(".actorsvg").selectAll("circle")
								.filter(function(o){
									if(o.name==d.name){return true;}
									else return false;
								})
								.style("stroke-width",0);

							/////////与node_link-svg1的交互/////////
							d3.select("#node_link-svg1")
								.selectAll("circle")
								.filter(function(o){
									if(o.data.name==d.name) return true;
									else return false;
								})
								.style("stroke-width",0);
							/////////完成与node_link-svg1的交互//////////
						})
						.on("click",function(d){
							personName=d.name;
							var selectArray=new Array();
							d3.selectAll('.dot')
								.classed('circle-hidden', false);
							d3.selectAll('.dot')
								.filter(function(o,i){
									//console.log(o);
									var directorList=o.director.split(' / ');
									var actorList=o.actor.split('/');
									for(var i=0;i<directorList.length;i++)
									{
										if(directorList[i]==personName)
										{
											selectArray.push(o);
											return false;
										}
									}
									for(var i=0;i<actorList.length;i++)
									{
										if(actorList[i]==personName)
										{
											selectArray.push(o);
											return false;
										}
									}
									
									return true;
								})
								.classed('circle-hidden', true);
							movie_histogram.update(selectArray);
						});
					
				}


				function comparepower(power){
					if(power>=7) return 10;
					else if(power>=5) return 6;
					else return 3;
				}

			});
			
		}); 

    }
}


