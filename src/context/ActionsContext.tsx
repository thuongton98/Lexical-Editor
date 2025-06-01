/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { merge } from "lodash-es";
import type { JSX } from "react";

import * as React from "react";
import { createContext, ReactNode, useContext, useState } from "react";

export type ActionsBtnDisplayState = {
  markDownAction?: boolean;
  readonlyAction?: boolean;
  clearAction?: boolean;
  shareAction?: boolean;
  exportAction?: boolean;
  importAction?: boolean;
  speechAction?: boolean;
};

const INITIAL_STATE: ActionsBtnDisplayState = {
  clearAction: true,
  exportAction: true,
  importAction: true,
  markDownAction: true,
  readonlyAction: true,
  shareAction: true,
  speechAction: true,
};

const Context: React.Context<ActionsBtnDisplayState> =
  createContext(INITIAL_STATE);

export const ActionsDisplayStateContext = ({
  children,
  settingProps = INITIAL_STATE,
}: {
  settingProps?: ActionsBtnDisplayState;
  children: ReactNode;
}): JSX.Element => {
  const [settings] = useState(merge(INITIAL_STATE, settingProps));

  return <Context.Provider value={settings}>{children}</Context.Provider>;
};

export const useActionsState = (): ActionsBtnDisplayState => {
  return useContext(Context);
};
