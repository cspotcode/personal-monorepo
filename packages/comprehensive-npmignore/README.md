Tool that forces all files to be either explicitly included or excluded for npm publication.

# Why?

Using an .npmignore file is more convenient than the "files" array, but it means you may accidentally publish
sensitive data to npm.  Using a "files" array is safer but means you may accidentally forget to add items,
meaning you publish a broken package.

This tool enables a third option: it forces you to specify all files as either included or excluded.  Any
ambiguous files are shown so you can explicitly specify them.

# Usage

Ignored files can either be specified in an ".npmignore" file or in an `"npmignore": []` array in your "package.json"
The latter option allows everything to be specified in the same place and avoids an extra file.

## CLI

Invoke as an executable:

```
comprehensive-npmignore
```

## JavaScript

Call the `validate` function, optionally passing the path of your project root.  Throws an error on failure, so you can
easily add this to your test suite.

```
import {validate as validateNpmIgnore} from 'comprehensive-npmignore';
desribe('project trivia', () => {
    it('avoid npmignore mistakes', () => {
        validateNpmIgnore();
    });
});
```
