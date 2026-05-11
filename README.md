# 🎙️ Meeting Transcription Chatbot — Frontend

A premium, production-grade React application that enables users to upload meeting transcripts and engage in natural language conversations using a RAG-powered AI assistant.

🔗 **Backend Repo**: [meeting_transcript_summarizer_assistant_rag_backend](https://github.com/suprajasribalaji/meeting_transcript_summarizer_assistant_rag_backend)

---

## ✨ Features

- 🔐 **Secure Authentication**: Full Login and Signup flow with protected routes.
- 💬 **AI Chatbot**: Real-time conversational interface to query meeting content.
- 📄 **Transcript Processing**: Seamlessly upload PDF meeting transcripts for indexing.
- ⏳ **Chat History**: Browse and resume past meeting conversations.
- 🎨 **Premium UI**: Modern dashboard with glassmorphism, smooth transitions, and responsive design.
- ⚙️ **User Settings**: Manage profile and application preferences.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS + Shadcn/UI |
| Auth | Supabase Auth integration |
| Routing | React Router v6 |
| State Management | React Hooks & Context API |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- Backend server running (see backend README)

### Installation

```bash
# Clone the repository
git clone https://github.com/suprajasribalaji/meeting_transcript_summarizer_assistant_rag_frontend.git

# Navigate to project directory
cd meeting_transcription_summarizer_rag/frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Locally

```bash
npm run dev
```

App runs at `http://localhost:8080`

---

## 📁 Project Structure

```
src/
├── assets/          # Application logos and static images
├── components/      # UI Components
│   ├── ui/          # Base Shadcn/UI components
│   ├── ChatBubble/  # Interactive chat components
│   ├── Navbar/      # Top navigation
│   └── AppSidebar/  # Navigation sidebar
├── pages/           # Page-level components
│   ├── Login.tsx    # User Authentication
│   ├── Signup.tsx   # Account Creation
│   ├── Chat.tsx     # The RAG Chatbot Interface
│   └── History.tsx  # Past meeting sessions
├── services/        # API and Auth integration
│   └── authService.ts
├── hooks/           # Custom React hooks
└── App.tsx          # Root router and layout
```

---

## 🔗 Related Resources

- [Backend Repository](https://github.com/suprajasribalaji/meeting_transcript_summarizer_assistant_rag_backend)
- Built with [React](https://reactjs.org/) · [Vite](https://vitejs.dev/) · [Tailwind CSS](https://tailwindcss.com/)

---
*Happy coding and enjoy building an elegant meeting‑transcription experience!*
