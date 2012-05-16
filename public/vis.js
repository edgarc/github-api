var w = 2000,
    h = 1024,
    fill = d3.scale.category20(),
    nodes = [],
    links = [],
	color, vis, force,
	minSize = 0;

function initialize(){
	color = d3.scale.category20();

	vis = d3.select("#chart").append("svg")
	    .attr("width", w)
	    .attr("height", h);

   force = d3.layout.force()
	    .nodes(nodes)
	    .links(links)
		.on("tick", tick)
		.gravity(0.05)
		.distance(200)
		.charge(-50)
	    .size([w, h]);
	
	//start with some nodes so it doesnt look sad
	var data = "[{\"event_type\":\"PushEvent\",\"user\":\"GithubAPI\"},{\"event_type\":\"WatchEvent\",\"user\":\"GithubAPI\"},{\"event_type\":\"CreateEvent\",\"user\":\"GithubAPI\"},{\"event_type\":\"GistEvent\",\"user\":\"GithubAPI\"},{\"event_type\":\"PullRequestEvent\",\"user\":\"GithubAPI\"},{\"event_type\":\"IssueCommentEvent\",\"user\":\"GithubAPI\"}]";
	start(github.getGraph(data));
	restart();
}

function tick(){
  vis.selectAll("circle.node")
  	  .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
	  .attr("r", function(d)  { return Math.sqrt(d.size); });
	 	
  vis.selectAll("text.node")
	.attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; })
	.text(function(d) { 
		if(d.batch >= minSize){ 
			return d.name; 
		}
	});	
};

function onMouseOver(data){
	var link,
		url = "http://github.com/";
	switch(data.group){
		case "event":
			link = "#";
			break;
		case "lang":
			link = url + "languages/" + data.name;
			break;
		default:
			link = url + data.name;
			break;
	}
	d3.select("#node-link").attr("href", link);
	d3.select("#node-type").html(data.group);
	d3.select("#node-value").html(data.name);
	d3.select("#node-freq").html(github.freq[data.group][data.name]);
}

function restart() {

  force
	.nodes(nodes)
	.links(links)
	.start();

  vis.selectAll("circle.node")
      .data(nodes)
     .enter().append("circle")
      .attr("class", function(d) { return "node " + d.group; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
	  .attr("r", function(d) { return d.size; })
	  .on("mouseover", function(d){onMouseOver(d)})
      .call(force.drag);  

  vis.selectAll("text.node")
	  .data(nodes)
	.enter().append("svg:text")
	 .attr("class", function(d) { return "node " + d.group; })
     .attr("dx", 12)
     .attr("dy", ".25em")
	 .on("mouseover", function(d){onMouseOver(d)})
	 .call(force.drag);

  vis.selectAll("circle.node").data(nodes).exit().remove();	
  vis.selectAll("text.node").data(nodes).exit().remove();

}

function start(data){
	data.nodes.forEach(function(node) {
		//find node if already exists
		var nodeIndex = _.findIndex(nodes, function(obj){ return obj.name === node.name})
		if (typeof nodeIndex === "undefined" ){
			nodes.push(node);
		} else {
			nodes[nodeIndex].size = node.size
		}
	});
	
	data.links.forEach(function(link){
		links.push(link);
	});
	
	minSize++;
	restart();
}

function debug(str){ 
	console.log(str);
};

$(document).ready(function(){
	//vis
	initialize();
	
	//sliders
	$( "#gravity.slider" ).slider({
		value:0.05,
		min: 0.1,
		max: 1.0,
		step: .01,
		slide: function( event, ui ) {
			$( "#gravity-label" ).html( ui.value );
			force.gravity( ui.value );
		}
	});
	
	$( "#distance.slider" ).slider({
		value:200,
		min: 0,
		max: 400,
		step: 10,
		slide: function( event, ui ) {
			$( "#distance-label" ).html( ui.value );
			force.distance( ui.value );
			restart();
		}
	});
	
	$( "#charge.slider" ).slider({
		value:-50,
		min: -150,
		max: 0,
		step: 10,
		slide: function( event, ui ) {
			$( "#charge-label" ).html( ui.value );
			force.charge( ui.value );
			restart();
		}
	});
	
	//websocket
	ws = new WebSocket("ws://0.0.0.0:8080");
	
	ws.onmessage = function(evt) { 
		start(github.getGraph(evt.data));
	};
	ws.onclose = function() { 
		debug("socket closed"); 
	};
	ws.onopen = function() {
		debug("connected...");
		ws.send("hello server");
	};
	
});