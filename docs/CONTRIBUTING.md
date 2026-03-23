# Contributing to MY HUB

Thank you for your interest in contributing to MY HUB! This document provides guidelines and instructions for contributing.

## 🎯 Ways to Contribute

- 🐛 Report bugs
- ✨ Suggest new features
- 📝 Improve documentation
- 🔧 Submit bug fixes
- 💡 Add new features
- 🎨 Improve UI/UX

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/gitEpildev/myhub.git
cd MyLink
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/gitEpildev/myhub.git
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 📝 Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **Formatting**: Code is auto-formatted with Prettier
- **Naming**: Use camelCase for variables, PascalCase for components
- **Comments**: Add JSDoc comments for complex functions

### Component Structure

```typescript
import { useState } from 'react';
import { motion } from 'framer-motion';

interface YourComponentProps {
  title: string;
  isActive?: boolean;
}

/**
 * Brief description of what this component does
 */
export default function YourComponent({ title, isActive = false }: YourComponentProps) {
  const [state, setState] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6">
      <h3 className="font-mono text-lg">{title}</h3>
    </motion.div>
  );
}
```

### File Organization

```
src/
├── components/          # Reusable UI components
│   └── YourComponent.tsx
├── sections/           # Page sections/routes
│   └── YourSection.tsx
├── utils/             # Utility functions and hooks
│   ├── api.ts        # API calls
│   └── hooks.ts      # Custom React hooks
└── types/            # TypeScript type definitions
    └── index.ts
```

### Styling Guidelines

- Use **Tailwind CSS** utility classes
- Follow the existing glassmorphism design pattern
- Use the quantum color scheme (defined in `tailwind.config.js`)
- Ensure responsive design (mobile-first approach)

Example:

```tsx
<div className="glass glass-hover rounded-2xl p-6 lg:p-8">
  <h2 className="text-2xl lg:text-4xl font-mono glow-text">Your Title</h2>
</div>
```

### Animation Guidelines

- Use **Framer Motion** for animations
- Keep animations subtle and performant
- Follow existing animation patterns

Example:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

## 🧪 Testing

### Manual Testing

Before submitting:

1. **Test all features**

   - Navigation works
   - API integrations work
   - Animations are smooth
   - Responsive on mobile

2. **Check console**

   - No errors in browser console
   - No errors in terminal

3. **Test in multiple browsers**
   - Chrome
   - Firefox
   - Safari
   - Edge

### Code Quality

```bash
# Type checking
npm run type-check

# Linting (if configured)
npm run lint
```

## 📦 Commit Guidelines

### Commit Message Format

Use conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(home): add system uptime counter
fix(api): resolve lanyard connection issue
docs(readme): update installation instructions
style(components): format with prettier
refactor(hooks): simplify usePolling implementation
perf(particles): optimise particle rendering
```

### Good Commit Practices

- Write clear, descriptive messages
- Keep commits focused and atomic
- Reference issues in commit messages (`fixes #123`)

## 🔄 Pull Request Process

### 1. Update Your Fork

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Rebase Your Branch

```bash
git checkout your-feature-branch
git rebase main
```

### 3. Push to Your Fork

```bash
git push origin your-feature-branch
```

### 4. Create Pull Request

1. Go to the original repository
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill in the PR template

### Pull Request Template

```markdown
## Description

Brief description of what this PR does

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made

- List of changes
- With bullet points

## Testing

How was this tested?

## Screenshots (if applicable)

Add screenshots here

## Checklist

- [ ] Code follows project style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console errors
- [ ] Tested on multiple browsers
- [ ] Responsive on mobile
```

## 🐛 Bug Reports

### Before Submitting

1. Check existing issues
2. Try latest version
3. Reproduce the bug consistently

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**

- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome 120]
- Node version: [e.g. 20.10.0]
- npm version: [e.g. 10.2.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you thought about

**Additional context**
Mockups, examples, or references
```

## 📚 Documentation

### Documentation Changes

- Keep README.md up to date
- Update relevant docs in `/docs` folder
- Add JSDoc comments to functions
- Include code examples

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Keep table of contents updated

## ✅ Code Review

### What We Look For

- **Functionality**: Does it work as intended?
- **Code Quality**: Is it clean and maintainable?
- **Performance**: Is it optimised?
- **Style**: Does it follow guidelines?
- **Documentation**: Is it well documented?
- **Testing**: Has it been tested?

### Review Process

1. Maintainer reviews your PR
2. Feedback is provided (if needed)
3. You make requested changes
4. PR is approved and merged

## 🌟 Best Practices

### Do's ✅

- Write clean, readable code
- Follow existing patterns
- Add comments for complex logic
- Test thoroughly
- Keep PRs focused and small
- Update documentation
- Be responsive to feedback

### Don'ts ❌

- Don't include unrelated changes
- Don't commit `.env` files
- Don't break existing functionality
- Don't ignore code style guidelines
- Don't submit untested code
- Don't include large binary files

## 🎨 Design System

### Colors

```typescript
// Primary accent
quantum-glow: #00d9ff

// Dark backgrounds
dark-900: #0a0a0f
dark-800: #10101a
dark-700: #1a1a2e
```

### Typography

```typescript
// Headings - JetBrains Mono
font - mono;

// Body - Inter
font - sans;
```

### Spacing

Follow Tailwind's spacing scale:

- Small: `p-2`, `p-4`
- Medium: `p-6`, `p-8`
- Large: `p-12`, `p-16`

### Components

Reuse existing components:

- `glass` - Glassmorphism background
- `glass-hover` - Hover effect
- `glow-text` - Glowing text
- `glow-box` - Glowing border

## 🔒 Security

### Security Guidelines

- Never commit API keys or secrets
- Validate all user inputs
- Sanitize data before displaying
- Use HTTPS in production
- Follow OWASP guidelines

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead:

1. Email the maintainer directly
2. Include detailed description
3. Wait for response before disclosure

## 📞 Getting Help

### Resources

- [README.md](README.md) - Project overview
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [docs/SETUP.md](docs/SETUP.md) - Detailed setup
- [docs/API.md](docs/API.md) - API documentation

### Community

- Discord: [@epildev](https://discord.com/users/850726663289700373)
- GitHub Issues: For bugs and features
- GitHub Discussions: For questions and ideas

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be:

- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Appreciated forever! ❤️

---

**Thank you for contributing to MY HUB!** 🚀

Your contributions help make this project better for everyone.
