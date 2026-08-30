# Contributing Guidelines

## Code of Conduct

All contributors must maintain professionalism and respect. Be courteous to fellow developers.

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `feature/otp-validation`
- `bugfix/duplicate-vote-race-condition`
- `docs/api-specification`
- `refactor/voting-service`

### 2. Make Changes

- Follow code standards (see [Development Guide](DEVELOPMENT.md#code-standards))
- Write tests for new functionality
- Keep commits atomic and meaningful
- Document your changes

### 3. Commit Messages

Use clear, descriptive commit messages:

```
feat: Add OTP verification functionality

- Implement secure OTP code generation
- Add 5-minute expiration logic
- Add rate limiting (5 attempts max)

Closes #123
```

Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Test additions
- `perf:` Performance improvements
- `chore:` Maintenance

### 4. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request with:
- Clear description of changes
- Reference to related issues
- Screenshots/videos if UI changes
- Testing notes

### 5. Code Review

- Address feedback promptly
- Keep discussions professional
- Update PR based on review comments

### 6. Merge

Once approved:

```bash
git checkout main
git pull origin main
git merge --no-ff feature/your-feature-name
git push origin main
```

## Testing Requirements

All changes must include appropriate tests:

### Backend Tests

```bash
cd backend
php artisan test
```

- Unit tests for services
- Feature tests for API endpoints
- Security tests for authorization

### Frontend Tests

```bash
cd frontend
npm test
```

- Component tests
- Hook tests
- Integration tests

## Code Review Checklist

Before submitting PR, verify:

- [ ] Code follows standards
- [ ] Tests added/updated
- [ ] No console errors/warnings
- [ ] No security issues introduced
- [ ] Database migrations included (if needed)
- [ ] Documentation updated
- [ ] .env.example updated (if needed)
- [ ] Performance impact assessed
- [ ] Backward compatibility maintained

## Security Guidelines

When making changes:

- [ ] No hardcoded secrets
- [ ] Input validation added
- [ ] Output encoding applied
- [ ] CSRF protection included
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] Authentication/authorization checked
- [ ] Audit logging added for sensitive operations

See [Security Guidelines](SECURITY.md) for detailed requirements.

## Documentation Standards

- Update README if setup changes
- Add code comments for complex logic
- Document new API endpoints
- Update DEVELOPMENT.md for new processes
- Include JSDoc/PHPDoc for all public methods
- Update examples if behavior changes

## Performance Considerations

- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Cache long-running queries
- Minimize API calls
- Lazy load components when possible
- Avoid N+1 query problems

Test performance impact:
- Backend: Use Laravel's query profiler
- Frontend: Use React DevTools Profiler

## Deployment

Changes are automatically deployed after merge to main:

1. Tests run
2. Build process executes
3. Staging deployment
4. Production deployment (after staging verification)

## Getting Help

- Review [Development Guide](DEVELOPMENT.md)
- Check [Architecture](ARCHITECTURE.md)
- See [API Documentation](API.md)
- Read [Security Guidelines](SECURITY.md)
- Contact: election@level200.local

## Areas Needing Contribution

Priority areas:
- [ ] Comprehensive test suite
- [ ] Runoff election implementation
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Internationalization (i18n)
- [ ] Mobile app version
- [ ] API documentation
- [ ] Video tutorials

## Bug Reports

When reporting bugs:

1. **Title:** Clear, concise description
2. **Environment:** OS, browser, version
3. **Steps to reproduce:** Exact steps to trigger bug
4. **Expected behavior:** What should happen
5. **Actual behavior:** What actually happened
6. **Screenshots/logs:** Any relevant attachments

Example:

```
Title: Student unable to vote when code expires

Environment: Chrome 120, Windows 11

Steps:
1. Enter student ID
2. Receive OTP code
3. Wait 6 minutes
4. Enter code

Expected: Error message "Code expired"
Actual: No response, button unresponsive

Logs: attached in debug.log
```

## Feature Requests

When requesting features:

1. **Description:** Clear feature description
2. **Use case:** Why this feature is needed
3. **Benefits:** How it improves the system
4. **Implementation notes:** Any technical suggestions
5. **Priority:** Low/Medium/High

## License

By contributing, you agree that your code will be licensed under the same proprietary license as this project.

## Questions?

Email: election@level200.local
