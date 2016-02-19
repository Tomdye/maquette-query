// Compiled using typings@0.6.8
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/ceedbb35506c4b20867ddb495e8626ea04f38969/sinon-chai/sinon-chai.d.ts
// Type definitions for sinon-chai 2.7.0
// Project: https://github.com/domenic/sinon-chai
// Definitions by: Kazi Manzur Rashid <https://github.com/kazimanzurrashid/>, Jed Mao <https://github.com/jedmao/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module Chai {

  interface LanguageChains {
    always: Assertion;
  }

  interface Assertion {
    /**
     * true if the spy was called at least once.
     */
    called: Assertion;
    /**
     * @param count The number of recorded calls.
     */
    callCount(count: number): Assertion;
    /**
     * true if the spy was called exactly once.
     */
    calledOnce: Assertion;
    /**
     * true if the spy was called exactly twice.
     */
    calledTwice: Assertion;
    /**
     * true if the spy was called exactly thrice.
     */
    calledThrice: Assertion;
    /**
     * Returns true if the spy was called before anotherSpy.
     */
    calledBefore(anotherSpy: Sinon.SinonSpy): Assertion;
    /**
     * Returns true if the spy was called after anotherSpy.
     */
    calledAfter(anotherSpy: Sinon.SinonSpy): Assertion;
    /**
     * Returns true if spy/stub was called with the new operator. Beware that
     * this is inferred based on the value of the this object and the spy
     * function's prototype, so it may give false positives if you actively
     * return the right kind of object.
     */
    calledWithNew: Assertion;
    /**
     * Returns true if context was this for this call.
     */
    calledOn(context: any): Assertion;
    /**
     * Returns true if call received provided arguments (and possibly others).
     */
    calledWith(...args: any[]): Assertion;
    /**
     * Returns true if call received provided arguments and no others.
     */
    calledWithExactly(...args: any[]): Assertion;
    /**
     * Returns true if call received matching arguments (and possibly others).
     * This behaves the same as spyCall.calledWith(sinon.match(arg1), sinon.match(arg2), ...).
     */
    calledWithMatch(...args: any[]): Assertion;
    /**
     * Returns true if spy returned the provided value at least once. Uses
     * deep comparison for objects and arrays. Use spy.returned(sinon.match.same(obj))
     * for strict comparison (see matchers).
     */
    returned(obj: any): Assertion;
    /**
     * Returns true if spy threw the provided exception object at least once.
     */
    thrown(obj?: Error | typeof Error | string): Assertion;
  }
}

declare module "sinon-chai" {
  function sinonChai(chai: any, utils: any): void;
  namespace sinonChai { }
  export = sinonChai;
}