import { Injectable } from '@angular/core';
import { AllModules as ModuleSet } from "../../assets/modules/AllModules";

import * as CircularJSON from 'circular-json';
import {MOBIUS} from './mobius.constants';

@Injectable()
export abstract class NodeLibraryService {

  public static saved_nodes: any[] = [];

  constructor() { this.checkSavedNodes();  }

  checkSavedNodes(): void{ 

    NodeLibraryService.saved_nodes = [];
    
    let myStorage = window.localStorage;
    let property = MOBIUS.PROPERTY.NODE;
    let storageString = myStorage.getItem(property);
    let nodesStorage = CircularJSON.parse( storageString == null ? CircularJSON.stringify({n: []}) : storageString );

    let nodeData = nodesStorage.n; 

    for(let n=0; n < nodeData.length; n++){
        let n_data = nodeData[n];
        NodeLibraryService.saved_nodes.push(n_data);
    }

  }

  clearLibrary(nodeID ?: string): void{

    let nav: any = navigator;
    let myStorage = window.localStorage;

    let property = MOBIUS.PROPERTY.NODE;

    if(nodeID == undefined){
      let storageString = myStorage.removeItem(property);
      this.consoleService.addMessage("Node Library was cleared.");
    }
    else{
      this._savedNodes = this._savedNodes.filter(function(node){
         return node["_id"] != nodeID;
      });
      
      if(this._savedNodes.length == 0){
        myStorage.removeItem(property);
      }
      else{
        let nodesStorage = CircularJSON.stringify({ n: this._savedNodes });
        myStorage.setItem(property, nodesStorage);
      }
      this.consoleService.addMessage("Node from library was deleted.");
    }

    this.getNodes().map(function(node){

      if(nodeID === undefined){
        node.removeType();
      }
      else if(node.getType() == nodeID){
        node.removeType();
      }

    })

    // print message to console
    this.switchViewer("console-viewer");
    this.checkSavedNodes();
    this.update();
  }



  saveNode(node: IGraphNode|number): void{

    if( typeof node == "number"){
      node = this._flowchart.getNodeByIndex(node);
    }

    // todo: check if overwrite
    if( node.getType() !== undefined ){
      console.error("This node was already in the library and shouldn't have invoked this function.");
    }
    else{
      let message: string;

      let nav: any = navigator;
      let myStorage = window.localStorage;

      let property = MOBIUS.PROPERTY.NODE; 
      let storageString = myStorage.getItem(property);

      // initialize node storage by reading from localStorage or reading an empty array
      let nodesStorage = CircularJSON.parse(storageString == null ? CircularJSON.stringify({n: []}) : storageString);

      // array of nodes
      let nodes = nodesStorage.n;

      // check is another node exists with same name
      for(let i=0; i < nodes.length; i++){

          let node_in_lib: IGraphNode = nodes[i];
          if(node_in_lib["_name"] === node.getName()){
            message = "Node with this name already exists in the library. Either delete existing\
            node from the library or rename your node and try again.";
            this.consoleService.addMessage(message);
            // this.layoutService.showConsole();
            this.switchViewer("console-viewer");
            return;
          }
      }

      // no node with common name was found
      try{
        nodesStorage.n.push(node);
        myStorage.setItem( property, CircularJSON.stringify(nodesStorage) );
        message = "Bravo! Node saved. Now you have " + (nodes.length) + " node(s) in the library!";
        node.saved();

        this.consoleService.addMessage(message);
        // this.layoutService.showConsole();
        this.switchViewer("console-viewer");
        this.checkSavedNodes();
        this.update();
      }
      catch(ex){
        this.consoleService.addMessage("Oops. Something went wrong while saving this node.\
                                        Post the error message to the dev team on our Slack channel.", EConsoleMessageType.Error);
        this.consoleService.addMessage(ex, EConsoleMessageType.Error);
        // this.layoutService.showConsole();
        this.switchViewer("console-viewer");
      }

    }

  }


}