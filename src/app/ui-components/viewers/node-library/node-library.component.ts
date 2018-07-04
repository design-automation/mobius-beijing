import { Component, OnInit, Injector, Inject } from '@angular/core';
import { NodeLibraryService } from '../../../global-services/node-library.service';

import { IGraphNode, IEdge, GraphNode } from '../../../base-classes/node/NodeModule';

@Component({
  selector: 'app-node-library',
  templateUrl: './node-library.component.html',
  styleUrls: ['./node-library.component.scss']
})
export class NodeLibraryComponent{

	_savedNodes: IGraphNode[]; 

	constructor(){}

	reset(): void{
		this._savedNodes = NodeLibraryService.nodes;
	}

	addNode($event, type: number): void{
	}

	deleteNode($event, node): void{
		$event.stopPropagation();
		NodeLibraryService.delete_library_node(node["_id"])
	}

	clearLibrary(){
		NodeLibraryService.delete_library_node()
	}

	downloadLibrary(){
			// todo	
	}

	loadLibrary(){	
			// todo
	}	

}

