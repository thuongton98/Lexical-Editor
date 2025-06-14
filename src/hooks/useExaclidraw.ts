import {
  AppState,
  BinaryFiles,
} from '@excalidraw/excalidraw/dist/types/excalidraw/types';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$wrapNodeInElement} from '@lexical/utils';
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical';
import {useEffect} from 'react';
import {$createExcalidrawNode, ExcalidrawNode} from '../nodes/ExcalidrawNode';
import {INSERT_EXCALIDRAW_COMMAND} from '../plugins/ExcalidrawPlugin';
import {ExcalidrawInitialElements} from '../ui/ExcalidrawModal';

export function useExcalidraw(options: {
  handleOnExcaliDrawRequest: () => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ExcalidrawNode])) {
      throw new Error(
        'ExcalidrawPlugin: ExcalidrawNode not registered on editor',
      );
    }

    return editor.registerCommand(
      INSERT_EXCALIDRAW_COMMAND,
      () => {
        options.handleOnExcaliDrawRequest();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  const onSave = (
    elements: ExcalidrawInitialElements,
    appState: Partial<AppState>,
    files: BinaryFiles,
  ) => {
    editor.update(() => {
      const excalidrawNode = $createExcalidrawNode();
      excalidrawNode.setData(
        JSON.stringify({
          appState,
          elements,
          files,
        }),
      );
      $insertNodes([excalidrawNode]);
      if ($isRootOrShadowRoot(excalidrawNode.getParentOrThrow())) {
        $wrapNodeInElement(excalidrawNode, $createParagraphNode).selectEnd();
      }
    });
  };

  return {
    onSave,
  };
}
