import React from 'react';
import { Graph } from "react-d3-graph";
import LoadingOverlay from 'react-loading-overlay';

import logo from './logo.svg';
import './App.css';
import NumpyLoader from './loadnpy.js';

// run: npm start
 
function readFileAsync(file) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();
		reader.onload = () => {
			resolve(reader.result);
		}
		reader.onerror = reject;
		reader.readAsText(file);
	});
};


export default class App extends React.Component {
	constructor(props) {
		super(props);

		// the graph configuration, you only need to pass down properties
		// that you want to override, otherwise default ones will be used
		const config = {
			width: 500,
		    directed: false,
		    nodeHighlightBehavior: true,
		    linkHighlightBehavior: true,
		    node: {
		        color: "black",
		        size: 120,
		        highlightStrokeColor: "red",
		    },
		    link: {
		        highlightColor: "red",
		    },
		};

		const data = [
			{
			    nodes: [],
			    nodes_name : [],
			    nodes_vector: [],
			    selected_node: -1, 
			    links: [],
			    links_name: [],
			},
			{
			    nodes: [],
			    nodes_name : [],
			    nodes_vector: [],
			    alignment_nodes: [-1, -1, -1, -1, -1], 
			    links: [],
			    links_name: [],
			},
		];

		this.state = {
			config,
			data,
			isLoading: false,
		};
		
		this.restartGraphSimulation = this.restartGraphSimulation.bind(this);
		this.decorateGraphNodesWithInitialPositioning = this.decorateGraphNodesWithInitialPositioning.bind(this);
		this.processEntityFile = this.processEntityFile.bind(this);
		this.processOutputFile = this.processOutputFile.bind(this);
		this.readFiles = this.readFiles.bind(this);
		this.resetData = this.resetData.bind(this);
		this.openDataset = this.openDataset.bind(this);
		this.handleChooseNode = this.handleChooseNode.bind(this);
		this.getClosestNode = this.getClosestNode.bind(this);
		this.getRelatedNodes = this.getRelatedNodes.bind(this);
	}

	// graph event callbacks
	onClickGraph = () => console.info("Clicked the graph");
	 
	onClickNode = id => console.info(`Clicked node ${id}`);
	 
	onDoubleClickNode = id => console.info(`Double clicked node ${id}`);
	 
	onRightClickNode = (event, id) => {
        event.preventDefault();
        console.info(`Right clicked node ${id}`);
    };
	 
	onClickLink = (source, target) => console.info(`Clicked link between ${source} and ${target}`);

    onRightClickLink = (event, source, target) => {
        event.preventDefault();
        console.info(`Right clicked link between ${source} and ${target}`);
    };

    onMouseOverNode = id => {
    	console.info(`Do something when mouse is over node (${id})`);
    	if (id == "Empty") return;
    	let found = this.refs.graph1.props.data.nodes.find(node => node.id == id);
		let index = 0;
		let node_name = "";
		if (found != undefined) {
			index = this.state.data[0].nodes.findIndex(node => node.id == id);
			node_name = this.state.data[0].nodes_name[index].name.split("/")[4];
    		document.getElementById("tabs1-1").getElementsByClassName("overlay")[0].innerHTML=node_name;
    	}
    	found = undefined;
    	found = this.refs.graph21.props.data.nodes.find(node => node.id == id);
    	if (found != undefined) {
    		index = this.state.data[1].nodes.findIndex(node => node.id == id);
			node_name = this.state.data[1].nodes_name[index].name.split("/")[4].replace(/_/g, " ");
    		document.getElementById("tabs2-1").getElementsByClassName("overlay")[0].innerHTML=node_name;
		}
    	found = undefined;
    	found = this.refs.graph22.props.data.nodes.find(node => node.id == id);
    	if (found != undefined) {
    		index = this.state.data[1].nodes.findIndex(node => node.id == id);
			node_name = this.state.data[1].nodes_name[index].name.split("/")[4].replace(/_/g, " ");
    		document.getElementById("tabs2-2").getElementsByClassName("overlay")[0].innerHTML=node_name;
		}
    	found = undefined;
    	found = this.refs.graph23.props.data.nodes.find(node => node.id == id);
    	if (found != undefined) {
    		index = this.state.data[1].nodes.findIndex(node => node.id == id);
			node_name = this.state.data[1].nodes_name[index].name.split("/")[4].replace(/_/g, " ");
    		document.getElementById("tabs2-3").getElementsByClassName("overlay")[0].innerHTML=node_name;
		}
    	found = undefined;
    	found = this.refs.graph24.props.data.nodes.find(node => node.id == id);
    	if (found != undefined) {
    		index = this.state.data[1].nodes.findIndex(node => node.id == id);
			node_name = this.state.data[1].nodes_name[index].name.split("/")[4].replace(/_/g, " ");
    		document.getElementById("tabs2-4").getElementsByClassName("overlay")[0].innerHTML=node_name;
		}
    	found = undefined;
    	found = this.refs.graph25.props.data.nodes.find(node => node.id == id);
    	if (found != undefined) {
    		index = this.state.data[1].nodes.findIndex(node => node.id == id);
			node_name = this.state.data[1].nodes_name[index].name.split("/")[4].replace(/_/g, " ");
    		document.getElementById("tabs2-5").getElementsByClassName("overlay")[0].innerHTML=node_name;
		}
	}

