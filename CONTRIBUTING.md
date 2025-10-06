# Contributing to TokNxr

Thank you for your interest in contributing to TokNxr! We welcome contributions from the community and are excited to see what you'll bring to the project.

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Git
- Firebase CLI (for web dashboard development)

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/yourusername/toknxr.git
   cd toknxr
   ```

2. **Install dependencies**
   ```bash
   # Install web app dependencies
   npm install
   
   # Install CLI dependencies
   npm install --prefix toknxr-cli
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env.local
   
   # Edit .env.local with your Firebase credentials
   # (See README.md for detailed setup instructions)
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Start web app
   npm run dev
   
   # Terminal 2: Start Firebase emulators
   npm run emulators
   
   # Terminal 3: Start CLI proxy
   npm run start --prefix toknxr-cli
   ```

## 🎯 Ways to Contribute

### 🐛 Bug Reports

Found a bug? Please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node.js version, etc.)
- Screenshots or logs if applicable

### ✨ Feature Requests

Have an idea for a new feature? Open an issue with:
- Clear description of the feature
- Use case and motivation
- Proposed implementation approach (if you have ideas)
- Any relevant examples or mockups

### 🔧 Code Contributions

#### Areas We Need Help With

1. **New AI Providers**
   - Add support for additional AI services
   - Improve existing provider integrations
   - File: `toknxr-cli/src/proxy.ts`

2. **Language Support**
   - Extend code analysis to more programming languages
   - Improve existing language analyzers
   - File: `toknxr-cli/src/code-analysis.ts`

3. **Dashboard Features**
   - Enhance the web interface
   - Add new analytics visualizations
   - Improve user experience
   - Directory: `src/app/`, `src/components/`

4. **Documentation**
   - Improve guides and examples
   - Add tutorials and how-tos
   - Fix typos and clarify instructions

5. **Testing**
   - Add unit tests
   - Add integration tests
   - Improve test coverage

#### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   # Run linting
   npm run lint
   
   # Test CLI functionality
   npm run start --prefix toknxr-cli
   
   # Test web app
   npm run dev
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add support for new AI provider"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub.

## 📝 Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing naming conventions:
  - `camelCase` for variables and functions
  - `PascalCase` for components and classes
  - `kebab-case` for file names
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### React Components

- Use functional components with hooks
- Follow the existing component structure
- Use Tailwind CSS for styling
- Keep components focused and reusable

### CLI Code

- Use Commander.js patterns for new commands
- Add proper error handling
- Include helpful user messages
- Follow the existing logging patterns

## 🧪 Testing

### Running Tests

```bash
# Run all tests (when available)
npm test

# Run CLI tests
npm run test --prefix toknxr-cli

# Manual testing
npm run start --prefix toknxr-cli
```

### Writing Tests

- Add unit tests for new functions
- Add integration tests for new features
- Test error conditions and edge cases
- Use descriptive test names

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Include examples in documentation
- Document complex algorithms or business logic

### User Documentation

- Update README.md for new features
- Add examples and use cases
- Keep installation instructions current

## 🔍 Code Review Process

All contributions go through code review:

1. **Automated Checks**
   - Linting and formatting
   - Type checking
   - Basic functionality tests

2. **Manual Review**
   - Code quality and style
   - Architecture and design
   - Documentation completeness
   - Test coverage

3. **Feedback and Iteration**
   - Address reviewer comments
   - Make requested changes
   - Re-request review when ready

## 🎉 Recognition

Contributors will be:
- Added to the contributors list
- Mentioned in release notes for significant contributions
- Invited to join the core team for sustained contributions

## 📞 Getting Help

Need help with your contribution?

- **GitHub Discussions**: Ask questions and get help from the community
- **Issues**: Create an issue with the "question" label
- **Discord**: Join our community Discord (link in README)

## 📋 Commit Message Guidelines

We follow conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add support for Claude AI provider
fix: resolve token counting issue with Ollama
docs: update installation instructions
```

## 🚫 What We Don't Accept

- Breaking changes without discussion
- Code without tests (for new features)
- Contributions that don't follow our code style
- Features that significantly increase bundle size without justification
- Changes that compromise security or privacy

## 📄 License

By contributing to TokNxr, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to TokNxr! 🎉