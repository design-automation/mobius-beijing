import { Component, Injector, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { MOBIUS } from '../../global-services/mobius.constants';
//
// Component for Parameter Settings
//
@Component({
  selector: 'file-load-dialog',
  templateUrl: 'file-load-dialog.html',
})
export class FileLoadDialogComponent {

  message: string;

  constructor(public dialogRef: MatDialogRef<FileLoadDialogComponent>) {
  }

  onNoClick(): void {
    this.dialogRef.close('new');
  }

  closeDialog(action: string) {
    this.dialogRef.close(action);
  }

}