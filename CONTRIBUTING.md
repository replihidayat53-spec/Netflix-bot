# Contributing to Netflix Bot System

Terima kasih atas minat Anda untuk berkontribusi! 🎉

## 📋 Code of Conduct

Proyek ini mengikuti [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

## 🚀 How to Contribute

### 1. Fork Repository

```bash
# Fork via GitHub UI, kemudian clone
git clone https://github.com/your-username/netflix-bot.git
cd netflix-bot
```

### 2. Create Branch

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Or bug fix branch
git checkout -b fix/bug-description
```

### 3. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments untuk logic yang complex
- Update documentation jika diperlukan

### 4. Test Changes

```bash
# Test dashboard
cd dashboard && npm run dev

# Test bots
cd bot/telegram && npm run dev
cd bot/whatsapp && npm run dev

# Test functions
cd functions && npm run serve
```

### 5. Commit Changes

```bash
# Use conventional commits
git commit -m "feat: add payment gateway integration"
git commit -m "fix: resolve race condition in FIFO logic"
git commit -m "docs: update deployment guide"
```

**Commit Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### 6. Push & Create PR

```bash
git push origin feature/amazing-feature
```

Kemudian create Pull Request via GitHub UI.

## 🎯 Development Guidelines

### Code Style

**JavaScript/JSX:**

- Use ES6+ syntax
- Use `const` dan `let`, avoid `var`
- Use arrow functions
- Use async/await instead of callbacks
- Use template literals untuk string interpolation

**React:**

- Use functional components dengan hooks
- Keep components small dan focused
- Use meaningful component names
- Extract reusable logic ke custom hooks

**Firebase:**

- Always use transactions untuk critical operations
- Validate data before writing to Firestore
- Use server timestamps
- Handle errors properly

### File Structure

```
component/
├── ComponentName.jsx       # Component file
├── ComponentName.test.js   # Tests (if applicable)
└── README.md              # Component documentation (if complex)
```

### Naming Conventions

- **Files**: PascalCase untuk components (`AddAccountModal.jsx`)
- **Variables**: camelCase (`userName`, `accountData`)
- **Constants**: UPPER_SNAKE_CASE (`PRICE_PREMIUM`)
- **Functions**: camelCase, descriptive (`getAvailableAccount`)
- **Components**: PascalCase (`InventoryTable`)

## 🐛 Bug Reports

Saat melaporkan bug, sertakan:

1. **Description**: Apa yang terjadi?
2. **Steps to Reproduce**: Bagaimana cara reproduce bug?
3. **Expected Behavior**: Apa yang seharusnya terjadi?
4. **Actual Behavior**: Apa yang benar-benar terjadi?
5. **Environment**: OS, Node version, Browser, dll
6. **Screenshots**: Jika applicable
7. **Logs**: Error messages atau logs

**Template:**

```markdown
## Bug Description

[Describe the bug]

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior

[What should happen]

## Actual Behavior

[What actually happens]

## Environment

- OS: Ubuntu 22.04
- Node: v18.17.0
- Browser: Chrome 120

## Screenshots

[If applicable]

## Logs

[Error messages or logs]
```

## 💡 Feature Requests

Saat request feature baru, sertakan:

1. **Problem**: Masalah apa yang ingin diselesaikan?
2. **Solution**: Solusi yang Anda usulkan
3. **Alternatives**: Alternatif lain yang sudah dipertimbangkan
4. **Use Case**: Contoh penggunaan feature
5. **Priority**: Low/Medium/High

## 🧪 Testing

### Manual Testing

```bash
# Test complete flow
1. Add account via dashboard
2. Check if account appears in inventory
3. Order via Telegram bot
4. Verify account delivery
5. Check analytics update
```

### Automated Testing (Future)

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📚 Documentation

Saat menambah feature baru:

1. Update README.md jika diperlukan
2. Update relevant documentation di `/docs`
3. Add JSDoc comments untuk functions
4. Update CHANGELOG.md

**JSDoc Example:**

```javascript
/**
 * Get available account using FIFO logic
 * @param {string} packageType - Type of package (premium/standard/basic)
 * @returns {Promise<Object>} Account object
 * @throws {Error} If no account available
 */
export const getAvailableAccount = async (packageType) => {
  // Implementation
};
```

## 🔍 Code Review Process

1. **Self Review**: Review your own code first
2. **Automated Checks**: Ensure CI passes
3. **Peer Review**: Wait for maintainer review
4. **Address Feedback**: Make requested changes
5. **Approval**: Get approval from maintainer
6. **Merge**: Maintainer will merge

## 🎨 UI/UX Contributions

Untuk design contributions:

1. Follow existing design system (Tailwind classes)
2. Maintain dark mode consistency
3. Ensure responsive design
4. Test on multiple screen sizes
5. Consider accessibility (ARIA labels, keyboard navigation)

## 🌐 Internationalization (i18n)

Future feature untuk multi-language support:

```javascript
// Example structure
const translations = {
  id: {
    welcome: "Selamat Datang",
    buy_now: "Beli Sekarang",
  },
  en: {
    welcome: "Welcome",
    buy_now: "Buy Now",
  },
};
```

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Terima kasih atas kontribusi Anda! Setiap contribution, sekecil apapun, sangat berarti untuk project ini. 🎉

## 📞 Questions?

Jika ada pertanyaan, silakan:

- Open an issue
- Contact maintainer
- Join discussion di GitHub Discussions

---

**Happy Contributing! 🚀**
