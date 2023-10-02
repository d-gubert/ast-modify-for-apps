import { fixAst, generateSource, parseAst } from "./mod.ts";

const originalSource = Deno.readTextFileSync("./simple_example.js");
// const originalSource = Deno.readTextFileSync("./GoogleDriveApp.js"),

console.time("parse");
const ast = parseAst(originalSource);
console.timeEnd("parse");

Deno.writeTextFileSync(
    "./output/original_ast.json",
    JSON.stringify(ast, undefined, 4),
);

console.time("fix");
const hasFixed = fixAst(ast);
console.timeEnd("fix");

if (hasFixed) {
    Deno.writeTextFileSync(
        "./output/modified_ast.json",
        JSON.stringify(ast, undefined, 4),
    );

    console.time("generate");
    const fixedSource = generateSource(ast);
    console.timeEnd("generate");

    Deno.writeTextFileSync("./output/astring_generated_source.js", fixedSource);
}
