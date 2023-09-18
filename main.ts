import { acorn, acornWalk, astring } from "./deps.ts";

const originalSource = new TextDecoder().decode(
  Deno.readFileSync("./simple_test.js"),
);

console.time("parse");
const ast = acorn.parse(originalSource, {
  ecmaVersion: 2017,
  // Allow everything, we don't want to complain if code is badly written
  // Also, since the code itself has been transpiled, the chance of getting
  // shenanigans is lower
  allowReserved: true,
  allowReturnOutsideFunction: true,
  allowImportExportEverywhere: true,
  allowAwaitOutsideFunction: true,
  allowSuperOutsideMethod: true,
});
console.timeEnd("parse");

Deno.writeTextFileSync(
  "./output/original_ast.json",
  JSON.stringify(ast, undefined, 4),
);

const expressions = new Set();
const pendingOperations: Array<(...args: unknown[]) => (() => void) | undefined> = [];

const buildFunctionPredicate = (functionIdentifier: string) => (node, state, ancestors) => {
  if (node.type !== 'CallExpression') return;

  let isValid = false;

  // This would be a call to any other function that's not the one we want
  if (node.callee.type === "Identifier" && node.callee.name === functionIdentifier) isValid = true;

  if (!isValid && (node.callee.type !== "MemberExpression" || node.callee.property?.type !== "Identifier" || node.callee.property?.name !== functionIdentifier)) return;

  // Should .we further narrow the member expression to determine whether it is the correct chain?

  // ancestors[ancestors.length-1] === node, so here we're checking for parent node
  if (!ancestors[ancestors.length-2] || ancestors[ancestors.length-2].type === 'AwaitExpression') return;

  return () => {
    wrapWithAwait(node);
    asyncifyScope(ancestors);
  }
}

const getFunctionIdentifier = (ancestors, nodeIndex) => {
  const currentNode = ancestors[nodeIndex];
  // Function declarations or expressions can be directly named
  if (currentNode.id?.type === "Identifier") {
    return currentNode.id.name;
  }

  const parent = ancestors[nodeIndex-1];

  // If we don't have a parente node to provide an identifier
  // or that parent is either a Property or MethodDefinition which
  // identifier is dynamically assigned at run time, we cannot determine
  // the proper identification for the node
  if (!parent || parent.computed) return;

  // Several node types can have an id prop of type Identifier
  if (parent.id?.type === "Identifier") {
    return parent.id.name;
  }

  // Usually assignments to object properties (MethodDefinition, Property)
  if (parent.key?.type === "Identifier") {
    return parent.key.name;
  }

  // Variable assignments have left hand and right hand properties
  if (parent.left?.type === "Identifier") {
    return parent.left.name;
  }
}

const asyncifyScope = (ancestors) => {
  const functionScopeIndex = ancestors.findLastIndex((n) => "async" in n);
  if (functionScopeIndex === -1) return;

  const functionScopeNode = ancestors[functionScopeIndex];

  if (functionScopeNode.async) {
    return;
  }

  functionScopeNode.async = true;

  // If the parent of a function node is a call expression, we're talking about an IIFE
  // Should we care about this case as well?
  // const parentNode = ancestors[functionScopeIndex-1];
  // if (parentNode?.type === 'CallExpression' && ancestors[functionScopeIndex-2] && ancestors[functionScopeIndex-2].type !== 'AwaitExpression') {
  //   pendingOperations.push(buildFunctionPredicate(getFunctionIdentifier(ancestors, functionScopeIndex-2)));
  // }

  const identifier = getFunctionIdentifier(ancestors, functionScopeIndex);

  // We can't fix calls of functions we can't name at compile time
  if (!identifier) return;

  pendingOperations.push(buildFunctionPredicate(identifier));
};

const wrapWithAwait = (node) => {
  const innerNode = { ...node };

  if (!node.type.includes("Expression")) {
    throw new Error(`Can't wrap "${node.type}" with await`);
  }

  node.type = "AwaitExpression";
  node.argument = innerNode;

  Object.keys(node).forEach(
    (key) => !["type", "argument"].includes(key) && delete node[key],
  );
};

const livechatIsOnlinePredicate = (node, state, ancestors) => {
  if (node.type !== "MemberExpression") return;

  if (node.property.name !== "isOnline") return;

  if (node.object.type !== "CallExpression") return;

  if (node.object.callee.type !== "MemberExpression") return;

  if (node.object.callee.property.name !== "getLivechatReader") return;

  let targetNode = ancestors[ancestors.length - 2];

  if (targetNode.type !== "CallExpression") targetNode = node;

  const parentPos = ancestors.lastIndexOf(targetNode) - 1;

  // If we're already wrapped with an await, nothing to do
  if (ancestors[parentPos].type === "AwaitExpression") return;

  // console.log(
  //   "TARGET NODE =",
  //   nodeToWrap.type,
  //   "PARENT =",
  //   ancestor[parentPos].type,
  //   "PARENT =",
  //   ancestor[parentPos - 1].type,
  // );

  // If we're in the middle of a chained member access, we can't wrap with await
  if (ancestors[parentPos].type === "MemberExpression") return;

  return () => {
    wrapWithAwait(targetNode);
    asyncifyScope(ancestors);
  }
  // return () => {};
};

pendingOperations.push(livechatIsOnlinePredicate);

// Have we touched the tree?
let isModified = false;

while (pendingOperations.length) {
  const ops = pendingOperations.splice(0);
  console.time("traverse");
  acornWalk.fullAncestor(ast, (node, state, ancestors) => {
    // const fix = livechatIsOnlinePredicate(node, state, ancestors);
    let fix: (() => void) | undefined;

    for (const operation of ops) {
      fix = operation(node, state, ancestors);
      if (fix) {
        break;
      }
    }

    if (!fix || !('call' in fix)) return;

    fix();

    isModified = true;

    // console.log(ancestor[ancestor.length-5],ancestor[ancestor.length-4],ancestor[ancestor.length-3], ancestor[ancestor.length-2]);

    // console.log(ancestor);
    expressions.add(node);
  });
  console.timeEnd("traverse");
}
// console.log(expressions);

if (isModified) {
  console.time("generate");
  const newSource = `(async (exports,module,require,globalThis,Deno) => {
    ${astring.generate(ast)};
  })(exports,module,require);
  `;
  console.timeEnd("generate");

  Deno.writeTextFileSync(
    "./output/modified_ast.json",
    JSON.stringify(ast, undefined, 4),
  );
  Deno.writeTextFileSync("./output/astring_generated_source.js", newSource);
} else {
  console.log('Not modified');
}