    onMouseOutNode = id => console.info(`Do something when mouse is out of node (${id})`);

    onMouseOverLink = (source, target) => {
        console.info(`Do something when mouse is over link between ${source} and ${target}`);
        let id = 0;
        let link_name = "";
        let found = this.refs.graph1.props.data.links.find(link => (link.source == source && link.target == target));
        if (found != undefined) {
        	id = found.id;
        	link_name = this.state.data[0].links_name.find(link => link.id == id).name.split("/")[4];
        	document.getElementById("tabs1-1").getElementsByClassName("overlay")[0].innerHTML=link_name;
        }
        found = undefined;
        found = this.refs.graph21.props.data.links.find(link => (link.source == source && link.target == target));
        if (found != undefined) {
        	id = found.id;
        	link_name = this.state.data[1].links_name.find(link => link.id == id).name.split("/")[4];
        	document.getElementById("tabs2-1").getElementsByClassName("overlay")[0].innerHTML=link_name;
        }
        found = undefined;
        found = this.refs.graph22.props.data.links.find(link => (link.source == source && link.target == target));
        if (found != undefined) {
        	id = found.id;
        	link_name = this.state.data[1].links_name.find(link => link.id == id).name.split("/")[4];
        	document.getElementById("tabs2-2").getElementsByClassName("overlay")[0].innerHTML=link_name;
        }
        found = undefined;
        found = this.refs.graph23.props.data.links.find(link => (link.source == source && link.target == target));
        if (found != undefined) {
        	id = found.id;
        	link_name = this.state.data[1].links_name.find(link => link.id == id).name.split("/")[4];
        	document.getElementById("tabs2-3").getElementsByClassName("overlay")[0].innerHTML=link_name;
        }
        found = undefined;
        found = this.refs.graph24.props.data.links.find(link => (link.source == source && link.target == target));
        if (found != undefined) {
        	id = found.id;
        	link_name = this.state.data[1].links_name.find(link => link.id == id).name.split("/")[4];
        	document.getElementById("tabs2-4").getElementsByClassName("overlay")[0].innerHTML=link_name;
        }
        found = undefined;
        found = this.refs.graph25.props.data.links.find(link => (link.source == source && link.target == target));
        if (found != undefined) {
        	id = found.id;
        	link_name = this.state.data[1].links_name.find(link => link.id == id).name.split("/")[4];
        	document.getElementById("tabs2-5").getElementsByClassName("overlay")[0].innerHTML=link_name;
        }
    }

    onMouseOutLink = (source, target) =>
        console.info(`Do something when mouse is out of link between ${source} and ${target}`);

    onNodePositionChange = (nodeId, x, y) =>
        console.info(`Node ${nodeId} is moved to new position. New position is (${x}, ${y}) (x,y)`);

