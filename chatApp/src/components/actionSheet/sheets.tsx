import { registerSheet, SheetDefinition } from 'react-native-actions-sheet';
import { CommentSheet, LogoutSheet } from './AppSheets';
registerSheet('LogoutSheet', LogoutSheet);
registerSheet('CommentSheet', CommentSheet);

declare module 'react-native-actions-sheet' {
  interface Sheets {
    LogoutSheet: SheetDefinition;
    CommentSheet: SheetDefinition;
  }
}

export {};
