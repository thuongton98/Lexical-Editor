/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './ExcalidrawModal.css';

import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/dist/types/excalidraw/types';
import {isDOMNode} from 'lexical';
import type {JSX} from 'react';
import * as React from 'react';
import {ReactPortal, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

const Excalidraw = React.lazy(async () => {
  const {Excalidraw} = await import('@excalidraw/excalidraw');

  return {default: Excalidraw};
});

import Button from './Button';
import Modal from './Modal';

export type ExcalidrawInitialElements = ExcalidrawInitialDataState['elements'];

export type ExcalidrawProps = {
  /**
   * The initial set of elements to draw into the scene
   */
  initialElements: ExcalidrawInitialElements;
  /**
   * The initial set of elements to draw into the scene
   */
  initialAppState: AppState;
  /**
   * The initial set of elements to draw into the scene
   */
  initialFiles: BinaryFiles;
  /**
   * Callback when closing and discarding the new changes
   */
  onClose: () => void;
  /**
   * Completely remove Excalidraw component
   */
  onDelete: () => void;
  /**
   * Callback when the save button is clicked
   */
  onSave: (
    elements: ExcalidrawInitialElements,
    appState: Partial<AppState>,
    files: BinaryFiles,
  ) => void;
  /**
   * Controls the visibility of the modal
   */
  isShown?: boolean;
};

type Props = {
  closeOnClickOutside?: boolean;
} & ExcalidrawProps;

export const useCallbackRefState = () => {
  const [refValue, setRefValue] =
    React.useState<ExcalidrawImperativeAPI | null>(null);
  const refCallback = React.useCallback(
    (value: ExcalidrawImperativeAPI | null) => setRefValue(value),
    [],
  );
  return [refValue, refCallback] as const;
};

/**
 * @explorer-desc
 * A component which renders a modal with Excalidraw (a painting app)
 * which can be used to export an editable image
 */
export default function ExcalidrawModal({
  closeOnClickOutside = false,
  isShown,
  ...props
}: Props): ReactPortal | null {
  const excaliDrawModelRef = useRef<HTMLDivElement | null>(null);
  const onDelete = props.onDelete;

  useEffect(() => {
    if (excaliDrawModelRef.current !== null) {
      excaliDrawModelRef.current.focus();
    }
  }, []);

  useLayoutEffect(() => {
    const currentModalRef = excaliDrawModelRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDelete();
      }
    };

    if (currentModalRef !== null) {
      currentModalRef.addEventListener('keydown', onKeyDown);
    }

    return () => {
      if (currentModalRef !== null) {
        currentModalRef.removeEventListener('keydown', onKeyDown);
      }
    };
  }, [onDelete]);

  const clickOutsideHandler = React.useCallback(
    (event: MouseEvent) => {
      const target = event.target;
      if (
        excaliDrawModelRef.current !== null &&
        isDOMNode(target) &&
        !excaliDrawModelRef.current.contains(target) &&
        closeOnClickOutside
      ) {
        onDelete();
      }
    },
    [onDelete],
  );

  const setEscapeHandler = React.useCallback(() => {
    let modalOverlayElement: HTMLElement | null = null;

    if (excaliDrawModelRef.current !== null) {
      modalOverlayElement = excaliDrawModelRef.current?.parentElement;
      if (modalOverlayElement !== null) {
        modalOverlayElement?.addEventListener('click', clickOutsideHandler);
      }
    }
  }, [clickOutsideHandler]);

  useEffect(() => {
    setEscapeHandler();

    return () => {
      let modalOverlayElement = excaliDrawModelRef.current?.parentElement;
      if (modalOverlayElement !== null) {
        modalOverlayElement?.removeEventListener('click', setEscapeHandler);
      }
    };
  }, [closeOnClickOutside, setEscapeHandler, onDelete]);

  const onChange = React.useCallback(
    () => setEscapeHandler(),
    [setEscapeHandler],
  );

  if (isShown === false) {
    return null;
  }

  return createPortal(
    <div className="ExcalidrawModal__overlay" role="dialog">
      <div
        className="ExcalidrawModal__modal"
        ref={excaliDrawModelRef}
        tabIndex={-1}>
        <ExcalidrawImpl {...props} onChange={onChange} />
      </div>
    </div>,
    document.body,
  );
}

type ExcalidrawSpecificProps = {
  /**
   * Callback when any change happen
   */
  onChange: () => void;
};

export function ExcalidrawImpl({
  onSave,
  initialElements,
  initialAppState,
  initialFiles,
  onDelete,
  onClose,
  onChange: _onChange,
}: ExcalidrawProps & ExcalidrawSpecificProps) {
  const [excalidrawAPI, excalidrawAPIRefCallback] = useCallbackRefState();
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [elements, setElements] =
    useState<ExcalidrawInitialElements>(initialElements);
  const [files, setFiles] = useState<BinaryFiles>(initialFiles);

  const save = () => {
    if (elements && elements.filter((el) => !el.isDeleted).length > 0) {
      const appState = excalidrawAPI?.getAppState();
      // We only need a subset of the state
      const partialState: Partial<AppState> = {
        exportBackground: appState?.exportBackground,
        exportScale: appState?.exportScale,
        exportWithDarkMode: appState?.theme === 'dark',
        isBindingEnabled: appState?.isBindingEnabled,
        isLoading: appState?.isLoading,
        name: appState?.name,
        theme: appState?.theme,
        viewBackgroundColor: appState?.viewBackgroundColor,
        viewModeEnabled: appState?.viewModeEnabled,
        zenModeEnabled: appState?.zenModeEnabled,
        zoom: appState?.zoom,
      };
      onSave(elements, partialState, files);
    } else {
      // delete node if the scene is clear
      onDelete();
    }
  };

  const discard = () => {
    setDiscardModalOpen(true);
  };

  function ShowDiscardDialog(): JSX.Element {
    return (
      <Modal
        title="Discard"
        onClose={() => {
          setDiscardModalOpen(false);
        }}
        closeOnClickOutside={false}>
        Are you sure you want to discard the changes?
        <div className="ExcalidrawModal__discardModal">
          <Button
            onClick={() => {
              setDiscardModalOpen(false);
              onClose();
            }}>
            Discard
          </Button>{' '}
          <Button
            onClick={() => {
              setDiscardModalOpen(false);
            }}>
            Cancel
          </Button>
        </div>
      </Modal>
    );
  }

  const onChange = (
    els: ExcalidrawInitialElements,
    _: AppState,
    fls: BinaryFiles,
  ) => {
    setElements(els);
    setFiles(fls);
    _onChange();
  };
  return (
    <div className="ExcalidrawModal__row">
      {discardModalOpen && <ShowDiscardDialog />}
      <React.Suspense fallback={<div>Loading...</div>}>
        <Excalidraw
          onChange={onChange}
          excalidrawAPI={excalidrawAPIRefCallback}
          initialData={{
            appState: initialAppState || {isLoading: false},
            elements: initialElements,
            files: initialFiles,
          }}
        />
      </React.Suspense>
      <div className="ExcalidrawModal__actions">
        <button className="action-button" onClick={discard}>
          Discard
        </button>
        <button className="action-button" onClick={save}>
          Save
        </button>
      </div>
    </div>
  );
}
