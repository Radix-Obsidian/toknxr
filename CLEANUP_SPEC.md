# TokNXR Local-First Cleanup Specification

## Target Architecture

- **Single Package**: CLI-only npm package
- **Zero Cloud**: No Supabase, Vercel, Firebase, or deployment dependencies
- **Local Storage**: File-based analytics only (`interactions.log`)
- **Instant Start**: `npm install -g @goldensheepai/toknxr-cli` → `toknxr start`

## Functional Requirements

- ✅ All existing CLI commands work identically
- ✅ Proxy server and AI tracking preserved
- ✅ Local analytics and visualization intact
- ✅ Code quality analysis functional
- ✅ Interactive UI components preserved
- ❌ No cloud sync capabilities
- ❌ No web dashboard
- ❌ No authentication flows

## File Structure Target

```
toknxr-cli/
├── package.json (CLI-focused)
├── src/ (CLI source only)
├── lib/ (compiled output)
├── README.md (CLI-first docs)
└── interactions.log (local data)
```

## Success Criteria

1. `toknxr --help` shows all commands
2. `toknxr start` launches proxy server
3. `toknxr stats` displays local analytics
4. `toknxr doctor` validates setup
5. No cloud dependencies in package.json
6. Startup time < 50ms
7. Self-contained installation
