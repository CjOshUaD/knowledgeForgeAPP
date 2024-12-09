# KnowledgeForge Learning Management System

KnowledgeForge is a modern Learning Management System (LMS) that provides a seamless platform for online education. Built with Next.js and MongoDB, it offers a robust solution for course management, assignments, and assessments.

## Quick Start

1. **Clone and Install**

```bash
git clone https://github.com/your-username/knowledgeForgeAPP.git
cd knowledgeForgeAPP
npm install
```

2. **Environment Setup**
Create a `.env.local` file:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

3. **Run Application**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Core Features

- 📚 **Course Management**
  - Chapter-based course organization
  - Multiple content types support
  - File attachments

- ✍️ **Assignments**
  - Timed submissions
  - File upload support
  - Automated status tracking

- 📝 **Quizzes**
  - Timed assessments
  - Instant grading
  - Progress tracking

- 👥 **User System**
  - Secure authentication
  - Course enrollment
  - Progress tracking

## Tech Stack

- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB
- **Auth**: NextAuth.js
- **State Management**: React Hooks

## Project Structure

```
src/
├── app/
│   ├── api/         # API routes
│   ├── components/  # Reusable components
│   ├── courses/     # Course-related pages
│   └── lib/         # Utility functions
├── types/           # TypeScript definitions
└── styles/          # Global styles
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own learning and development.

## Contact

Your Name - [your email]

Project Link: [https://github.com/your-username/knowledgeForgeAPP](https://github.com/your-username/knowledgeForgeAPP)

## Acknowledgments

* Christian Joshua Dadia(Front and Backend)
* Marie Claire Cenel (UI/UX designer)
# KnowledgeForge Development Guide

## Prerequisites

1. **Node.js & npm**   ```bash
   # Verify installation
   node --version  # Should be 14.x or higher
   npm --version   # Should be 6.x or higher   ```

2. **MongoDB**
   - Install MongoDB locally or have a MongoDB Atlas account
   - Keep your connection string ready

3. **Environment Setup**
   Create a `.env.local` file in the root directory:   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret   ```

## Installation Steps

1. **Clone the Repository**   ```bash
   git clone [repository-url]
   cd knowledgeForgeAPP   ```

2. **Install Dependencies**   ```bash
   npm install   ```

3. **Database Setup**   ```bash
   # Seed the database (optional)
   npm run seed   ```

4. **Start Development Server**   ```bash
   npm run dev   ```

## Project Structure

