import * as Mocha from 'mocha'

declare module 'mocha' {
  type OverridedFunc = (this: any, done: Mocha.Done) => void
  type OverridedAsyncFunc = (this: any, done: Mocha.Done) => PromiseLike<any>

  interface TestFunction {
    (title: string, fn?: OverridedFunc): Mocha.Test
    (title: string, fn?: OverridedFuncAsyncFunc): Mocha.Test
  }

  interface HookFunction {
    (fn: OverridedFunc): Mocha.Test
    (fn: OverridedAsyncFunc): Mocha.Test
  }

  declare var it: TestFunction
  declare var beforeEach: HookFunction
}
