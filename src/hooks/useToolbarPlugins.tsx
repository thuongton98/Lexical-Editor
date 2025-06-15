import {LexicalCommand, LexicalEditor} from 'lexical';
import {merge} from 'lodash-es';
import {ReactNode} from 'react';
import ExcalidrawPlugin, {
  INSERT_EXCALIDRAW_COMMAND,
} from '../plugins/ExcalidrawPlugin';

export type PluginBuilder = (editor: LexicalEditor) => ReactNode;

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
  excalidraw: (_: LexicalCommand<void>) => (
    <ExcalidrawPlugin key="excalidraw" />
  ),
};

export function useToolbarPlugins(toolbarPlugins?: ToolbarPlugins) {
  const mergedToolbarPlugins = merge(INITIAL_TOOLBAR_PLUGINS, toolbarPlugins);

  return Object.keys(mergedToolbarPlugins).map((pluginName) => {
    const key = pluginName as keyof ToolbarPlugins;
    const pluginBuilder = mergedToolbarPlugins[key];
    return pluginBuilder(COMMAND_ASSOCIATED_TO_TOOLBAR_PLUGIN[key], key);
  });
}
