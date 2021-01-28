import { instance } from "ts-mockito";

/**
 * This is necessary due to https://github.com/NagRock/ts-mockito/issues/191
 *
 * Luckily, a kind soul provided this as a work around, and it will do for now.
 */

export const resolvableInstance = <T extends {}>(mock: T) => new Proxy<T>(instance(mock), {
  get(target, name: PropertyKey) {
    if (["Symbol(Symbol.toPrimitive)", "then", "catch"].includes(name.toString())) {
      return undefined;
    }

    return (target as any)[name];
  },
});
