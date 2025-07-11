/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {LexicalEditor} from 'lexical';
import type {JSX} from 'react';

import {$createCodeNode, $isCodeNode} from '@lexical/code';
import {
  editorStateFromSerializedDocument,
  exportFile,
  importFile,
  SerializedDocument,
  serializedDocumentFromEditorState,
} from '@lexical/file';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from '@lexical/markdown';
import {useCollaborationContext} from '@lexical/react/LexicalCollaborationContext';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {CONNECTED_COMMAND, TOGGLE_CONNECT_COMMAND} from '@lexical/yjs';
import {
  $createTextNode,
  $getRoot,
  $isParagraphNode,
  CLEAR_EDITOR_COMMAND,
  CLEAR_HISTORY_COMMAND,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical';
import {useCallback, useEffect, useState} from 'react';

import {INITIAL_SETTINGS} from '../../appSettings';
import {useActionsState} from '../../context/ActionsContext';
import useFlashMessage from '../../hooks/useFlashMessage';
import useModal from '../../hooks/useModal';
import Button from '../../ui/Button';
import {docFromHash, docToHash} from '../../utils/docSerialization';
import {PLAYGROUND_TRANSFORMERS} from '../MarkdownTransformers';
import {
  SPEECH_TO_TEXT_COMMAND,
  SUPPORT_SPEECH_RECOGNITION,
} from '../SpeechToTextPlugin';

async function sendEditorState(editor: LexicalEditor): Promise<void> {
  const stringifiedEditorState = JSON.stringify(editor.getEditorState());
  try {
    await fetch('http://localhost:1235/setEditorState', {
      body: stringifiedEditorState,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      method: 'POST',
    });
  } catch {
    // NO-OP
  }
}

async function validateEditorState(editor: LexicalEditor): Promise<void> {
  const stringifiedEditorState = JSON.stringify(editor.getEditorState());
  let response = null;
  try {
    response = await fetch('http://localhost:1235/validateEditorState', {
      body: stringifiedEditorState,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      method: 'POST',
    });
  } catch {
    // NO-OP
  }
  if (response !== null && response.status === 403) {
    throw new Error(
      'Editor state validation failed! Server did not accept changes.',
    );
  }
}

async function shareDoc(doc: SerializedDocument): Promise<void> {
  const url = new URL(window.location.toString());
  url.hash = await docToHash(doc);
  const newUrl = url.toString();
  window.history.replaceState({}, '', newUrl);
  await window.navigator.clipboard.writeText(newUrl);
}

export default function ActionsPlugin({
  isRichText,
  shouldPreserveNewLinesInMarkdown,
}: {
  isRichText: boolean;
  shouldPreserveNewLinesInMarkdown: boolean;
}): JSX.Element {
  const actionState = useActionsState();
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [connected, setConnected] = useState(false);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [modal, showModal] = useModal();
  const {isCollabActive} = useCollaborationContext();
  useEffect(() => {
    if (INITIAL_SETTINGS.isCollab) {
      return;
    }
    docFromHash(window.location.hash).then((doc) => {
      if (doc && doc.source === 'Playground') {
        editor.setEditorState(editorStateFromSerializedDocument(editor, doc));
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      }
    });
  }, [editor]);
  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      editor.registerCommand<boolean>(
        CONNECTED_COMMAND,
        (payload) => {
          const isConnected = payload;
          setConnected(isConnected);
          return false;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(
      ({dirtyElements, prevEditorState, tags}) => {
        // If we are in read only mode, send the editor state
        // to server and ask for validation if possible.
        // if (
        //   !isEditable &&
        //   dirtyElements.size > 0 &&
        //   !tags.has(HISTORIC_TAG) &&
        //   !tags.has(COLLABORATION_TAG)
        // ) {
        //   validateEditorState(editor);
        // }
        editor.getEditorState().read(() => {
          const root = $getRoot();
          const children = root.getChildren();

          if (children.length > 1) {
            setIsEditorEmpty(false);
          } else {
            if ($isParagraphNode(children[0])) {
              const paragraphChildren = children[0].getChildren();
              setIsEditorEmpty(paragraphChildren.length === 0);
            } else {
              setIsEditorEmpty(false);
            }
          }
        });
      },
    );
  }, [editor, isEditable]);

  return (
    <div className="actions">
      {!!actionState.speechAction && <SpeechAction />}
      {!!actionState.importAction && <ImportAction />}
      {!!actionState.exportAction && <ExportAction />}
      {!!actionState.shareAction && <ShareAction />}
      {!!actionState.clearAction && (
        <ClearAction isEditorEmpty={isEditorEmpty} showModal={showModal} />
      )}
      {!!actionState.readonlyAction && <ReadonlyAction />}
      {!!actionState.markDownAction && (
        <MarkdownAction
          shouldPreserveNewLinesInMarkdown={shouldPreserveNewLinesInMarkdown}
        />
      )}
      {isCollabActive && (
        <button
          className="action-button connect"
          onClick={() => {
            editor.dispatchCommand(TOGGLE_CONNECT_COMMAND, !connected);
          }}
          title={`${
            connected ? 'Disconnect' : 'Connect'
          } Collaborative Editing`}
          aria-label={`${
            connected ? 'Disconnect from' : 'Connect to'
          } a collaborative editing server`}>
          <i className={connected ? 'disconnect' : 'connect'} />
        </button>
      )}
      {modal}
    </div>
  );
}

function ShowClearDialog({
  editor,
  onClose,
}: {
  editor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  return (
    <>
      Are you sure you want to clear the editor?
      <div className="Modal__content">
        <Button
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
            editor.focus();
            onClose();
          }}>
          Clear
        </Button>{' '}
        <Button
          onClick={() => {
            editor.focus();
            onClose();
          }}>
          Cancel
        </Button>
      </div>
    </>
  );
}

