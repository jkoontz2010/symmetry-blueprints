import React, { FC } from 'react';

interface TreeNode {
  name: string;
  value: Function | null;
  children: { [key: string]: TreeNode };
}

const MyComponent: FC = () => {
  const code = `({ 
    'shop1/would1,test1': ({would1, test1})=>\`how \${run(would1, 'would1')} you \${run(test1, 'test1')} this too\`, 
    'would1/something1,something2': ({something1, something2})=>\`\${run(something1,'something1')}\${run(something2,'something2')}\`, 
    'shop2/would2,test2': ({would2, test2})=>\`how \${run(would2, 'would2')} you \${run(test2, 'test2')} this too\`, 
    'shop3/would3,test3': ({would3, test3})=>\`how \${run(would3, 'would3')} you \${run(test3, 'test3')} this too\`, 
    'something1': ()=>\`some value\`, 
    'something2': ()=>\`another one!\` 
  })`;

  // Parse the string into an object
  const obj: { [key: string]: Function } = new Function(`return ${code}`)();

  // Build the tree structure from the keys
  const buildTree = (obj: { [key: string]: Function }): TreeNode => {
    const root: TreeNode = { name: 'root', value: null, children: {} };

    Object.entries(obj).forEach(([key, value]) => {
      const parts = key.split('/');
      let currentNode = root;

      parts.forEach((part, index) => {
        if (index < parts.length - 1) {
          // Intermediate parts, process normally
          if (!currentNode.children[part]) {
            currentNode.children[part] = { name: part, value: null, children: {} };
          }
          currentNode = currentNode.children[part];
        } else {
          // Last part, split by commas
          const subParts = part.split(',');
          subParts.forEach((subPart) => {
            if (!currentNode.children[subPart]) {
              currentNode.children[subPart] = { name: subPart, value: null, children: {} };
            }
            // Assign the function to each subPart node
            currentNode.children[subPart].value = value;
          });
        }
      });
      

      // Assign the function to the current node
      currentNode.value = value;
    });

    return root;
  };

  const tree = buildTree(obj);

  // Callback for key click
  const handleKeyClick = (keyPath: string): void => {
    console.log('Key clicked:', keyPath);
  };

  // Callback for badge click
  const handleBadgeClick = (variableName: string): void => {
    console.log('Badge clicked:', variableName);
  };

  // Function to render the function's template string with badges
  const renderFunction = (func: Function): JSX.Element | null => {
    const funcStr = func.toString();
    const templateStringMatch = funcStr.match(/`([\s\S]*?)`/);
    if (!templateStringMatch) {
      return null;
    }
    const templateString = templateStringMatch[1];
    const parts = templateString.split(/(\${[^}]+})/g);

    return (
      <div style={{ marginLeft: '20px' }}>
        {parts.map((part, index) => {
          if (part.startsWith('${') && part.endsWith('}')) {
            const runMatch = part.match(/\${run\([^)]+,\s*'([^']+)'\)}/);
            if (runMatch) {
              const variableName = runMatch[1];
              return (
                <span
                  key={index}
                  onClick={() => handleBadgeClick(variableName)}
                  style={{
                    border: '1px solid black',
                    padding: '2px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    margin: '0 2px',
                    backgroundColor: '#e0e0e0',
                  }}
                >
                  {variableName}
                </span>
              );
            } else {
              // Handle other template expressions if needed
              return part;
            }
          } else {

            return part;
          }
        })}
      </div>
    );
  };

  // Recursive function to render the tree
  const renderTree = (
    node: TreeNode,
    level: number = 0,
    keyPath: string[] = []
  ): JSX.Element[] => {
    return Object.values(node.children).map((childNode) => {
      const currentKeyPath = [...keyPath, childNode.name];
      return (
        <div key={currentKeyPath.join('/')}>
          <div
            style={{ marginLeft: `${level * 20}px`, marginBottom: '5px' }}
          >
            <span
              onClick={() => handleKeyClick(currentKeyPath.join('/'))}
              style={{
                color: 'blue',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              {childNode.name}
            </span>
            {childNode.value && <div>{renderFunction(childNode.value)}</div>}
          </div>
          {renderTree(childNode, level + 1, currentKeyPath)}
        </div>
      );
    });
  };

  return <div>{renderTree(tree)}</div>;
};

export default MyComponent;
