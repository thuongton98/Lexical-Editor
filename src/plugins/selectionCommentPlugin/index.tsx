import {computePosition, flip, shift} from '@floating-ui/dom';
import {$unwrapMarkNode} from '@lexical/mark';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {$getNodeByKey} from 'lexical';
import {useEffect} from 'react';
import {createPortal} from 'react-dom';
import {
  $commentWrapper,
  $isCommentNode,
  CommentNode,
} from '../../nodes/CommentNode';
import {useCommentInputBox} from '../shared/hooks/useCommentInputBox';
import {CommentInputBox} from '../shared/ui/CommentInputBox';
import './index.css';

export function SelctionCommentPlugin() {
  const [editor] = useLexicalComposerContext();
  const {showCommentInput, cancelAddComment, submitAddComment} =
    useCommentInputBox({
      nodeWrapper: $commentWrapper,
    });

  useEffect(() => {
    function mouseEnterHandler(event: MouseEvent) {
      const elem = event.target as HTMLElement;
      const commentContainer = elem.closest('.comment-container');

      if (commentContainer && commentContainer != elem) {
        const commentBox = commentContainer.querySelector(
          '.comment-box-wrapper',
        );
        if (!commentBox || !(commentBox instanceof HTMLElement)) {
          return;
        }

        const editor = commentContainer.closest(
          '.editor-container',
        ) as HTMLElement;

        if (!editor) {
          throw new Error('No editor detected. Thats weird');
        }

        computePosition(commentContainer, commentBox, {
          middleware: [flip({boundary: editor}), shift({boundary: editor})],
        }).then(({x, y}) => {
          Object.assign(commentBox.style, {
            left: `${x}px`,
            top: `${y}px`,
          });
        });
      }
    }

    function mouseOutHandler(event: MouseEvent) {
      const elem = event.target as HTMLElement;
      const commentContainer = elem.closest('.comment-container');

      if (commentContainer && commentContainer != elem) {
      }
    }

    function deleteComment(event: MouseEvent) {
      const elem = (event.target as HTMLElement).parentElement;
      if (
        !elem ||
        !elem.classList.contains('delete-comment-btn') ||
        !elem.dataset.key
      ) {
        return;
      }

      editor.update(() => {
        const key = elem.dataset.key!;

        const node = $getNodeByKey(key);
        if (!node || !$isCommentNode(node)) {
          return;
        }

        $unwrapMarkNode(node);
      });
    }

    return mergeRegister(
      editor.registerRootListener((root, prevRoot) => {
        // add the listener to the current root element
        root?.addEventListener('mouseover', mouseEnterHandler);
        root?.addEventListener('mouseout', mouseOutHandler);

        // remove the listener from the old root element - make sure the ref to myListener
        // is stable so the removal works and you avoid a memory leak.
        prevRoot?.removeEventListener('mouseover', mouseEnterHandler);
        prevRoot?.removeEventListener('mouseout', mouseOutHandler);
      }),
      editor.registerMutationListener(CommentNode, (mutations) => {
        editor.getEditorState().read(() => {
          for (const [key, mutation] of mutations) {
            const element: null | HTMLElement = editor.getElementByKey(key);
            if (
              (mutation === 'created' || mutation === 'updated') &&
              element !== null
            ) {
              (
                element.querySelector('.delete-comment-btn') as
                  | HTMLElement
                  | undefined
              )?.addEventListener('click', deleteComment);
            }
          }
        });
      }),
    );
  }, [editor]);

  return (
    <>
      {showCommentInput &&
        createPortal(
          <CommentInputBox
            editor={editor}
            cancelAddComment={cancelAddComment}
            submitAddComment={submitAddComment}
          />,
          document.body,
        )}
    </>
  );
}
