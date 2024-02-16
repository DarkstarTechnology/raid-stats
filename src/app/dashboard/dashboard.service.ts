import { Injectable } from '@angular/core';
import { Raid, db } from '../processor/db';
import { groupBy, map, mergeMap, of, reduce, toArray } from 'rxjs';
import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  raidsByDay: any;
  constructor() { }
  
  async getDailyStats() {
    const raids = await db.raids.toArray();

    of(...raids).pipe(
      groupBy((r: Raid) => moment.utc(r.date).date()),
      mergeMap(group$ => group$.pipe(reduce((acc, cur) => [...acc, cur], [`${group$.key}`]))
      ),
      map(arr => ({ date: arr[0], raids: arr.slice(1)})),
      toArray()
    ).subscribe(p => console.log(p));
  }
}