function MarkdownAction({
  shouldPreserveNewLinesInMarkdown,
}: {
  shouldPreserveNewLinesInMarkdown: boolean;
}) {
  const [editor] = useLexicalComposerContext();

  const handleMarkdownToggle = useCallback(() => {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();
      if ($isCodeNode(firstChild) && firstChild.getLanguage() === 'markdown') {
        $convertFromMarkdownString(
          firstChild.getTextContent(),
          PLAYGROUND_TRANSFORMERS,
          undefined, // node
          shouldPreserveNewLinesInMarkdown,
        );
      } else {
        const markdown = $convertToMarkdownString(
          PLAYGROUND_TRANSFORMERS,
          undefined, //node
          shouldPreserveNewLinesInMarkdown,
        );
        const codeNode = $createCodeNode('markdown');
        codeNode.append($createTextNode(markdown));
        root.clear().append(codeNode);
        if (markdown.length === 0) {
          codeNode.select();
        }
      }
    });
  }, [editor, shouldPreserveNewLinesInMarkdown]);

  return (
    <button
      className="action-button"
      onClick={handleMarkdownToggle}
      title="Convert From Markdown"
      aria-label="Convert from markdown">
      <i className="markdown" />
    </button>
  );
}

function SpeechAction() {
  const [editor] = useLexicalComposerContext();
  const [isSpeechToText, setIsSpeechToText] = useState(false);

  return (
    <>
      {SUPPORT_SPEECH_RECOGNITION && (
        <button
          onClick={() => {
            editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText);
            setIsSpeechToText(!isSpeechToText);
          }}
          className={
            'action-button action-button-mic ' +
            (isSpeechToText ? 'active' : '')
          }
          title="Speech To Text"
          aria-label={`${
            isSpeechToText ? 'Enable' : 'Disable'
          } speech to text`}>
          <i className="mic" />
        </button>
      )}
    </>
  );
}

function ImportAction() {
  const [editor] = useLexicalComposerContext();

  return (
    <button
      className="action-button import"
      onClick={() => importFile(editor)}
      title="Import"
      aria-label="Import editor state from JSON">
      <i className="import" />
    </button>
  );
}

function ExportAction() {
  const [editor] = useLexicalComposerContext();

  return (
    <button
      className="action-button export"
      onClick={() =>
        exportFile(editor, {
          fileName: `Playground ${new Date().toISOString()}`,
          source: 'Playground',
        })
      }
      title="Export"
      aria-label="Export editor state to JSON">
      <i className="export" />
    </button>
  );
}

function ShareAction() {
  const [editor] = useLexicalComposerContext();
  const {isCollabActive} = useCollaborationContext();
  const showFlashMessage = useFlashMessage();

  return (
    <button
      className="action-button share"
      disabled={isCollabActive || INITIAL_SETTINGS.isCollab}
      onClick={() =>
        shareDoc(
          serializedDocumentFromEditorState(editor.getEditorState(), {
            source: 'Playground',
          }),
        ).then(
          () => showFlashMessage('URL copied to clipboard'),
          () => showFlashMessage('URL could not be copied to clipboard'),
        )
      }
      title="Share"
      aria-label="Share Playground link to current editor state">
      <i className="share" />
    </button>
  );
}

function ClearAction({
  isEditorEmpty,
  showModal,
}: {
  isEditorEmpty: boolean;
  showModal: ReturnType<typeof useModal>[1];
}) {
  const [editor] = useLexicalComposerContext();

  return (
    <button
      className="action-button clear"
      disabled={isEditorEmpty}
      onClick={() => {
        showModal(
          'Clear editor',
          (onClose) => (
            console.log('display that'),
            (<ShowClearDialog editor={editor} onClose={onClose} />)
          ),
        );
      }}
      title="Clear"
      aria-label="Clear editor contents">
      <i className="clear" />
    </button>
  );
}

function ReadonlyAction() {
  const [editor] = useLexicalComposerContext();
  const isEditable = editor.isEditable();

  return (
    <button
      className={`action-button ${!isEditable ? 'unlock' : 'lock'}`}
      onClick={() => {
        // Send latest editor state to commenting validation server
        if (isEditable) {
          // sendEditorState(editor);
        }
        editor.setEditable(!editor.isEditable());
      }}
      title="Read-Only Mode"
      aria-label={`${!isEditable ? 'Unlock' : 'Lock'} read-only mode`}>
      <i className={!isEditable ? 'lock' : 'unlock'} />
    </button>
  );
}
