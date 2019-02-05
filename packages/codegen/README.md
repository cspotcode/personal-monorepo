Simple CLI for code generation.  Generate source files from other source files.

Very early release; config is hardcoded.  So here's what it does:

Files matching `./src/**/*.generate.ts` will render into `./src/**/*.ts`
default export is invoked as a function, given a CodeGenApi instance.
Return a string or call emit() on the api to generate code.

