import {
  $unwrapMarkNode,
  $wrapSelectionInMarkNode,
  MarkNode,
  SerializedMarkNode,
} from '@lexical/mark';
import {
  $applyNodeReplacement,
  $createRangeSelection,
  EditorConfig,
  LexicalNode,
  NodeKey,
  RangeSelection,
  Spread,
} from 'lexical';
import {Comment, Thread} from '../commenting';
import {hexToRgba} from '../utils/colorHelpers';

export type SerializedCommentNode = Spread<
  {
    comment: string;
    color?: string;
  },
  SerializedMarkNode
>;

export class CommentNode extends MarkNode {
  static getType(): string {
    return 'comment';
  }

  static clone(node: CommentNode): CommentNode {
    return new CommentNode(
      node.getIDs(),
      node.__comment,
      node.__color,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedCommentNode): CommentNode {
    return $createCommentNode(
      serializedNode.ids,
      serializedNode.comment,
      serializedNode.color,
    ).updateFromJSON(serializedNode);
  }

  getType(): string {
    return 'comment';
  }

  __comment: string;
  __color?: string;

  constructor(ids: string[], comment: string, color?: string, key?: NodeKey) {
    super(ids, key);
    this.__comment = comment;
    this.__color = color;
  }

  updateDOM(
    prevNode: this,
    element: HTMLElement,
    config: EditorConfig,
  ): boolean {
    const delBtn = element.querySelector('.delete-comment-btn') as
      | HTMLButtonElement
      | undefined;

    if (!delBtn || delBtn.dataset.key != `${this.getKey()}`) {
      return true;
    }

    return super.updateDOM(prevNode, element, config);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const mainMark = super.createDOM(config);
    mainMark.classList.add('comment-container');

    const commentWrapper = document.createElement('div');
    commentWrapper.classList.add('comment-box-wrapper');

    const commentBox = document.createElement('div');
    commentBox.innerHTML = `<button class="delete-comment-btn" data-key="${this.getKey()}"><i class="clear" /></button>`;

    commentBox.append(this.__comment);
    commentBox.classList.add('comment-box');
    commentWrapper.appendChild(commentBox);

    mainMark.appendChild(commentWrapper);

    if (this.__color) {
      mainMark.style.backgroundColor = `${hexToRgba(this.__color, 0.4)}`;
      commentBox.style.backgroundColor = `${hexToRgba(this.__color, 0.4)}`;
    }

    return mainMark;
  }

  exportJSON(): SerializedCommentNode {
    const jsonObj: SerializedCommentNode = {
      ...super.exportJSON(),
      comment: this.getComment(),
    };

    if (this.__color) {
      jsonObj.color = this.__color;
    }

    return jsonObj;
  }

  getComment() {
    const self = this.getLatest();
    return self.__comment;
  }
}

export function $isCommentNode(
  node: LexicalNode | null | undefined,
): node is CommentNode {
  return node instanceof CommentNode;
}

export function $createCommentNode(
  ids: string[],
  comment: string,
  color?: string,
): CommentNode {
  const node = new CommentNode(ids, comment, color);
  return $applyNodeReplacement(node);
}

export function $unwrapSelectionFromMarkNode(selection: RangeSelection) {
  const forwardSelection = $createRangeSelection();
  const [startPoint, endPoint] = selection.isBackward()
    ? [selection.focus, selection.anchor]
    : [selection.anchor, selection.focus];
  forwardSelection.anchor.set(
    startPoint.key,
    startPoint.offset,
    startPoint.type,
  );
  forwardSelection.focus.set(endPoint.key, endPoint.offset, endPoint.type);

  // Note that extract will split text nodes at the boundaries
  const nodes = selection.getNodes();

  const commentNodes = nodes.filter((n) => $isCommentNode(n));
  // debugger;

  const {anchor, focus} = forwardSelection;

  for (const cmntNode of commentNodes) {
    const anchorNode = anchor.getNode();
    const focusNode = focus.getNode();

    const isAnchorParent = cmntNode.isParentOf(anchorNode);
    const isFocusParent = cmntNode.isParentOf(focusNode);

    $unwrapMarkNode(cmntNode);

    if (isAnchorParent && anchor.offset > 0) {
      const range = $createRangeSelection();

      range.anchor.set(anchorNode.getKey(), 0, anchor.type);
      range.focus.set(anchorNode.getKey(), anchor.offset, anchor.type);

      $wrapSelectionInMarkNode(range, false, anchorNode.getKey(), (ids) =>
        CommentNode.clone(cmntNode).setIDs(ids),
      );
    }

    if (isFocusParent) {
      const range = $createRangeSelection();

      range.anchor.set(anchorNode.getKey(), focus.offset, anchor.type);
      range.focus.set(
        anchorNode.getKey(),
        focusNode.getTextContent().length,
        anchor.type,
      );

      $wrapSelectionInMarkNode(range, false, anchorNode.getKey(), (ids) =>
        CommentNode.clone(cmntNode).setIDs(ids),
      );
    }
  }
}

export function $commentWrapper(
  ids: string[],
  comment: Comment | Thread,
  color?: string,
) {
  if (comment.type == 'comment') {
    return $createCommentNode(ids, comment.content, color);
  } else {
    return $createCommentNode(ids, comment.comments[0].content, color);
  }
}