	restartGraphSimulation = () => {
		this.refs.graph1.restartSimulation();
		this.refs.graph21.restartSimulation();
		this.refs.graph22.restartSimulation();
		this.refs.graph23.restartSimulation();
		this.refs.graph24.restartSimulation();
		this.refs.graph25.restartSimulation();
	}

	pauseGraphSimulation = () => {
		this.refs.graph1.restartSimulation();
		this.refs.graph21.restartSimulation();
		this.refs.graph22.restartSimulation();
		this.refs.graph23.restartSimulation();
		this.refs.graph24.restartSimulation();
		this.refs.graph25.restartSimulation();
	}

	resetNodesPositions = () => {
		this.refs.graph1.restartSimulation();
		this.refs.graph21.restartSimulation();
		this.refs.graph22.restartSimulation();
		this.refs.graph23.restartSimulation();
		this.refs.graph24.restartSimulation();
		this.refs.graph25.restartSimulation();
	}

    decorateGraphNodesWithInitialPositioning = nodes => {
        return nodes.map(n =>
            Object.assign({}, n, {
                x: n.x || Math.floor(Math.random() * 500),
                y: n.y || Math.floor(Math.random() * 500),
            })
        );
    };

    //too many data, select a node and show its related only in graph
    processEntityFile = async (file, graph_num) => {
		try {
			let text = await readFileAsync(file);
			let lines = text.split("\n");
		    lines.forEach((line) => {
		    	let t = line.split("\t");
			   	this.state.data[graph_num].nodes_name.push({name: t[1]});
			   	this.state.data[graph_num].nodes.push({id: t[0]});
		    });
			this.setState({
				data: this.state.data,
			});
			this.restartGraphSimulation();
			console.log("Finish process entity file");
		} catch(err) {
			console.log(err);
		}
	}

	processTripleFile = async (file, graph_num) => {
		try {
			let text = await readFileAsync(file);
			let lines = text.split("\n");
		    lines.forEach((line) => {
		    	let t = line.split("\t");
			   	this.state.data[graph_num].links.push({source: t[0], id: t[1], target: t[2]});
		    });
			this.setState({
				data: this.state.data,
			});
			this.restartGraphSimulation();
			console.log("Finish process triple file");
		} catch(err) {
			console.log(err);
		}
	}

	processRelationFile = async (file, graph_num) => {
		try {
			let text = await readFileAsync(file);
			let lines = text.split("\n");
			lines.forEach((line) => {
				let t = line.split("\t");
				this.state.data[graph_num].links_name.push({id: t[0], name: t[1]});
			});
			this.setState({
				data: this.state.data,
			});
			this.restartGraphSimulation();
			console.log("Finish process relation file");
		} catch(err) {
			console.log(err);
		}
	}

	processOutputFile = content => {
		let data = content.data;
		let shape = content.shape;
		this.state.data[0].nodes.forEach((node) => {
			let vector = data.slice(shape[1]*parseInt(node.id, 10), shape[1]*(parseInt(node.id, 10)+1));
			this.state.data[0].nodes_vector.push(Array.from(vector));
		});
		this.state.data[1].nodes.forEach((node) => {
			let vector = data.slice(shape[1]*parseInt(node.id, 10), shape[1]*(parseInt(node.id, 10)+1));
			this.state.data[1].nodes_vector.push(Array.from(vector));
		});
		console.log("Finish process output file");
		this.setState({
			isLoading: false,
		});
	}

    readFiles = files => {
    	try {
		    [].forEach.call(files, (file) => {
		        if (file.name === "ent_ids_1") {
		        	this.processEntityFile(file, 0);
		        }
		        if (file.name === "ent_ids_2") {
		        	this.processEntityFile(file, 1);
		        }
		        if (file.name === "triples_1") {
		        	this.processTripleFile(file, 0);
		        }
		        if (file.name === "triples_2") {
		        	this.processTripleFile(file, 1);
		        }
		        if (file.name === "rel_ids_1") {
		        	this.processRelationFile(file, 0);
		        }
		        if (file.name === "rel_ids_2") {
		        	this.processRelationFile(file, 1);
		        }
		        if (file.name.startsWith("output")) {
		        	window.open(file, this.processOutputFile);
		        }
		    });
		} catch(err) {
			console.log(err);
		}
	};

