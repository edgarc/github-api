//underscore find method doesnt provide the index of a found value
//this is the same method but returning the index rather the value
_.findIndex = function(obj, iterator, context) {
    var result;
    _.any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = index;
        return true;
      }
    });
    return result;
  };

var github = (function(){
	var api={},
		events=[], 
		nodes=[],
		links,
		freq={}
		minSize=1,
		batchId=1;
	
	function createElements(data){
		//reset  links to return only new ones after the first run
		links=[];
		for (var i=0; i<data.length; i++) {
			var e = data[i];
			var nodeEvent = addOrFindNode(e.event_type, "event");
		 	var nodeUser = addOrFindNode(e.user, "user");
		 	var nodeRepo = addOrFindNode(e.repo, "repo");
		 	var nodeLang = addOrFindNode(e.lang, "lang");
			
			if( nodeEvent != -1 && nodeUser != -1) addLink(nodeEvent, nodeUser);
			if( nodeUser != -1 && nodeRepo != -1) addLink(nodeUser, nodeRepo);
			if( nodeRepo != -1 && nodeLang != -1) addLink(nodeRepo, nodeLang);
		}
	}
	
	function addOrFindNode(nodeName, category){
		var nodeIndex = -1;
		if (typeof nodeName != "undefined"){
			var objFreq = updateFrequency(nodeName, category);
			nodeIndex = _.findIndex(nodes, function(obj){ return obj.name == nodeName})
			
			if (typeof nodeIndex == "undefined"){
				var newNode={
					"name": nodeName, 
					"group": category, 
					"size": objFreq,
					"batch": batchId
				}
				nodes.push(newNode);
				nodeIndex = nodes.length-1;
			}else{
				//update frequency of existing node
				nodes[nodeIndex].size = objFreq;
				nodes[nodeIndex].batch = batchId;
			}
		}
		return nodeIndex;
	}
	
	function updateFrequency(nodeName, category, opt){
		if (typeof freq[category] === "undefined") { 
			freq[category] = {};
		}
		if (typeof freq[category][nodeName] === "undefined"){
				freq[category][nodeName] = minSize;
		}else{
			freq[category][nodeName]++;
		}
		
		return freq[category][nodeName];
	}
	
	function addLink(source, target, value){
		links.push({ 
			"source": source, 
			"target": target, 
			"value": value
		})
	}
	
	api.getGraph = function(data){
		var data = JSON.parse(data);
		
		//maintain a copy of all nodes to have the original index
		events = events.concat(data);
		createElements(data);
		
		var result = {
      		"nodes": nodes,
      		"links": links
    	};

		batchId++;
		
		return result;
	}
	
	api.freq=freq;
	
	return api;
})();