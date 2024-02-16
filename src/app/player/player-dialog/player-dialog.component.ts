import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IPlayerStats } from 'src/app/interfaces/player-stats';

@Component({
  selector: 'app-player-dialog',
  templateUrl: './player-dialog.component.html',
  styleUrls: ['./player-dialog.component.scss']
})
export class PlayerDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public stats: IPlayerStats){}
}