	resetData = () => {
		this.state.data[0].nodes = [];
		this.state.data[0].nodes_name = [];
		this.state.data[0].nodes_vector = [];
		this.state.data[0].selected_node = -1;
		this.state.data[0].links = [];
		this.state.data[0].links_name = [];

		this.state.data[1].nodes = [];
		this.state.data[1].nodes_name = [];
		this.state.data[1].nodes_vector = [];
		this.state.data[1].alignment_nodes = [-1, -1, -1, -1, -1]; 
		this.state.data[1].links = [];
		this.state.data[1].links_name = [];

		this.setState({
			data: this.state.data,
		});
		this.restartGraphSimulation();


		document.getElementById("node1-display").src = "";
		document.getElementById("tabs1-1").getElementsByClassName("overlay")[0].innerHTML= "Empty";
		document.getElementById("node2-display-1").src = "";
		document.getElementById("tabs2-1").getElementsByClassName("overlay")[0].innerHTML= "Empty";
		document.getElementById("node2-display-2").src = "";
		document.getElementById("tabs2-2").getElementsByClassName("overlay")[0].innerHTML= "Empty";
		document.getElementById("node2-display-3").src = "";
		document.getElementById("tabs2-3").getElementsByClassName("overlay")[0].innerHTML= "Empty";
		document.getElementById("node2-display-4").src = "";
		document.getElementById("tabs2-4").getElementsByClassName("overlay")[0].innerHTML= "Empty";
		document.getElementById("node2-display-5").src = "";
		document.getElementById("tabs2-5").getElementsByClassName("overlay")[0].innerHTML= "Empty";
	}

	openDataset = event => {
    	let files = event.target.files;
    	if (files.length == 0) return;
    	this.setState({
  			isLoading: true,
  		});
    	this.resetData();
    	let language = [files[0].webkitRelativePath.slice(0, 2), files[0].webkitRelativePath.slice(3, 5)];
  		document.getElementById("language1").innerHTML = "KG1 - " + language[0].toUpperCase();
  		document.getElementById("language2").innerHTML = "KG2 - " + language[1].toUpperCase();
    	this.readFiles(files);
    };

    getClosestNode = (id, top) => {
    	// check if node is in graph
    	let isExistInGraph = 0;
    	let findNodeInGraph = 0; 
    	let found = undefined;
    	found = this.state.data[0].nodes.find(node => node.id == id);
    	if (found != undefined) {
    		isExistInGraph = 1;
    		findNodeInGraph = 2;
    	}
    	if (found == undefined) {
			found = this.state.data[1].nodes.find(node => node.id == id);
			if (found != undefined) {
	    		isExistInGraph = 2;
	    		findNodeInGraph = 1;
	    	}
    	}
		if (found == undefined) return;

		var manhattan = require("compute-manhattan-distance");
		let index1 = this.state.data[isExistInGraph-1].nodes.findIndex(node => node.id == id);
		let vector1 = this.state.data[isExistInGraph-1].nodes_vector[index1];
		
		let index2 = 0;
		let distances = [];
		this.state.data[findNodeInGraph-1].nodes.forEach((node) => {
			let vector2 = this.state.data[findNodeInGraph-1].nodes_vector[index2];
			let id2 = this.state.data[findNodeInGraph-1].nodes[index2].id;
			if (vector2.length == 400) {
				distances.push({index : index2, id: id2, distance: manhattan(vector1, vector2)});
				index2++;
			}
		});
    	
    	distances.sort(function(a ,b) {return (a.distance - b.distance)});
    	distances = distances.slice(0, top);
    	console.log(distances);
    	return distances;
    }

