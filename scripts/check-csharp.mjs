// Compiles every C# snippet shown in the app, to make sure the display-only code is valid.
// Usage: node scripts/check-csharp.mjs   (needs the .NET SDK: `dotnet`)
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../src');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'dsa-cs-'));
const files = fs.readdirSync(root, { recursive: true }).filter((f) => f.endsWith('.cs'));
let regions = 0;

fs.writeFileSync(
  path.join(out, 'Check.csproj'),
  `<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Library</OutputType><TargetFramework>net${execSync('dotnet --version').toString().split('.')[0]}.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable><NoWarn>CS8321;CS0219;CS0169;CS0649;CS8632;CS0414</NoWarn></PropertyGroup></Project>`,
);
fs.writeFileSync(
  path.join(out, 'Common.cs'),
  `public class TreeNode { public int val; public TreeNode? left; public TreeNode? right; public TreeNode(int val) { this.val = val; } }
public class ListNode { public int val; public ListNode? next; public ListNode(int val) { this.val = val; } }`,
);
for (const file of files) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  const id = file.replace(/[^a-zA-Z0-9]/g, '_');
  let code = '';
  for (const m of src.matchAll(/^\/\/ #region (\S+)\n([\s\S]*?)^\/\/ #endregion/gm)) {
    regions++;
    const body = file.endsWith('ds.cs') ? `void Demo() {\n${m[2]}\n}` : m[2];
    code += `namespace N_${id}.R_${m[1].replace(/\W/g, '_')} {\n  class Holder {\n#line 1 "${file}#${m[1]}"\n${body}\n  }\n}\n`;
  }
  fs.writeFileSync(path.join(out, id + '.cs'), code);
}
console.log(`Compiling ${regions} C# snippets from ${files.length} files…`);
try {
  execSync('dotnet build -nologo -v q -clp:NoSummary', { cwd: out, stdio: 'pipe' });
  console.log('All C# snippets compile.');
} catch (e) {
  const lines = [...new Set(e.stdout.toString().split('\n').filter((l) => l.includes('error')).map((l) => l.replace(/ \[.*$/, '')))];
  console.log(lines.join('\n'));
  console.log(`\n${lines.length} error(s).`);
  process.exit(1);
}
