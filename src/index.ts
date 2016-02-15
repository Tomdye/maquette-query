import {VNode, VNodeProperties} from 'maquette';

export interface MouseEventParameters {
  pageX?: number;
  pageY?: number;
}

/**
 * A small facade that allows firing of simple events for common usecases.
 *
 * If you need to have more control of the properties on the event, you can always invoke the VQuery.properties.on???() yourself.
 */
export interface Simulator {
  keyDown: (keyCode: number, targetElement?: any) => KeyboardEvent;
  keyUp: (keyCode: number, targetElement?: any) => KeyboardEvent;
  mouseDown: (targetElement: any, parameters?: MouseEventParameters) => MouseEvent;
  mouseUp: (targetElement: any, parameters?: MouseEventParameters) => MouseEvent;
  input: (targetElement: any) => Event;
  change: (targetElement: any) => Event;
  focus: (targetElement?: any) => Event;
  blur: (targetElement?: any) => Event;
  keyPress: (keyCode: number, valueBefore: string, valueAfter: string, targetElement?: any) => void;
}

export interface MaquetteQuery {
  findAll: (selector: string) => MaquetteQuery[];
  find: (selector: string) => MaquetteQuery;
  text: () => string;
  vnodeSelector: string;
  properties: VNodeProperties;
  children: MaquetteQuery[];
  simulate: Simulator;
}

type VNodePredicate = (vnode: VNode) => boolean;

let makeSelectorFunction = (selector: string): VNodePredicate => {
  if (typeof selector === 'function') {
    return <any>selector;
  }
  if (typeof selector === 'string') {
    return (vNode: VNode) => {
      let index = vNode.vnodeSelector.indexOf(selector);
      if ((selector[0] === '.' || selector[0] === '#') ? (index > 0) : (index === 0)) {
        let nextChar = vNode.vnodeSelector.charAt(index + selector.length);
        return !nextChar || nextChar === '.' || nextChar === '#';
      }
      return false;
    };
  }
  throw new Error('Invalid selector ' + selector);
};

export let query: (vnodeTree: VNode) => MaquetteQuery;

let findAll = (selector: VNodePredicate, vnodeTree: VNode, results: MaquetteQuery[]): MaquetteQuery[] => {
  if (selector(vnodeTree)) {
    results.push(query(vnodeTree));
  }
  if (vnodeTree.children) {
    vnodeTree.children.forEach((child: VNode) => {
      findAll(selector, child, results);
    });
  }
  return results;
};

let text = (vnodeTree: VNode, results: string[]): string[] => {
  if (vnodeTree.vnodeSelector === '') {
    results.push((<any>vnodeTree).text);
  } else {
    if ((<any>vnodeTree).text) {
      results.push((<any>vnodeTree).text);
    }
    if (vnodeTree.children) {
      vnodeTree.children.forEach((child: any): any => {
        text(child, results);
      });
    }
  }
  return results;
};

let createEvent = (target: any): Event => {
  let result = {
    defaultPrevented: false,
    propagationStopped: false,
    preventDefault: () => {
      result.defaultPrevented = true;
    },
    stopPropagation: () => {
      result.propagationStopped = true;
    },
    target
  };
  return <any>result;
};

let createKeyEvent = (which: number, target: any): KeyboardEvent => {
  let event = <any>createEvent(target);
  event.which = which;
  return event;
};

let createMouseEvent = (target: any, parameters?: MouseEventParameters): MouseEvent => {
  let event = <any>createEvent(target);
  if (parameters) {
    event.pageX = parameters.pageX;
    event.pageY = parameters.pageY;
  }
  return event;
};

let createFocusEvent = (target: any): FocusEvent => {
  return <any>createEvent(target);
};

let createSimulator = (vnode: VNode): Simulator => {
  let properties = vnode.properties;
  return {

    keyDown: (keyCode: number, targetElement: any) => {
      let event = createKeyEvent(keyCode, targetElement);
      properties.onkeydown(event);
      return event;
    },

    keyUp: (keyCode: number, targetElement: any) => {
      let event = createKeyEvent(keyCode, targetElement);
      properties.onkeyup(event);
      return event;
    },

    mouseDown: (targetElement: any, parameters?: MouseEventParameters) => {
      let event = createMouseEvent(targetElement, parameters);
      properties.onmousedown(event);
      return event;
    },

    mouseUp: (targetElement: any, parameters?: MouseEventParameters) => {
      let event = createMouseEvent(targetElement, parameters);
      properties.onmouseup(event);
      return event;
    },

    input: (targetElement: any) => {
      let event = createEvent(targetElement);
      properties.oninput(event);
      return event;
    },

    change: (targetElement: any) => {
      let event = createEvent(targetElement);
      properties.onchange(event);
      return event;
    },

    focus: (targetElement?: any) => {
      let event = createFocusEvent(targetElement);
      properties.onfocus(event);
      return event;
    },

    blur: (targetElement?: any) => {
      let event = createFocusEvent(targetElement);
      properties.onblur(event);
      return event;
    },

    keyPress: (keyCode: number, valueBefore: string, valueAfter: string, targetElement?: any) => {
      targetElement = targetElement || {};
      targetElement.value = valueBefore;
      if (properties.onkeydown) {
        properties.onkeydown(createKeyEvent(keyCode, targetElement));
      }
      targetElement.value = valueAfter;
      if (properties.onkeyup) {
        properties.onkeyup(createKeyEvent(keyCode, targetElement));
      }
      if (properties.oninput) {
        properties.oninput(createEvent(targetElement));
      }
    }

  };
};

query = (vnodeTree: VNode): MaquetteQuery => {
  let children = <MaquetteQuery[]>[];
  return {
    findAll: (selector: string) => {
      return findAll(makeSelectorFunction(selector), vnodeTree, []);
    },
    find: (selector: string) => {
      return findAll(makeSelectorFunction(selector), vnodeTree, [])[0];
    },
    text: () => {
      return text(vnodeTree, []).join('');
    },
    vnodeSelector: vnodeTree.vnodeSelector,
    properties: vnodeTree.properties,
    get children() { return children || (children = vnodeTree.children.map(query)); }, // lazyness is by design
    get simulate() { return createSimulator(vnodeTree); }
  };
};