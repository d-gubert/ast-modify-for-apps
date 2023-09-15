import { acorn, acornWalk, astring } from "./deps.ts";

const originalSource = new TextDecoder().decode(
  Deno.readFileSync("./simple_test.js"),
);

// console.log(meriyah.parseScript(googleCalendarAppSource, { specDeviation: true }));
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
  "./original_ast.json",
  JSON.stringify(ast, undefined, 4),
);

const expressions = new Set();
const asyncifyScope = (node, state, ancestor) => {
  const parentFunctionScope = ancestor.find((n) => "async" in n);
  if (!parentFunctionScope) return;
  console.log({ parentFunctionScope });

  if (parentFunctionScope.async) {
    return false;
  }

  parentFunctionScope.async = true;
  return true;
  // console.log(ancestor.find((n) => n.type === "Program"));
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

const livechatIsOnlinePredicate = (node, state, ancestor) => {
  if (node.type !== "MemberExpression") return;

  if (node.property.name !== "isOnline") return;

  if (node.object.type !== "CallExpression") return;

  if (node.object.callee.type !== "MemberExpression") return;

  if (node.object.callee.property.name !== "getLivechatReader") return;

  let nodeToWrap = ancestor[ancestor.length - 2];

  if (nodeToWrap.type !== "CallExpression") nodeToWrap = node;

  const parentPos = ancestor.lastIndexOf(nodeToWrap) - 1;

  // If we're already wrapped with an await, nothing to do
  if (ancestor[parentPos].type === "AwaitExpression") return;

  // console.log(
  //   "TARGET NODE =",
  //   nodeToWrap.type,
  //   "PARENT =",
  //   ancestor[parentPos].type,
  //   "PARENT =",
  //   ancestor[parentPos - 1].type,
  // );

  // If we're in the middle of a chained member access, we can't wrap with await
  if (ancestor[parentPos].type === "MemberExpression") return;

  return wrapWithAwait.bind(null, nodeToWrap);
  // return () => {};
};

console.time("traverse");
acornWalk.fullAncestor(ast, (node, state, ancestor) => {
  const fix = predicate(node, state, ancestor);
  if (!fix) return;

  fix();

  asyncifyScope(node, state, ancestor);

  // console.log(ancestor[ancestor.length-5],ancestor[ancestor.length-4],ancestor[ancestor.length-3], ancestor[ancestor.length-2]);

  // console.log(ancestor);
  expressions.add(node);
});
console.timeEnd("traverse");
// console.log(expressions);

console.time("generate");
const newSource = astring.generate(ast);
console.timeEnd("generate");

Deno.writeTextFileSync(
  "./modified_ast.json",
  JSON.stringify(ast, undefined, 4),
);
Deno.writeTextFileSync("./astring_generated_source.js", newSource);
