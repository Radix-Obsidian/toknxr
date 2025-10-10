# TokNXR Cleanup Implementation Plan

## Task Groups

### 🗂️ Task Group 1: File System Cleanup

- [ ] Remove web application directories
- [ ] Remove cloud infrastructure
- [ ] Remove deployment configs
- [ ] Clean build artifacts

### 📦 Task Group 2: Package Configuration

- [ ] Update root package.json (CLI-focused)
- [ ] Clean dependencies (remove cloud/web)
- [ ] Update scripts (CLI-only)
- [ ] Configure CLI as main package

### 🔧 Task Group 3: CLI Source Cleanup

- [ ] Remove Supabase imports from CLI
- [ ] Remove cloud sync functionality
- [ ] Remove web authentication
- [ ] Preserve all local features

### 📚 Task Group 4: Documentation Update

- [ ] Update README (local-first)
- [ ] Update installation instructions
- [ ] Remove cloud setup docs
- [ ] Add CLI-first examples

### ✅ Task Group 5: Validation

- [ ] Test all CLI commands
- [ ] Verify startup performance
- [ ] Validate self-contained install
- [ ] Confirm zero cloud dependencies

## Execution Order

1. Backup current state
2. Remove files (Group 1)
3. Update configs (Group 2)
4. Clean CLI source (Group 3)
5. Update docs (Group 4)
6. Validate (Group 5)
