import { REST } from "@structures/rest";
import { AuthStructure } from "@structures/auth.structure";
import { TrackStructure } from "@structures/track.structure";
import { ArtistStructure } from "@structures/artist.structure";
import { AlbumStructure } from "@structures/album.structure";
import { UserStructure } from "@structures/user.structure";
import { ChartStructure } from "@structures/chart.structure";
import { GeoStructure } from "@structures/geo.structure";
import { TypedEventEmitter } from "@utils/typed-event-emitter";
import { resolveClientConfig } from "@utils/config";

import type { LastFmClientEvents, ClientConfig, ResolvedClientConfig } from "@local-types/client";

export class LastFmClient extends TypedEventEmitter<LastFmClientEvents> {
  public readonly config: Readonly<ResolvedClientConfig>;
  public readonly rest: REST;
  public readonly auth: AuthStructure;
  public readonly track: TrackStructure;
  public readonly artist: ArtistStructure;
  public readonly album: AlbumStructure;
  public readonly user: UserStructure;
  public readonly chart: ChartStructure;
  public readonly geo: GeoStructure;

  /**
   * Initializes the lastfm-client wrapper.
   *
   * @param config - The configuration object.
   */
  public constructor(config: ClientConfig = {}) {
    super();

    this.config = Object.freeze(resolveClientConfig(config));
    this.rest = new REST(this);
    this.auth = new AuthStructure(this);
    this.track = new TrackStructure(this);
    this.artist = new ArtistStructure(this);
    this.album = new AlbumStructure(this);
    this.user = new UserStructure(this);
    this.chart = new ChartStructure(this);
    this.geo = new GeoStructure(this);
  }

  /**
   * Removes all event listeners and clears all pending unresolved promises from the token bucket queue.
   */
  public destroy(): void {
    this.removeAllListeners();
    this.rest.clearRequestQueue();
  }
}
