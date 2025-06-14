/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {JSX} from 'react';

import '@excalidraw/excalidraw/index.css';

import {createCommand, LexicalCommand} from 'lexical';
import {useCallback, useState} from 'react';

import {AppState} from '@excalidraw/excalidraw/dist/types/excalidraw/types';

import {useExcalidraw} from '../../hooks/useExaclidraw';
import ExcalidrawModal, {ExcalidrawProps} from '../../ui/ExcalidrawModal';

export const INSERT_EXCALIDRAW_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_EXCALIDRAW_COMMAND',
);

export default function ExcalidrawPlugin(): JSX.Element | null {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const {onSave} = useExcalidraw({
    handleOnExcaliDrawRequest() {
      setModalOpen(true);
    },
  });

  const onDelete = () => {
    setModalOpen(false);
  };
  const onClose = () => {
    setModalOpen(false);
  };

  const saveCallback: ExcalidrawProps['onSave'] = useCallback(
    (elements, appState, files) => {
      onSave(elements, appState, files);
      setModalOpen(false);
    },
    [onSave],
  );

  return isModalOpen ? (
    <ExcalidrawModal
      initialElements={[]}
      initialAppState={{} as AppState}
      initialFiles={{}}
      isShown={isModalOpen}
      onDelete={onDelete}
      onClose={onClose}
      onSave={saveCallback}
      closeOnClickOutside={false}
    />
  ) : null;
}
