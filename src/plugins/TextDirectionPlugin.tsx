/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$findMatchingParent} from '@lexical/utils';
import {
  $getSelection,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  ElementNode,
  LexicalCommand,
} from 'lexical';
import React, {useEffect} from 'react';

type TextDirection = 'ltr' | 'rtl';

export const DIRECT_ELEMENT_COMMAND: LexicalCommand<TextDirection> =
  createCommand('DIRECT_ELEMENT_COMMAND');

export function TextDirectionPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<TextDirection>(
      DIRECT_ELEMENT_COMMAND,
      (direction) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
          return false;
        }
        const nodes = selection.getNodes();
        for (const node of nodes) {
          const element = $findMatchingParent(
            node,
            (parentNode): parentNode is ElementNode =>
              $isElementNode(parentNode) && !parentNode.isInline(),
          );
          if (element !== null) {
            element.setDirection(direction);
          }
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
