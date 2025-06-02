# CodeNANO 🚀

> A professional, full-featured web-based IDE with multi-language support, real-time collaboration, and mobile-optimized development experience.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)

## ✨ Features

### 🎯 Core Development Tools
- **Multi-Language Support**: JavaScript, TypeScript, Python, HTML/CSS, React, Vue, Next.js, Astro, and more
- **Advanced Code Editor**: Syntax highlighting, auto-completion, error detection, and intelligent suggestions
- **Real-Time Preview**: Instant preview with hot reload for web technologies
- **File Management**: Full file explorer with create, edit, delete, and organize capabilities
- **Project Templates**: Pre-built templates for popular frameworks and use cases

### 🌐 Cross-Platform Experience
- **Mobile-First Design**: Optimized touch interface for coding on smartphones and tablets
- **Responsive Layout**: Seamless experience across desktop, tablet, and mobile devices
- **Offline Capability**: Continue coding even without internet connection
- **Progressive Web App**: Install as native app on any device

### 👥 Collaboration & Sharing
- **Project Sharing**: Share projects with public links or keep them private
- **User Profiles**: Showcase your projects and follow other developers
- **Community Explore**: Discover and learn from community projects
- **Version History**: Track changes and revert to previous versions

### ☁️ Cloud Integration
- **Auto-Save**: Automatic project saving to prevent data loss
- **Cloud Sync**: Access your projects from any device
- **Export Options**: Download projects or push to GitHub
- **Authentication**: Secure user accounts with email verification

## 🚀 Quick Start

### Try Online
Visit [CodeNANO](https://your-domain.com) and start coding immediately - no installation required!

### Local Development

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/code-nano.git
   cd code-nano
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your environment variables:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   \`\`\`

4. **Set up the database**
   \`\`\`bash
   # Run the database setup
   npm run db:setup
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Code Editor**: Monaco Editor (VS Code engine)
- **Icons**: Lucide React

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **API**: Next.js API Routes
- **Real-time**: Supabase Realtime

### Development Tools
- **Package Manager**: npm/yarn/pnpm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript
- **Deployment**: Vercel

## 📱 Supported Languages & Frameworks

| Language/Framework | Syntax Highlighting | Auto-completion | Live Preview | Templates |
|-------------------|-------------------|----------------|-------------|-----------|
| HTML/CSS/JS       | ✅                | ✅             | ✅          | ✅        |
| TypeScript        | ✅                | ✅             | ✅          | ✅        |
| React             | ✅                | ✅             | ✅          | ✅        |
| Vue               | ✅                | ✅             | ✅          | ✅        |
| Next.js           | ✅                | ✅             | ✅          | ✅        |
| Astro             | ✅                | ✅             | ✅          | ✅        |
| Python            | ✅                | ✅             | 🔄          | ✅        |
| Markdown          | ✅                | ✅             | ✅          | ✅        |

## 🏗️ Project Structure

\`\`\`
code-nano/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── editor/            # Main editor page
│   └── explore/           # Community projects
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   └── editor/           # Editor-specific components
├── lib/                  # Utility functions
│   ├── supabase.ts       # Database client
│   ├── editor-store.ts   # Editor state management
│   └── utils.ts          # Helper functions
├── public/               # Static assets
└── sql/                  # Database schemas
\`\`\`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |

### Database Setup

The application uses Supabase with the following main tables:
- `profiles` - User profile information
- `projects` - User projects and code
- `project_versions` - Version history
- `saved_projects` - Bookmarked projects

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Run `npm run lint` before committing
- Write meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The code editor that powers VS Code
- [Supabase](https://supabase.com/) - Backend as a Service
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components

## 📞 Support

- 📧 Email: support@codenano.dev
- 💬 Discord: [Join our community](https://discord.gg/codenano)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/code-nano/issues)
- 📖 Documentation: [docs.codenano.dev](https://docs.codenano.dev)

---

<div align="center">
  <p>Built with ❤️ by the CodeNANO team</p>
  <p>
    <a href="https://codenano.dev">Website</a> •
    <a href="https://docs.codenano.dev">Documentation</a> •
    <a href="https://github.com/your-username/code-nano/issues">Report Bug</a> •
    <a href="https://github.com/your-username/code-nano/issues">Request Feature</a>
  </p>
</div>
