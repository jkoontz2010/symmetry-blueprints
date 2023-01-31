import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
// import { Tree as TreeType } from '../../parser';

// component imports
import Navbar from './Navbar';
import Tree from './Tree';
import Flow from './Flow';

interface SidebarProps {
  initialNodes: any;
  initialEdges: Edge<any>[];
  viewData: any;
}

const Sidebar = () => {
  // state variables for the incomimg treeData, parsed viewData, user's settings, and the root file name
  const [treeData, setTreeData]: any = useState();
  const [viewData, setViewData]: any = useState();
  const [settings, setSettings]: [{ [key: string]: boolean }, Function] =
    useState();
  const [rootFile, setRootFile]: [string | undefined, Function] = useState();

  // useEffect whenever the Sidebar is rendered
  useEffect(() => {
    // Event Listener for 'message' from the extension
    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        // Listener to receive the tree data, update navbar and tree view
        case 'parsed-data': {
          setRootFile(message.value.fileName);
          setTreeData([message.value]);
          // console.log('HERE', treeData);
          break;
        }
        // Listener to receive the user's settings
        case 'settings-data': {
          setSettings(message.value);
          break;
        }
      }
    });

    // Post message to the extension whenever sapling is opened
    tsvscode.postMessage({
      type: 'onReacTreeVisible',
      value: null,
    });

    // Post message to the extension for the user's settings whenever sapling is opened
    tsvscode.postMessage({
      type: 'onSettingsAcquire',
      value: null,
    });
    // console.log('HERE', viewData);
  }, []);

  // Separate useEffect that gets triggered when the treeData and settings state variables get updated
  useEffect(() => {
    if (treeData && settings) {
      // Invoke parser to parse based on user's settings
      parseViewTree();
    }
  }, [treeData, settings]);
  
  const initialNodes: Node[] = [];
  let id = 0;
  let xPos = 5;
  let xPos1 = 150;
  let yPos = 5;
  const nodeGap = 50;

  const getNodes = (tree: any) => {
    if (!tree) {
      return;
    }
    if (tree.length < 1) {
      tree.forEach((item: any) => {
        const node = {
          id: (++id).toString(),
          data: {
            label: item.fileName,
          },
          position: {
            x: 150,
            y: yPos + item.depth * nodeGap,
          },
        };
        initialNodes.push(node);
        if (item.children) {
          getNodes(item.children);
        }
      });
    } else {
      let count = 0;
      tree.forEach((item: any) => {
        const node = {
          id: (++id).toString(),
          data: {
            label: item.fileName,
          },
          position: {
            x: xPos + count++ * 250,
            y: yPos + item.depth * nodeGap,
          },
        };
        initialNodes.push(node);
        if (item.children) {
          getNodes(item.children);
        }
      });
    }
  };
  // Edits and returns component tree based on users settings
  const parseViewTree = (): void => {
    // Deep copy of the treeData passed in
    const treeParsed = JSON.parse(JSON.stringify(treeData[0]));

    // Helper function for the recursive parsing
    const traverse = (node: any): void => {
      let validChildren = [];

      // Logic to parse the nodes based on the users settings
      for (let i = 0; i < node.children.length; i++) {
        if (
          node.children[i].thirdParty &&
          settings.thirdParty &&
          !node.children[i].reactRouter
        ) {
          validChildren.push(node.children[i]);
        } else if (node.children[i].reactRouter && settings.reactRouter) {
          validChildren.push(node.children[i]);
        } else if (
          !node.children[i].thirdParty &&
          !node.children[i].reactRouter
        ) {
          validChildren.push(node.children[i]);
        }
      }

      // Update children with only valid nodes, and recurse through each node
      node.children = validChildren;
      node.children.forEach((child: any) => {
        traverse(child);
      });
    };

    // Invoking the helper function
    traverse(treeParsed);
    // Update the vewData state
    setViewData([treeParsed]);
  };
  getNodes(viewData);
  const data = initialNodes
 
  // Render section
  return (
    <div className="sidebar">
      <Navbar rootFile={rootFile} />
      <hr className="line_break" />
      <div>test1</div>
      <Flow data={data}/>
    </div>
  );
};

export default Sidebar;
