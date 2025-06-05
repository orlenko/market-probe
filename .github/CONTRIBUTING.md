# Contributing to Market-Probe

Thank you for your interest in contributing to Market-Probe! This document provides guidelines and instructions for contributing to this project.

## Git Workflow

We follow a simplified GitHub Flow for this project:

1. **Create a branch**: Create a new branch from `main` for your feature or bugfix

   ```
   git checkout -b feature/your-feature-name
   ```

   or

   ```
   git checkout -b fix/your-bugfix-name
   ```

2. **Make changes**: Make your changes in the branch

3. **Test locally**: Ensure your changes work as expected

   ```
   npm run lint
   npm run test
   npm run build
   ```

4. **Commit your changes**: Use clear and descriptive commit messages

   ```
   git commit -m "Add feature: clear description of the change"
   ```

5. **Push to GitHub**:

   ```
   git push -u origin feature/your-feature-name
   ```

6. **Create a Pull Request**: Open a PR against the `main` branch

7. **Code Review**: Wait for code review and address any feedback

8. **Merge**: Once approved and CI checks pass, your PR will be merged into `main`

## Branch Protection Rules

The `main` branch is protected with the following rules:

- Require pull request reviews before merging
- Require status checks to pass before merging
  - CI must pass (lint, build, test)
- Require branches to be up to date before merging
- Restrict who can push to matching branches

## Continuous Integration

We use GitHub Actions for CI/CD:

- **Lint**: Checks code style and quality
- **Build**: Ensures the project builds successfully
- **Test**: Runs unit tests
- **Deploy**: Automatically deploys to Vercel on merges to `main`

## Development Guidelines

- Write tests for new features and bug fixes
- Follow the existing code style and patterns
- Update documentation for significant changes
- Keep Pull Requests focused on a single concern
