Github Visualization
=========

Run
-----------

* git clone
* bundle install
* rackup config.ru &
* navigate to localhost:3000

Description
--------------
This visualization tries to display latest events from the github api using a force layout graph from d3
As new events come in, they get added to the graph
One event has 4 different types of nodes (event type, user, repo, repo-language)
Nodes increment their size through time so its possible to see which nodes are having more activity
Labels are used to show new or recently updated nodes
The sliders help play around with the graph properties resulting in interesting layout and visual representation
Cpu goes high due to the amount of processing, the graph would be better off using processing, easel or some other library that leverages the canvas, it was just an experiment with d3

Example
--------------

http://www.flickr.com/photos/calderas/sets/72157629749939356/

Libraries
--------------

* d3.js - http://d3js.org/
* jquery ui slider