# SnipShare - Real-time Code Editor & Compiler

A modern, full-stack web application for real-time code collaboration, compilation, and sharing. Write, compile, run, and share code in Python, Java, and more with real-time collaboration features.

## 🌟 Features

- **Real-time Code Editor** - Monaco Editor (VS Code's editor) integration
- **Multi-language Support** - Python, Java, and more
- **Code Compilation & Execution** - Run code directly in the browser
- **User Authentication** - Secure login/signup with Supabase
- **Code Sharing** - Share code snippets with unique URLs
- **File Management** - Save and manage your code files
- **Beautiful UI** - Modern, responsive design with TailwindCSS & Material-UI
- **Real-time Collaboration** - Work together on code in real-time

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Monaco Editor** - Code editor component
- **TailwindCSS** - Styling
- **Material-UI** - UI components
- **React Router** - Navigation
- **Supabase** - Authentication & Database

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Python 3** - Python code execution
- **Java JDK** - Java code compilation & execution

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python 3** - [Download](https://www.python.org/downloads/)
- **Java JDK** - [Download](https://www.oracle.com/java/technologies/downloads/)
- **Supabase Account** - [Sign up](https://supabase.com/)

### Verify Installation

```bash
node --version    # Should show v16 or higher
python3 --version # Should show Python 3.x
java --version    # Should show Java version
javac --version   # Should show Java compiler version
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd SnipShare
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **API**
3. Copy your credentials and update `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_SERVICE_ROLE=your_service_role_key
```

### 3. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 4. Start Development Servers

#### Option A: Use the startup script (Recommended)

```bash
./start-dev.sh
```

This will start both frontend and backend servers automatically.

#### Option B: Start manually

```bash
# Terminal 1 - Backend API
cd backend
npm start

# Terminal 2 - Frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 📁 Project Structure

```
SnipShare/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── server.js       # Main server (Python + Java APIs)
│   │   ├── python-server.js # Standalone Python API
│   │   └── java-server.js  # Standalone Java API
│   ├── package.json
│   ├── .env
│   └── README.md
├── src/                    # Frontend source code
│   ├── PAGES/             # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── UserFiles.jsx
│   ├── components/        # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── TextEditors.jsx
│   │   ├── Features.jsx
│   │   └── ...
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── config.js         # Configuration
├── public/               # Static assets
├── .env                  # Environment variables
├── .env.example          # Environment template
├── package.json
├── vite.config.js
├── start-dev.sh         # Development startup script
└── README.md

```

## 🔧 Configuration

### Frontend Environment Variables (`.env`)

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_SERVICE_ROLE=your_service_role_key

# Backend API Endpoints
VITE_PYTHON_API=http://localhost:3000/api/python/execute
VITE_JAVA_API=http://localhost:3000/api/java/execute
```

### Backend Environment Variables (`backend/.env`)

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## 📡 API Endpoints

### Python Code Execution
```
POST http://localhost:3000/api/python/execute
Content-Type: application/json

{
  "code": "print('Hello, World!')",
  "input": ""
}
```

### Java Code Execution
```
POST http://localhost:3000/api/java/execute
Content-Type: application/json

{
  "code": "public class Main { public static void main(String[] args) { System.out.println(\"Hello\"); } }",
  "input": ""
}
```

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:3000/health

# Test Python execution
curl -X POST http://localhost:3000/api/python/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"Hello from Python\")"}'

# Test Java execution
curl -X POST http://localhost:3000/api/java/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"public class Main { public static void main(String[] args) { System.out.println(\"Hello from Java\"); } }"}'
```

## 🔒 Security Features

- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS Protection** - Configured for frontend origin
- **Helmet Security** - HTTP security headers
- **Execution Timeout** - 10-second limit per execution
- **Temporary File Cleanup** - Automatic cleanup after execution
- **Supabase Auth** - Secure authentication and authorization

## 🚧 Known Limitations

- Execution time limited to 10 seconds
- Output size limited to 1MB
- No network access restrictions (security consideration for production)
- Memory tracking not implemented

## 🔮 Future Enhancements

- [ ] Docker containerization for better isolation
- [ ] Support for more languages (C++, JavaScript, Go, Rust)
- [ ] WebSocket for real-time output streaming
- [ ] Code versioning and history
- [ ] Collaborative editing with multiple cursors
- [ ] Code templates and snippets library
- [ ] Syntax highlighting themes
- [ ] Export code to GitHub Gist

## 🐛 Troubleshooting

### Backend not starting
- Ensure Python 3 and Java JDK are installed
- Check if port 3000 is available
- Verify backend dependencies are installed: `cd backend && npm install`

### Frontend not connecting to backend
- Ensure backend is running on port 3000
- Check `.env` file has correct API URLs
- Verify CORS settings in backend

### Supabase authentication issues
- Verify Supabase credentials in `.env`
- Check Supabase project is active
- Ensure correct API keys are used

### Code execution not working
- Verify Python 3 is installed: `python3 --version`
- Verify Java JDK is installed: `java --version && javac --version`
- Check backend logs for errors

## 📄 License

MIT

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on GitHub.
