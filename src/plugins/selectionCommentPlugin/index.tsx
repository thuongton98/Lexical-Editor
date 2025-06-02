import {createCommand, LexicalCommand} from 'lexical';

export const INSERT_INLINE_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_INLINE_COMMAND',
);

export function SelctionCommentPlugin() {}
