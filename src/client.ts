import type { LastFmConfiguration } from "./types/config";
import type { LastFmEvents } from "./types/context";

import { EventEmitter } from "node:events";
import { LastFmContext } from "./internal/context";
import { AuthStructure } from "./structures/auth.structure";
import { TrackStructure } from "./structures/track.structure";
import { ArtistStructure } from "./structures/artist.structure";
import { AlbumStructure } from "./structures/album.structure";
import { UserStructure } from "./structures/user.structure";
import { ChartStructure } from "./structures/chart.structure";
import { GeoStructure } from "./structures/geo.structure";

export default class LastFm extends EventEmitter {
  public readonly auth: AuthStructure;
  public readonly track: TrackStructure;
  public readonly artist: ArtistStructure;
  public readonly album: AlbumStructure;
  public readonly user: UserStructure;
  public readonly chart: ChartStructure;
  public readonly geo: GeoStructure;

  private readonly c: LastFmContext;

  /**
   * Initializes the lastfm-client wrapper.
   * @param config The configuration object.
   */
  constructor(config: LastFmConfiguration) {
    super();

    this.c = new LastFmContext(config);

    this.auth = new AuthStructure(this.c);
    this.track = new TrackStructure(this.c);
    this.artist = new ArtistStructure(this.c);
    this.album = new AlbumStructure(this.c);
    this.user = new UserStructure(this.c);
    this.chart = new ChartStructure(this.c);
    this.geo = new GeoStructure(this.c);

    this.c.on("sessionExpire", (message, meta) => this.emit("sessionExpire", message, meta));
    this.c.on("requestFailed", (payload) => this.emit("requestFailed", payload));
    this.c.on("warn", (message) => this.emit("warn", message));
  }

  public override on<K extends keyof LastFmEvents>(event: K, listener: LastFmEvents[K]): this {
    return super.on(event, listener);
  }

  public override once<K extends keyof LastFmEvents>(event: K, listener: LastFmEvents[K]): this {
    return super.once(event, listener);
  }

  public override emit<K extends keyof LastFmEvents>(event: K, ...args: Parameters<LastFmEvents[K]>): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Clears all pending unresolved promises from the token bucket queue.
   */
  public clearRequestQueue() {
    return this.c.clearRequestQueue();
  }

  /**
   * Removes all event listeners and clears all pending unresolved promises from the token bucket queue.
   */
  public destroy() {
    this.c.removeAllListeners();
    this.removeAllListeners();
    this.clearRequestQueue();
  }
}
