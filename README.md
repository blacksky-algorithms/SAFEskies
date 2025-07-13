# SAFEskies Front‑End :shield:

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Stability: Alpha](https://img.shields.io/badge/Stability-Alpha-orange.svg)]()

SAFEskies (Software Against a Fearful Environment) is a BlueSky feed management interface that enables secure moderation of custom feeds. Currently configured for the **Blacksky** feed generator with extensibility for other feeds.

**Requires** the [SAFEskies API](https://github.com/FreedomWriter/safe-skies-api) for backend operations.

**Live Application**: [www.safeskies.app](https://www.safeskies.app)

![SAFEskies Dashboard](https://api.netlify.com/api/v1/sites/372ac785-e388-44bd-b474-db998f785949/screenshots/latest)

---

## Table of Contents

- [SAFEskies Front‑End :shield:](#safeskies-frontend-shield)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
    - [Core Functionality](#core-functionality)
    - [Technical Highlights](#technical-highlights)
  - [⚠️ Stability Warning](#️-stability-warning)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [1. Clone Repository](#1-clone-repository)
    - [2. Install Dependencies](#2-install-dependencies)
  - [Configuration](#configuration)
    - [Create .env.local:](#create-envlocal)
  - [Running the Application](#running-the-application)
    - [Development](#development)
    - [Production Build](#production-build)
    - [Testing](#testing)
  - [Usage](#usage)
    - [Authentication](#authentication)
    - [Core Functions](#core-functions)
    - [Admin vs. Moderator Capabilities](#admin-vs-moderator-capabilities)
  - [API Dependency](#api-dependency)
  - [Security](#security)
    - [Critical Requirements](#critical-requirements)
    - [Secure Practices](#secure-practices)
  - [Contributing](#contributing)
    - [Current Contribution Priorities](#current-contribution-priorities)
    - [Contribution Process](#contribution-process)
  - [License](#license)
  - [Maintainer](#maintainer)

---

## Features

### Core Functionality

- **DID-Based Authentication**: Secure login via BlueSky OAuth
- **Role-Based Access Control**:
  - **Admins**: Feed creators (DID-matched) with full permissions
  - **Moderators**: Users with post removal privileges
- **Feed Management**:
  - View managed feeds
  - Promote/demote moderators
  - Audit logs for all actions

### Technical Highlights

- Next.js 13 App Router architecture
- TypeScript type safety
- Tailwind CSS styling
- Jest testing suite
- Husky pre-commit hooks
- **Scroll restoration**: Preserves feed position during post navigation

---

## ⚠️ Stability Warning

**IMPORTANT**: SAFEskies is currently in an alpha state of development. The application is functional but subject to significant changes as we work toward a stable release.

You should be aware of the following:

- The API and frontend interfaces may change without backward compatibility
- Data structures and storage mechanisms could be modified between versions
- Documentation is still evolving along with the application
- Deployment procedures might change as we stabilize the architecture

We encourage testing and feedback but recommend caution when using SAFEskies in production environments at this stage.

---

## Prerequisites

- **Node.js** v18+
- **npm** v9+ or **yarn** 1.22+
- **Backend API**: Running instance of [SAFEskies API](https://github.com/FreedomWriter/safe-skies-api)
- **BlueSky Account**: For authentication via OAuth

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/FreedomWriter/SAFEskies.git
cd SAFEskies
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

## Configuration

### Create .env.local:

```env
NEXT_PUBLIC_BSKY_BASE_API_URL=https://api.bsky.app
NEXT_PUBLIC_BSKY_BASE=https://bsky.social
NEXT_PUBLIC_SAFE_SKIES_API=http://localhost:4000
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

## Running the Application

### Development

```bash
npm run dev
# Access at http://localhost:3000
```

### Production Build

```bash
npm run build && npm start
```

### Testing

```bash
npm test
```

## Usage

SAFEskies provides a user-friendly interface for managing and moderating BlueSky feeds. Here's how to get started:

### Authentication

1. Navigate to the application at [www.safeskies.app](https://www.safeskies.app)
2. Click "Sign in with BlueSky" to authenticate using your BlueSky account
3. Grant the requested permissions to allow SAFEskies to access your feed data

### Core Functions

- **View Feeds**: See all feeds you have permission to moderate
- **Moderation**: Remove posts that violate feed guidelines
- **User Management**: Admins can promote users to moderator status or remove their privileges
- **Audit Logs**: Review all moderation actions taken on your feeds

### Admin vs. Moderator Capabilities

- **Admins** (feed creators) can:

  - Manage moderator permissions
  - View complete audit logs
  - Access all moderation functions
  - Configure feed settings

- **Moderators** can:
  - Remove inappropriate posts
  - View their own moderation history
  - Access posts from managed feeds

For detailed usage instructions, please reference the [SAFEskies Documentation](https://github.com/FreedomWriter/SAFEskies/wiki) (coming soon).

## API Dependency

The frontend requires a running instance of the SAFEskies API for:

- OAuth authentication with BlueSky
- DID validation
- Role management
- Audit logging
- Feed configuration

## Security

### Critical Requirements

- Never expose Bluesky app passwords in client code
- Use HTTPS in production
- Rotate credentials quarterly
- Validate DIDs on both client and API

### Secure Practices

```bash
# Audit dependencies
npm audit

# Update packages
npm update --audit
```

## Contributing

SAFEskies welcomes community contributions, but please note our current development phase focuses on establishing stability before implementing major new features.

### Current Contribution Priorities

- Bug fixes and stability improvements
- Documentation improvements
- Accessibility enhancements
- Test coverage expansion

### Contribution Process

1. **Check Existing Issues**: Review open issues to see if your concern is already being addressed.

2. **Open an Issue First**: Before submitting code changes, please open an issue to discuss your proposed changes.

   - For bugs, include reproduction steps and expected behavior
   - For features, explain the use case and implementation approach

3. **Development Workflow**:

   ```bash
   # Fork and clone the repository
   git clone https://github.com/your-username/SAFEskies.git
   cd SAFEskies

   # Create a descriptive feature branch
   git checkout -b fix/issue-description

   # Install dependencies
   npm install

   # Make your changes with tests
   # Run tests to ensure no regressions
   npm test
   ```

4. **Code Standards**:

   - Follow existing code style patterns
   - Include comments for complex logic
   - Add tests for new functionality
   - Update documentation to reflect changes

5. **Pull Request Process**:
   - Ensure all tests pass
   - Reference the related issue in your PR
   - Provide a clear description of changes
   - Be responsive to review feedback

The maintainer will review PRs on a regular basis, prioritizing stability-focused contributions during this alpha development phase.

## License

MIT License - See LICENSE for details.

## Maintainer

Maintainer: Natalie Davis ([@codefreedomritr.bsky.social](https://bsky.app/profile/codefreedomritr.bsky.social))
