import {VNode, VNodeProperties} from 'maquette';
import {Simulator, createSimulator} from './simulator';
import {NodeQuery, NodeListQuery, QueryBase, VNodePredicate} from './query';

/**
 * see `createTestProjector`
 */
export interface TestProjector extends QueryBase {
  initialize: (renderMaquette: () => VNode) => void;
  uninitialize: () => void;
  root: NodeQuery;
}

// Helper functions
// ----------------

let makeSelectorFunction = (selector: string | VNodePredicate): VNodePredicate => {
  if (typeof selector === 'string') {
    return (vNode: VNode) => {
      let index = vNode.vnodeSelector.indexOf(selector);
      if ((selector[0] === '.' || selector[0] === '#') ? (index > 0) : (index === 0)) {
        let nextChar = vNode.vnodeSelector.charAt(index + selector.length);
        return !nextChar || nextChar === '.' || nextChar === '#';
      }
      return false;
    };
  } else if (typeof selector === 'function') {
    return selector;
  } else {
    throw new Error('Invalid selector ' + selector);
  }
};

let filterDescendants = (root: VNode, predicate: VNodePredicate): VNode[] => {
  let results: VNode[] = [];
  let visit = (vnodeTree: VNode) => {
    if (vnodeTree.children) {
      vnodeTree.children.forEach((child: VNode) => {
        if (predicate(child)) {
          results.push(child);
        }
        visit(child);
      });
    }
  };
  visit(root);
  return results;
};

let collectTextContent = (vnodeTree: VNode, results: string[]): string[] => {
  if (vnodeTree.vnodeSelector === '') {
    results.push((<any>vnodeTree).text);
  } else {
    if ((<any>vnodeTree).text) {
      results.push((<any>vnodeTree).text);
    }
    if (vnodeTree.children) {
      vnodeTree.children.forEach((child: any): any => {
        collectTextContent(child, results);
      });
    }
  }
  return results;
};

// The create methods

let createCollectionQuery: (getVNodes: () => VNode[]) => NodeListQuery;

let createQuery = (getVNode: () => VNode): NodeQuery => {
  let query = (selector: string | VNodePredicate, fakeDomNode?: Object) => {
    let predicate = makeSelectorFunction(selector);
    return createQuery(() => filterDescendants(getVNode(), predicate)[0]);
  };
  let queryAll = (selector: string | VNodePredicate) => {
    let predicate = makeSelectorFunction(selector);
    return createCollectionQuery(() => filterDescendants(getVNode(), predicate));
  };
  let getResult = () => {
    let result = getVNode();
    if (!result) {
      throw new Error('Query did not match a VNode');
    }
    return result;
  };
  let targetDomNode: Object;
  return {
    execute: getResult,
    exists: () => !!getVNode(),
    query,
    queryAll,
    get textContent(): string {
      return collectTextContent(getResult(), []).join('');
    },
    get vnodeSelector(): string {
      return getResult().vnodeSelector;
    },
    get properties(): VNodeProperties {
      return getResult().properties;
    },
    get children(): VNode[] {
      return getResult().children;
    },
    getChild: (index: number) => {
      return createQuery(() => {
        return getResult().children[index];
      });
    },
    /**
     * A small facade that allows firing of simple events and sequences of events for common usecases.
     * It is not meant to be exhaustive.
     * If you need to simulate something that is not in here, you can simply invoke query(...).properties.on???() yourself.
     */
    get simulate(): Simulator { return createSimulator(getResult(), targetDomNode); },
    setTargetDomNode: (target) => {
      targetDomNode = target;
    },
    getTargetDomNode: () => {
      return targetDomNode as any;
    }
  };
};

createCollectionQuery = (getVNodes: () => VNode[]): NodeListQuery => {
  return {
    execute: getVNodes,
    getResult: (index) => {
      return createQuery(() => {
        return getVNodes()[index];
      });
    },
    get length() {
      return getVNodes().length;
    }
  };
};

/**
 * Creates a test projector which implements the QueryBase interface
 * @param renderMaquetteFunction  Optional, the renderMaquette function that is used to produce the VNode tree.
 *                                when not specified, you must use the initialize function to supply the renderMaquetteFunction.
 */
export let createTestProjector = (renderMaquetteFunction?: () => VNode): TestProjector => {
  let getRootVNode = () => {
    if (!renderMaquetteFunction) {
      throw new Error('TestProjector is not initialized');
    }
    return renderMaquetteFunction();
  };

  let createQueryStart = createQuery(() => {
    return {
      children: [getRootVNode()]
    } as any as VNode;
  });

  return {
    initialize: (initializeRenderMaquetteFunction: () => VNode) => {
      renderMaquetteFunction = initializeRenderMaquetteFunction;
    },
    uninitialize: () => {
      renderMaquetteFunction = undefined;
    },
    root: createQuery(getRootVNode),
    query: createQueryStart.query,
    queryAll: createQueryStart.queryAll
  };
};
