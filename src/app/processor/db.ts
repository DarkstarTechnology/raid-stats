import Dexie, { Table } from 'dexie';



export enum Race {
  PLANT = 'Plant',
  GNOME = 'Gnome',
  DRAGON = 'Dragon',
  DEMON = 'Demon',
  KOBOLD = 'Kobold',
  UNDEAD = 'Undead',
  NONE = 'None'
}

export interface IAlliance {
  id?: number;
  primary: string[];
  secondary: string[];
  tertiary: string[];
  isActive: boolean;
}

export interface IPlayer {
  
  name: string
  race: string
  
}
export interface IRaid {
    
    redditId: string;
    title: string;
    date: number;
    kill: Player;
    time: number;
    race: string;
    players: Player[];
}

export interface IPlayersInRaid {
    
    name: string;
    redditId: string;
    time: number;
    position: number;
    isSnipe: boolean;
}

export interface RaceCount {
  race: Race;
  count: number;
}



export class Raid implements IRaid {
    
    redditId: string;
    date: number;
    title: string;
    kill: Player;
    time: number;
    race: string;
    players: Player[];

    constructor(redditId: string, date: number, killer: Player, raceKill: string, raidTime: number, title?: string) {
        this.redditId = redditId;
        this.date = date;
        this.kill = killer;
        this.time = raidTime;
        this.race = raceKill;
        if (title) this.title = title;
        
        //this.players = [];
        Object.defineProperties(this, {
            players: {value: [], enumerable: true, writable: true }
        });
    }

    async addRaid() {
      await db.raids.put(this);
    }

    async addPlayer(player: Player, t: number, p: number, c: boolean) {
      
        await db.players.put(player);
        
       
      await db.playersInRaid.put({name: player.name, redditId: this.redditId, time: t, position: p, isSnipe: c});
      this.players.push(player);
    }

    async loadPlayers() {
        const playerLinks = await db.playersInRaid.where('redditId').equals(this.redditId).toArray();
        const players = await db.players.where('name').anyOf(playerLinks.map(l => l.name)).toArray();
        for (const player of players) {
         
          if (!(this.players.find(p => p.name === player.name))) {
          
            this.players.push(player);
          }
        }
        await this.save();
        return players;
    }

    async getAllRaceCounts() {
      const raceCounts: RaceCount[] = [];
      const links = await db.playersInRaid.where('redditId').equals(this.redditId).toArray();
      const players = await db.players.where('name').anyOf(links.map(l => l.name)).toArray();
      for(const r of [Race.DEMON, Race.DRAGON, Race.GNOME, Race.KOBOLD, Race.PLANT, Race.UNDEAD]) {
        const n = players.filter(player => player.race === r).length;
        raceCounts.push({race: r, count: n});
      }
      return raceCounts;
    }

    async getRaceCount(race:string) {
        return this.players.filter(player => player.race === race).length;
    }

    async save() {
        await db.raids.put(this);
        console.log(this);
    }
}

export class Player implements IPlayer {
    
    name: string;
    race: string;
    raids!: IRaid[];
    avg!: number;



    constructor(name: string, race: string, id?: number) {
        this.name = name;
        this.race = race;
        

        Object.defineProperties(this, {
            raids: {value: [], enumerable: false, writable: true }
        });
    }

    async getAvg() {
     const links = await db.playersInRaid.where('name').equals(this.name).toArray();
     const n = links.length;
     const total = links.reduce((t,l) => t + l.time, 0);
     this.avg = total / n;
     return total / n;
    }
    //async loadRaids() {
     //   const raidLinks = await db.playersInRaid.where('name').equals(this.id).toArray();
    //    return await Promise.all(raidLinks.map(link => db.raids.get(link.raidId)));
   // }
}


export class AppDB extends Dexie {
    players: Table<Player, number>;
    raids: Table<Raid, number>;
    public alliances: Table<IAlliance, number>;
    public playersInRaid!: Table<IPlayersInRaid, [number, number]>;

    constructor() {
        super('RaidDatabase');
        var db = this;
        db.version(3).stores({
            players: 'name, race',
            raids: 'redditId, date',
            playersInRaid: '[name+redditId], name, redditId',
            alliances: 'id++, isActive'
        });
       
        this.players = db.table('players');
        this.raids = db.table('raids');
        this.playersInRaid = db.table('playersInRaid');
        this.alliances = db.table('alliances');
        this.players.mapToClass(Player);
        this.raids.mapToClass(Raid);
    }
    
}

export const db = new AppDB();


async function putPlayer(player: Player) {
    return await db.players.put(player);
}