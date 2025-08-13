import {
  $applyNodeReplacement,
  DecoratorNode,
  createCommand,
} from 'lexical';
import React from 'react';
import styled from 'styled-components';

const MentionContainer = styled.span`
  background-color: rgba(24, 119, 242, 0.2);
  color: #1877f2;
  border-radius: 8px;
  padding: 1px 0.25rem;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(24, 119, 242, 0.3);
  }
`;

function MentionComponent({ nodeKey, mentionName }) {
  return (
    <MentionContainer
      onClick={() => {
        // Handle mention click - could open profile, etc.
        console.log('Mention clicked:', mentionName);
      }}
    >
      @{mentionName}
    </MentionContainer>
  );
}

export class MentionNode extends DecoratorNode {
  __mention;

  static getType() {
    return 'mention';
  }

  static clone(node) {
    return new MentionNode(node.__mention, node.__key);
  }

  static importJSON(serializedNode) {
    const node = $createMentionNode(serializedNode.mentionName);
    return node;
  }

  constructor(mentionName, key) {
    super(key);
    this.__mention = mentionName;
  }

  exportJSON() {
    return {
      mentionName: this.__mention,
      type: 'mention',
      version: 1,
    };
  }

  createDOM(config) {
    const dom = document.createElement('span');
    dom.style.color = '#1877f2';
    return dom;
  }

  updateDOM() {
    return false;
  }

  getMentionName() {
    return this.__mention;
  }

  decorate() {
    return (
      <MentionComponent
        nodeKey={this.getKey()}
        mentionName={this.__mention}
      />
    );
  }
}

export function $createMentionNode(mentionName) {
  const mentionNode = new MentionNode(mentionName);
  return $applyNodeReplacement(mentionNode);
}

export function $isMentionNode(node) {
  return node instanceof MentionNode;
}