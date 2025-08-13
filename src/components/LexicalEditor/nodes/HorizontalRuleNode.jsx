import { DecoratorNode } from 'lexical';

export class HorizontalRuleNode extends DecoratorNode {
  static getType() {
    return 'horizontalrule';
  }

  static clone(node) {
    return new HorizontalRuleNode(node.__key);
  }

  static importJSON(serializedNode) {
    return $createHorizontalRuleNode();
  }

  static importDOM() {
    return {
      hr: () => ({
        conversion: convertHorizontalRuleElement,
        priority: 0,
      }),
    };
  }

  exportJSON() {
    return {
      type: 'horizontalrule',
      version: 1,
    };
  }

  exportDOM() {
    return { element: document.createElement('hr') };
  }

  createDOM() {
    const element = document.createElement('hr');
    element.style.border = 'none';
    element.style.height = '2px';
    element.style.background = '#ccc';
    element.style.margin = '20px 0';
    return element;
  }

  getTextContent() {
    return '\n';
  }

  isInline() {
    return false;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return <hr style={{ border: 'none', height: '2px', background: '#ccc', margin: '20px 0' }} />;
  }
}

function convertHorizontalRuleElement() {
  return { node: $createHorizontalRuleNode() };
}

export function $createHorizontalRuleNode() {
  return new HorizontalRuleNode();
}

export function $isHorizontalRuleNode(node) {
  return node instanceof HorizontalRuleNode;
}