import { registerSheet, SheetDefinition } from 'react-native-actions-sheet';
import {
  CommentSheet,
  DeletePostSheet,
  LogoutSheet,
  TagFollowingSheet,
} from './AppSheets';
registerSheet('LogoutSheet', LogoutSheet);
registerSheet('CommentSheet', CommentSheet);
registerSheet('DeletePostSheet', DeletePostSheet);
registerSheet('TagFollowingSheet', TagFollowingSheet);

declare module 'react-native-actions-sheet' {
  interface Sheets {
    LogoutSheet: SheetDefinition;
    CommentSheet: SheetDefinition;
    DeletePostSheet: SheetDefinition;
    TagFollowingSheet: SheetDefinition;
  }
}

export {};
