# ast-modify-for-apps

In the effort of changing the runtime used in the [Apps-Engine](https://github.com/RocketChat/Rocket.Chat.Apps-engine), we were faced with breaking changes on some methods provided by the APIs. Those methods have been deprecated for quite some time now, but the eventual app might still make use of them. The braking change we're looking to solve here is for methods that were erroneously signed as synchronous, but their underlying implementation MUST be asynchronous. We've been able to work around this issue so far with techniques in the Rocket.Chat side, but as we break away from the server's main process, any communication with the outside world is inherently asynchronous - we can't hide anymore.

Here I try to find a way to manipulate the app's AST in worder to wrap the rogue methods in `await` calls so they will still work as expected.

The solution here is a valid poc - it achieves its goal but needs refactoring.

## Instructions

This is a deno project, the entry point is `main.ts`, so you should run `deno run main.ts` to execute the project.

Currently, `main.ts` reads the `simple_test.js` file, uses `acorn` to parse it into an AST, uses `acorn-walk` to traverse it and modify it in place, and finally uses `astring` to print modified AST to a new source file.

The program outputs three files in the `./output` folder:
- `original_ast.json` - the AST initially parsed by `acorn`
- `modified_ast.json` - the AST after being modified
- `astring_generated_source.js` - the new source with applied modifications

`main_bench.ts` and `main_tests.ts` are the deafult files generated by `deno init`.
