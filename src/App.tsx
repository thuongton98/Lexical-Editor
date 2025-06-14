/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  InitialEditorStateType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import {EditorThemeClasses} from 'lexical';
import {type JSX} from 'react';

import {Settings as SettingType} from './appSettings';
import {
  ActionsBtnDisplayState,
  ActionsDisplayStateContext,
} from './context/ActionsContext';
import {FlashMessageContext} from './context/FlashMessageContext';
import {SettingsContext, useSettings} from './context/SettingsContext';
import {SharedHistoryContext} from './context/SharedHistoryContext';
import {ToolbarContext} from './context/ToolbarContext';
import Editor, {
  EditorProps,
  OnEditorStateChangeCallback,
  PluginBuilder,
} from './Editor';
import {TableContext} from './plugins/TablePlugin';
import {provideLPEditorConfig} from './utils/provideLPEditorConfig';

console.warn(
  'If you are profiling the playground app, please ensure you turn off the debug view. You can disable it by pressing on the settings control in the bottom-left of your screen and toggling the debug view setting.',
);

type AppProps = {
  onChange?: OnEditorStateChangeCallback;
  initialState?: InitialEditorStateType;
  theme?: EditorThemeClasses;
  hideToolbar?: boolean;
  readOnly?: boolean;
  pluginBuilder?: PluginBuilder;
  domMutation?: boolean;
} & EditorProps;

export function App(props: AppProps): JSX.Element {
  const {
    settings: {isCollab, emptyEditor, measureTypingPerf},
  } = useSettings();

  const initialConfig = provideLPEditorConfig({
    initialState: props.initialState,
    emptyEditor: emptyEditor,
    isCollab: isCollab,
    theme: props.theme,
  });

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <ToolbarContext>
            <div className="editor-shell">
              <Editor
                toolbarPlugins={props.toolbarPlugins}
                domMutation={props.domMutation}
                readOnly={props.readOnly}
                hideToolbar={props.hideToolbar}
                onChange={props.onChange}
                pluginBuilder={props.pluginBuilder}
              />
            </div>
            {/* {isDevPlayground && <Settings />}
            {isDevPlayground ? <DocsPlugin /> : null}
            {isDevPlayground ? <PasteLogPlugin /> : null}
            {isDevPlayground ? <TestRecorderPlugin /> : null}

            {measureTypingPerf ? <TypingPerfPlugin /> : null} */}
          </ToolbarContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}

export type PlayGroundAppProps = Partial<SettingType> & {
  actionsDisplayState?: ActionsBtnDisplayState;
} & AppProps;

export default function PlaygroundApp(props: PlayGroundAppProps): JSX.Element {
  const {
    onChange,
    pluginBuilder,
    initialState,
    theme,
    domMutation,
    actionsDisplayState,
    toolbarPlugins,
    ...settings
  } = props;

  const hideToolbar = 'hideToolbar' in props && props.hideToolbar !== false;
  const readOnly = 'readOnly' in props && props.readOnly !== false;

  return (
    <SettingsContext settingProps={settings}>
      <FlashMessageContext>
        <ActionsDisplayStateContext settingProps={actionsDisplayState}>
          <App
            toolbarPlugins={toolbarPlugins}
            domMutation={domMutation}
            readOnly={readOnly}
            hideToolbar={hideToolbar}
            initialState={initialState}
            theme={theme}
            onChange={onChange}
            pluginBuilder={pluginBuilder}
          />
        </ActionsDisplayStateContext>
      </FlashMessageContext>
    </SettingsContext>
  );
}
