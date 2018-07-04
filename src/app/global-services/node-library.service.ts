import { Injectable } from '@angular/core';
import { AllModules as ModuleSet } from "../../assets/modules/AllModules";

import * as CircularJSON from 'circular-json';
import {MOBIUS} from './mobius.constants';

import {ConsoleService} from "./console.service";
import {IGraphNode, GraphNode} from '../base-classes/node/NodeModule';


@Injectable()
export abstract class NodeLibraryService {

  private static saved_nodes: any[] = [];

  public static get nodes(): any[]{
    return NodeLibraryService.saved_nodes;
  }

  set saved_nodes(nodes: any[]){
    NodeLibraryService.saved_nodes = nodes;
  }

  constructor(private _cs: ConsoleService) { NodeLibraryService.update_nodes();  }

  public static update_nodes(): void{ 

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

  /*
   * Deletes all nodes in the libray if node nodeID is passed
   * Deletes single node from the libray is a nodeID is passed
   */
  public static delete_library_node(nodeID?: string): void{

    let nav: any = navigator;
    let myStorage = window.localStorage;

    let property = MOBIUS.PROPERTY.NODE;

    if(nodeID == undefined){
        let storageString = myStorage.removeItem(property);
    }
    else{

        NodeLibraryService.saved_nodes = NodeLibraryService.saved_nodes.filter(function(node){
           return node["_id"] != nodeID;
        });
        
        if(NodeLibraryService.saved_nodes.length == 0){
          myStorage.removeItem(property);
        }
        else{
          let nodesStorage = CircularJSON.stringify({ n: NodeLibraryService.saved_nodes });
          myStorage.setItem(property, nodesStorage);
        }
    }

    NodeLibraryService.update_nodes();
  }



  save_library_node(node: IGraphNode): void{

    // todo: check if overwrite
    if( node.type !== undefined ){
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
          if(node_in_lib["_name"] === node.name){
            message = "Node with this name already exists in the library. Either delete existing\
            node from the library or rename your node and try again.";
            //this.consoleService.addMessage(message);
            // this.layoutService.showConsole();
            //this.switchViewer("console-viewer");
            return;
          }
      }

      // no node with common name was found
      try{
        nodesStorage.n.push(node);
        myStorage.setItem( property, CircularJSON.stringify(nodesStorage) );
        message = "Bravo! Node saved. Now you have " + (nodes.length) + " node(s) in the library!";
        node.type = node.id;

        //this.consoleService.addMessage(message);
        // this.layoutService.showConsole();
        //this.switchViewer("console-viewer");
        NodeLibraryService.update_nodes();
        //this.update();
      }
      catch(ex){
        //this.consoleService.addMessage("Oops. Something went wrong while saving this node.\
                                       // Post the error message to the dev team on our Slack channel.", EConsoleMessageType.Error);
        //this.consoleService.addMessage(ex, EConsoleMessageType.Error);
        // this.layoutService.showConsole();
        //this.switchViewer("console-viewer");
      }

    }

  }


}