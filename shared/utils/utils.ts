export const isDefined = <A>(a: A | undefined): a is A => a !== undefined;

export const isNotNull = <A>(a: A | null): a is A => a !== null;

export const isDefinedAndNotNull = <A>(a: A | null | undefined): a is A =>
  a !== null && a !== undefined;

export const isNotEmpty = <A>(a: any): a is A => Object.keys(a).length !== 0;
