// @deno-types="./acorn.d.ts"
import { AnyNode, AssignmentExpression, AwaitExpression, Expression, Function, Identifier, MethodDefinition, Program, Property } from 'acorn';
// @deno-types="./acorn-walk.d.ts"
import { FullAncestorWalkerCallback } from 'acorn-walk';

export type WalkerState = {
    isModified: boolean;
    functionIdentifiers: Set<string>;
};

const getFunctionIdentifier = (ancestors: AnyNode[], functionNodeIndex: number) => {
    // nodeIndex needs to be the index of a Function node (either FunctionDeclaration or FunctionExpression)
    const currentNode = ancestors[functionNodeIndex] as Function;
    // Function declarations or expressions can be directly named
    if (currentNode.id?.type === 'Identifier') {
        return currentNode.id.name;
    }

    const parent = ancestors[functionNodeIndex - 1];

    // If we don't have a parent node to provide an identifier
    // or that parent is either a Property or MethodDefinition which
    // identifier is dynamically assigned at run time, we cannot determine
    // the proper identification for the node
    if (!parent || (parent as Property | MethodDefinition).computed) return;

    // Several node types can have an id prop of type Identifier
    const { id } = parent as unknown as { id?: Identifier };
    if (id?.type === 'Identifier') {
        return id.name;
    }

    // Usually assignments to object properties (MethodDefinition, Property)
    const { key } = parent as MethodDefinition | Property;
    if (key?.type === 'Identifier') {
        return key.name;
    }

    // Variable assignments have left hand side that can be used as Identifier
    const { left } = parent as AssignmentExpression;
    if (left?.type === 'Identifier') {
        return left.name;
    }
};

const wrapWithAwait = (node: Expression) => {
    if (!node.type.includes('Expression')) {
        throw new Error(`Can't wrap "${node.type}" with await`);
    }

    const innerNode: Expression = { ...node };

    node.type = 'AwaitExpression';
    // starting here node has become an AwaitExpression
    (node as AwaitExpression).argument = innerNode;

    Object.keys(node).forEach((key) => !['type', 'argument'].includes(key) && delete node[key as keyof AnyNode]);
};

const asyncifyScope = (ancestors: AnyNode[], state: WalkerState) => {
    const functionNodeIndex = ancestors.findLastIndex((n) => 'async' in n);
    if (functionNodeIndex === -1) return;

    // At this point this is a node with an "async" property, so it has to be
    // of type Function - let TS know about that
    const functionScopeNode = ancestors[functionNodeIndex] as Function;

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

    const identifier = getFunctionIdentifier(ancestors, functionNodeIndex);

    // We can't fix calls of functions which name we can't determine at compile time
    if (!identifier) return;

    state.functionIdentifiers.add(identifier);
};

export const buildFixModifiedFunctionsOperation =
    (functionIdentifiers: Set<string>): FullAncestorWalkerCallback<WalkerState> =>
    (node, state, ancestors) => {
        if (node.type !== 'CallExpression') return;

        let isWrappable = false;

        // This node is a simple call to a function, like `fn()`
        isWrappable = node.callee.type === 'Identifier' && functionIdentifiers.has(node.callee.name);

        // This node is a call to an object property or instance method, like `obj.fn()`, but not computed like `obj[fn]()`
        isWrappable ||=
            node.callee.type === 'MemberExpression' &&
            !node.callee.computed &&
            node.callee.property?.type === 'Identifier' &&
            functionIdentifiers.has(node.callee.property.name);

        // This is a weird dereferencing technique used by bundlers, and since we'll be dealing with bundled sources we have to check for it
        // e.g. `r=(0,fn)(e)`
        if (!isWrappable && node.callee.type === 'SequenceExpression') {
            const [, secondExpression] = node.callee.expressions;
            isWrappable = secondExpression?.type === 'Identifier' && functionIdentifiers.has(secondExpression.name);
            isWrappable ||=
                secondExpression?.type === 'MemberExpression' &&
                !secondExpression.computed &&
                secondExpression.property.type === 'Identifier' &&
                functionIdentifiers.has(secondExpression.property.name);
        }

        if (!isWrappable) return;

        // ancestors[ancestors.length-1] === node, so here we're checking for parent node
        const parentNode = ancestors[ancestors.length - 2];
        if (!parentNode || parentNode.type === 'AwaitExpression') return;

        wrapWithAwait(node);
        asyncifyScope(ancestors, state);

        state.isModified = true;
    };

export const checkReassignmentOfModifiedIdentifiers: FullAncestorWalkerCallback<WalkerState> = (node, { functionIdentifiers }, _ancestors) => {
    if (node.type === 'AssignmentExpression') {
        if (node.operator !== '=') return;

        let identifier = '';

        if (node.left.type === 'Identifier') identifier = node.left.name;

        if (node.left.type === 'MemberExpression' && !node.left.computed) {
            identifier = (node.left.property as Identifier).name;
        }

        if (!identifier || node.right.type !== 'Identifier' || !functionIdentifiers.has(node.right.name)) return;

        functionIdentifiers.add(identifier);

        return;
    }

    if (node.type === 'VariableDeclarator') {
        if (node.id.type !== 'Identifier' || functionIdentifiers.has(node.id.name)) return;

        if (node.init?.type !== 'Identifier' || !functionIdentifiers.has(node.init?.name)) return;

        functionIdentifiers.add(node.id.name);

        return;
    }

    if (node.type === 'Property') {
        if (node.key.type !== 'Identifier' || functionIdentifiers.has(node.key.name)) return;

        if (node.value?.type !== 'Identifier' || !functionIdentifiers.has(node.value.name)) return;

        functionIdentifiers.add(node.key.name);

        return;
    }
};

export const fixLivechatIsOnlineCalls: FullAncestorWalkerCallback<WalkerState> = (node, state, ancestors) => {
    if (node.type !== 'MemberExpression' || node.computed) return;

    if ((node.property as Identifier).name !== 'isOnline') return;

    if (node.object.type !== 'CallExpression') return;

    if (node.object.callee.type !== 'MemberExpression') return;

    if ((node.object.callee.property as Identifier).name !== 'getLivechatReader') return;

    let parentIndex = ancestors.length - 2;
    let targetNode = ancestors[parentIndex];

    if (targetNode.type !== 'CallExpression') {
        targetNode = node;
    } else {
        parentIndex--;
    }

    // If we're already wrapped with an await, nothing to do
    if (ancestors[parentIndex].type === 'AwaitExpression') return;

    // If we're in the middle of a chained member access, we can't wrap with await
    if (ancestors[parentIndex].type === 'MemberExpression') return;

    wrapWithAwait(targetNode);
    asyncifyScope(ancestors, state);

    state.isModified = true;
};
