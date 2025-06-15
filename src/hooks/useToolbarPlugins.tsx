import {LexicalCommand} from 'lexical';
import {merge} from 'lodash-es';
import {ReactNode} from 'react';
import ExcalidrawPlugin from '../plugins/ExcalidrawPlugin';
import {INSERT_EXCALIDRAW_COMMAND} from './useExcalidraw';

export type ToolbarPluginBuilder = (
  associatedCommand: LexicalCommand<void>,
  key: string,
) => ReactNode;

export type ToolbarPlugins = {
  excalidraw: ToolbarPluginBuilder;
};
const COMMAND_ASSOCIATED_TO_TOOLBAR_PLUGIN: {
  [key in keyof ToolbarPlugins]: LexicalCommand<void>;
} = {
  excalidraw: INSERT_EXCALIDRAW_COMMAND,
};

const INITIAL_TOOLBAR_PLUGINS: ToolbarPlugins = {
  excalidraw: (_: LexicalCommand<void>, key) => <ExcalidrawPlugin key={key} />,
};

export function useToolbarPlugins(toolbarPlugins?: Partial<ToolbarPlugins>) {
  const mergedToolbarPlugins = merge(INITIAL_TOOLBAR_PLUGINS, toolbarPlugins);

  return Object.keys(mergedToolbarPlugins).map((pluginName) => {
    const key = pluginName as keyof ToolbarPlugins;
    const pluginBuilder = mergedToolbarPlugins[key];
    return pluginBuilder(COMMAND_ASSOCIATED_TO_TOOLBAR_PLUGIN[key], key);
  });
}
