import {
  $applyNodeReplacement,
  DecoratorNode,
} from 'lexical';
import React from 'react';
import styled from 'styled-components';

const EmojiContainer = styled.span`
  font-size: 1.2em;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    transform: scale(1.1);
    transition: transform 0.1s ease;
  }
`;

function EmojiComponent({ nodeKey, emojiText, emojiName }) {
  return (
    <EmojiContainer
      title={emojiName}
      onClick={() => {
        console.log('Emoji clicked:', emojiName);
      }}
    >
      {emojiText}
    </EmojiContainer>
  );
}

export class EmojiNode extends DecoratorNode {
  __emoji;
  __emojiName;

  static getType() {
    return 'emoji';
  }

  static clone(node) {
    return new EmojiNode(node.__emoji, node.__emojiName, node.__key);
  }

  static importJSON(serializedNode) {
    const node = $createEmojiNode(serializedNode.emoji, serializedNode.emojiName);
    return node;
  }

  constructor(emoji, emojiName, key) {
    super(key);
    this.__emoji = emoji;
    this.__emojiName = emojiName;
  }

  exportJSON() {
    return {
      emoji: this.__emoji,
      emojiName: this.__emojiName,
      type: 'emoji',
      version: 1,
    };
  }

  createDOM(config) {
    const dom = document.createElement('span');
    dom.className = 'emoji-node';
    return dom;
  }

  updateDOM() {
    return false;
  }

  getEmoji() {
    return this.__emoji;
  }

  getEmojiName() {
    return this.__emojiName;
  }

  decorate() {
    return (
      <EmojiComponent
        nodeKey={this.getKey()}
        emojiText={this.__emoji}
        emojiName={this.__emojiName}
      />
    );
  }
}

export function $createEmojiNode(emoji, emojiName) {
  const emojiNode = new EmojiNode(emoji, emojiName);
  return $applyNodeReplacement(emojiNode);
}

export function $isEmojiNode(node) {
  return node instanceof EmojiNode;
}