    handleChooseNode = event => {
    	let id = event.target.value;
    	if (id == "Choose a node") return;
    	this.state.data[0].selected_node = id;
    	this.setState({
    		data: this.state.data,
		});
		this.restartGraphSimulation();
    	let index = this.state.data[0].nodes.findIndex(node => node.id == id);
    	document.getElementById("node1-display").src = this.state.data[0].nodes_name[index].name;
    	let top = this.getClosestNode(id, 5);
    	document.getElementById("node2-display-1").src = this.state.data[1].nodes_name[top[0].index].name;
    	document.getElementById("node2-display-2").src = this.state.data[1].nodes_name[top[1].index].name;
    	document.getElementById("node2-display-3").src = this.state.data[1].nodes_name[top[2].index].name;
    	document.getElementById("node2-display-4").src = this.state.data[1].nodes_name[top[3].index].name;
    	document.getElementById("node2-display-5").src = this.state.data[1].nodes_name[top[4].index].name;
    	this.state.data[1].alignment_nodes = [top[0].id, top[1].id, top[2].id, top[3].id, top[4].id];
    	this.setState({
    		data: this.state.data,
    	});
    	this.restartGraphSimulation();
    }

   	getRelatedNodes = (selected_node, graph_num) => {
   		const empty_nodes = [{id: "Empty"}];
   		const data = {
   			nodes: [],
   			links: [],
   			focusedNodeId: null,
   		}
    	if (selected_node == -1) {
    		data.nodes = empty_nodes;
    		data.focusedNodeId = "Empty";
    	} else {
    		data.focusedNodeId = selected_node;
    		data.nodes.push({id: selected_node, color: "red"});
	    	this.state.data[graph_num].links.forEach(link => {
		    	if (link.source == selected_node) {
		    		let found = data.nodes.find(node => node.id == link.target);
		    		if (found == undefined)
		    			data.nodes.push({id: link.target});
		   			found = data.links.find(l => (l.source == link.source && l.target == link.target));
		    		if (found == undefined) 
		    			data.links.push(link);
		   		}
		    	if (link.target == selected_node) {
		    		let found = data.nodes.find(node => node.id == link.source);
		    		if (found == undefined)
		    			data.nodes.push({id: link.source});
		    		found = data.links.find(l => (l.source == link.source && l.target == link.target));
		    		if (found == undefined)
		    			data.links.push(link);
		    	}
	    	});
    	}
    	return data;
   	}

