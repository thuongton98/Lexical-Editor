/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {SettingName, Settings} from '../appSettings';
import type {JSX} from 'react';

import {merge} from 'lodash-es';
import * as React from 'react';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {DEFAULT_SETTINGS, INITIAL_SETTINGS} from '../appSettings';

type SettingsContextShape = {
  setOption: (name: SettingName, value: boolean) => void;
  settings: Record<SettingName, boolean>;
};

const Context: React.Context<SettingsContextShape> = createContext({
  setOption: (name: SettingName, value: boolean) => {
    return;
  },
  settings: INITIAL_SETTINGS,
});

export const SettingsContext = ({
  children,
  settingProps = INITIAL_SETTINGS,
}: {
  settingProps?: Partial<Settings>;
  children: ReactNode;
}): JSX.Element => {
  const [settings, setSettings] = useState(
    merge(INITIAL_SETTINGS, settingProps),
  );

  const setOption = useCallback((setting: SettingName, value: boolean) => {
    setSettings((options) => ({
      ...options,
      [setting]: value,
    }));
    setURLParam(setting, value);
  }, []);

  React.useEffect(() => {
    if (!settingProps) {
      return;
    }
    setSettings((ss) => merge(INITIAL_SETTINGS, ss, settingProps, ));
  }, [settingProps]);

  const contextValue = useMemo(() => {
    return {setOption, settings: settings};
  }, [setOption, settings]);

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export const useSettings = (): SettingsContextShape => {
  return useContext(Context);
};

function setURLParam(param: SettingName, value: null | boolean) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  if (value !== DEFAULT_SETTINGS[param]) {
    params.set(param, String(value));
  } else {
    params.delete(param);
  }
  url.search = params.toString();
  window.history.pushState(null, '', url.toString());
}
