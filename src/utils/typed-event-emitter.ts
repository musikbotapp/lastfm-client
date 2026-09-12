import { EventEmitter } from "node:events";

// eslint-disable-next-line unicorn/prefer-event-target
export abstract class TypedEventEmitter<Events extends Record<string, unknown[]>> extends EventEmitter {
  public override emit<Event extends Extract<keyof Events, string> | symbol>(
    eventName: Event,
    ...arguments_: Events[Extract<Event, string>]
  ): boolean {
    return super.emit(eventName, ...arguments_);
  }

  public override on<Event extends Extract<keyof Events, string> | symbol>(
    eventName: Event,
    listener: (...arguments_: Events[Extract<Event, string>]) => void,
  ): this {
    return super.on(eventName, listener);
  }

  public override once<Event extends Extract<keyof Events, string> | symbol>(
    eventName: Event,
    listener: (...arguments_: Events[Extract<Event, string>]) => void,
  ): this {
    return super.once(eventName, listener);
  }

  public override off<Event extends Extract<keyof Events, string> | symbol>(
    eventName: Event,
    listener: (...arguments_: Events[Extract<Event, string>]) => void,
  ): this {
    return super.off(eventName, listener);
  }
}
