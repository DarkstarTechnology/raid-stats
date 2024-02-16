import { Injectable } from '@angular/core';
import { Player, db } from '../processor/db';
import { IPlayerStats } from '../interfaces/player-stats';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  constructor() {}

  async listPlayers() {
    return await db.players.toArray();
  }

  async getPlayerStats(player: Player): Promise<IPlayerStats> {
    const pir = await db.playersInRaid
      .filter((p) => p.isSnipe != true && p.name == player.name)
      .toArray();
      let accu = 0;
      let counter = 0;
      for (const x of pir) {
        accu += x.time;
        counter++;
        console.log('Time: ' + x.time);
      }
      const r = accu / counter;
      console.log('Simple ' + r);
      const rs = pir.reduce((acc, cur) => acc + cur.time, 0) / pir.length;
      console.log('Reduced ' + rs);
    return {
      player: player,
      totalRaids: pir.length,
      avgPosition: pir.reduce((acc, cur) => acc + cur.position, 0) / pir.length,
      avgTime: pir.reduce((acc, cur) => acc + cur.time, 0) / pir.length,
      raidParticipation: pir.length / (async () => await db.raids.toArray()).length,
    };
  }
}
