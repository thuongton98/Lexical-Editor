import Playground from './App';
import './index.css';
export * from './App';
export type {PluginBuilder} from './Editor';
export {useExcalidraw} from './hooks/useExcalidraw';
export {ExcalidrawImpl as ExcalidrawEditor} from './ui/ExcalidrawModal';
export * from './utils/provideLPEditorConfig';

export const Editor = Playground;
