# QuickXorHash
Microsoft's QuickXorHash algorithm in pure Typescript & NodeJS.

# Use
```ts
// Create an instance of QuickXorHash
const hasher = new QuickXorHash();

// Convert the file content to a buffer (assuming it's UTF-8 encoded)
const buffer = Buffer.from(data, 'utf-8');
// Or
const buffer = readFileSync(pathToTheFile);

// Call update to hash the data
hasher.update(buffer, 0, buffer.length);

// Call digest to finalize the hash computation and convert it to string (use a BufferEncoding parameter as .toString() method)
const hash = hasher.digest('base64');

console.log('Hash result:', hash);
```

Details:
https://learn.microsoft.com/fr-fr/onedrive/developer/code-snippets/quickxorhash?view=odsp-graph-online

Used in Microsoft OneDrive business Graoh API for checking files content changes.

License
This project is licensed under the MIT License - see the LICENSE file for details