    render() {

    	// graph payload (with minimalist structure)
    	let data = this.getRelatedNodes(this.state.data[0].selected_node, 0);
		const data1 = {
			nodes: this.decorateGraphNodesWithInitialPositioning(data.nodes),
			links: data.links,
			focusedNodeId: data.focusedNodeId,
		};
		const graphProps1 = {
            id: "graph1",
            data: data1,
            config: this.state.config,
            onClickNode: this.onClickNode,
            onDoubleClickNode: this.onDoubleClickNode,
            onRightClickNode: this.onRightClickNode,
            onClickGraph: this.onClickGraph,
            onClickLink: this.onClickLink,
            onRightClickLink: this.onRightClickLink,
            onMouseOverNode: this.onMouseOverNode,
            onMouseOutNode: this.onMouseOutNode,
            onMouseOverLink: this.onMouseOverLink,
            onMouseOutLink: this.onMouseOutLink,
            onNodePositionChange: this.onNodePositionChange,
        };
    	
     	const data2 = [];
     	const graphProps2 = [];
     	const graph2_ids = ["graph21", "graph22", "graph23", "graph24", "graph25"];
     	this.state.data[1].alignment_nodes.forEach(node => {
     		let data = this.getRelatedNodes(node, 1);
     		data2.push({
     			nodes: this.decorateGraphNodesWithInitialPositioning(data.nodes),
				links: data.links,
				focusedNodeId: data.focusedNodeId,
     		});
     	});

     	let i = 0; 
     	data2.forEach(data => {
     		graphProps2.push({
     			id: graph2_ids[i],
	            data: data,
	            config: this.state.config,
	            onClickNode: this.onClickNode,
	            onDoubleClickNode: this.onDoubleClickNode,
	            onRightClickNode: this.onRightClickNode,
	            onClickGraph: this.onClickGraph,
	            onClickLink: this.onClickLink,
	            onRightClickLink: this.onRightClickLink,
	            onMouseOverNode: this.onMouseOverNode,
	            onMouseOutNode: this.onMouseOutNode,
	            onMouseOverLink: this.onMouseOverLink,
	            onMouseOutLink: this.onMouseOutLink,
	            onNodePositionChange: this.onNodePositionChange,
     		});
     		i++;
     	});


	    return (
	    	<div className="App">
	    		<LoadingOverlay 
	    			active={this.state.isLoading} 
	    			spinner 
	    			text="Reading files..." 
	    			styles= {{
	    				content: {
	    					position: "fixed",
	    					top: "50%",
	    					left: "50%", 
	    				}
	    			}}>
	    		<header className="App-header">
					
	    			<br></br>

					<div style={{width: '100%', overflow: 'hidden'}}>
						<div className = "box">
							<button className="ui-button ui-widget ui-corner-all" style={{float: "left"}}><label htmlFor="dataset">Select dataset</label></button>
							<input id="dataset" style={{display:"none"}} type="file" name="fileList" onChange={this.openDataset} webkitdirectory="" multiple />

							<form name="Choose-node">
								<select name="nodes" onChange={this.handleChooseNode}>
									<option>Choose a node</option> 
									{this.state.data[0].nodes.map((nodes) => {
										let names = this.state.data[0].nodes_name;
										let ids = this.state.data[0].nodes;
										let id = ids.indexOf(nodes)
										if (names[id].name == undefined) return;
										else return <option key={nodes.id} value={nodes.id} name={names[id].name}>{names[id].name}</option>;
									})}
								</select>
							</form>
						</div>
					</div>

					<br></br>

					<div style={{width: '100%', overflow: 'hidden'}}>
						<div className = "box">
							<h3 id="language1">KG1</h3>
							<div id="tabs1">
								<ul>
									<li><a href="#tabs1-1">Node 1</a></li>
								</ul>

								<div id="tabs1-1">
									<iframe id="node1-display" src="" height="500" width="500" title="Node information"></iframe>
									<div>
										<div className="overlay">Empty</div>
										<Graph ref="graph1" {...graphProps1} />
									</div>
								</div>

							</div>

						</div>

						<div className = "box">
							<h3 id="language2">KG2</h3>
							<div id="tabs2">
								<ul>
									<li><a href="#tabs2-1">Node 1</a></li>
									<li><a href="#tabs2-2">Node 2</a></li>
									<li><a href="#tabs2-3">Node 3</a></li>
									<li><a href="#tabs2-4">Node 4</a></li>
									<li><a href="#tabs2-5">Node 5</a></li>
								</ul>

								<div id="tabs2-1">
									<iframe id="node2-display-1" src="" height="500" width="500" title="Node information"></iframe>
									<div>
										<div className="overlay">Empty</div>
										<Graph ref="graph21" {...graphProps2[0]} />
									</div>
								</div>
								<div id="tabs2-2">
									<iframe id="node2-display-2" src="" height="500" width="500" title="Node information"></iframe>
									<div>
										<div className="overlay">Empty</div>
										<Graph ref="graph22" {...graphProps2[1]} />
									</div>
								</div>
								<div id="tabs2-3">
									<iframe id="node2-display-3" src="" height="500" width="500" title="Node information"></iframe>
									<div>
										<div className="overlay">Empty</div>
										<Graph ref="graph23" {...graphProps2[2]} />
									</div>
								</div>
								<div id="tabs2-4">
									<iframe id="node2-display-4" src="" height="500" width="500" title="Node information"></iframe>
									<div>
										<div className="overlay">Empty</div>
										<Graph ref="graph24" {...graphProps2[3]} />
									</div>
								</div>
								<div id="tabs2-5">
									<iframe id="node2-display-5" src="" height="500" width="500" title="Node information"></iframe>
									<div>
										<div className="overlay">Empty</div>
										<Graph ref="graph25" {...graphProps2[4]} />
									</div>
								</div>

							</div>

						</div>
					</div>
					<br></br>

				</header>
				</LoadingOverlay>
	    	</div>
	    );
	}
}