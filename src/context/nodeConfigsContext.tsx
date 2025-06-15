import {createContext, JSX, useContext} from 'react';
import {ExcalidrawProps} from '../ui/ExcalidrawModal';

export type NodeConfigsContextType = {
  ExcalidrawEditorDisplayer?: (props: ExcalidrawProps) => JSX.Element;
};

const context = createContext<NodeConfigsContextType | undefined>(undefined);

export const NodeConfigsContextProvider = context.Provider;

export function useNodeConfigsContext() {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error(
      'useNodeConfigsContext must be used within a NodeConfigsContextProvider',
    );
  }
  return contextValue;
}
