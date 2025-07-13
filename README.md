# LogisticsPricer

A professional web application for freight transport cost calculation using the MERN stack (MongoDB, Express.js, React, Node.js).

**Author**: Antonino Mirabile  
**License**: [CC-BY-NC-4.0](LICENSE) (Non-commercial use)

## 🚀 Overview

LogisticsPricer provides accurate shipping estimates based on specific logistics parameters, with a modern and responsive interface.

### Key Features
- ✅ Real-time transport cost calculation
- ✅ Modern and responsive user interface
- ✅ Calculation history and analytics
- ✅ Scalable RESTful API
- ✅ Robust input/output validation
- ✅ Optimized performance
- ✅ Community-driven development

## 🏗️ Architecture

### Technology Stack
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: MongoDB + Mongoose ODM
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod
- **Testing**: Jest + Vitest + React Testing Library

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Git

### Quick Setup

#### 🎯 Simple Method (Recommended)
```bash
# Clone repository
git clone <repository-url>
cd logisticspricer

# Start the entire application with one command
./start.sh

# To stop everything
./stop.sh
```

#### 🔧 Manual Method
```bash
# Clone repository
git clone <repository-url>
cd logisticspricer

# Setup backend
cd backend
npm install
npm run dev

# Setup frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Useful Commands

#### Management Scripts
```bash
./start.sh          # Start the entire application
./stop.sh           # Stop all services
./stop.sh status    # Show service status
./stop.sh force     # Force stop all services
```

#### Logs and Monitoring
```bash
# View real-time logs
tail -f logs/backend.log    # Backend logs
tail -f logs/frontend.log   # Frontend logs

# Check service status
./stop.sh status
```

## 📊 Performance Goals

- **API Response Time**: <500ms
- **Frontend Load Time**: <5s
- **Bundle Size**: <1MB gzipped
- **Lighthouse Score**: >80
- **Test Coverage**: >70%

## 🤝 Contributing

This project follows GitHub community best practices:

### Quality Gates (Relaxed for Community)
- ✅ Test coverage >70%
- ✅ Linting with max 10 warnings
- ✅ Performance response time <500ms
- ✅ Bundle size <1MB
- ✅ Security audit (max 5 low-severity vulnerabilities)

### Contribution Process
1. Fork the repository
2. Create feature branch
3. Implement changes
4. Test and validate
5. Pull request with template
6. Review and merge

## 📄 License

This project is released under the [Creative Commons Attribution-NonCommercial 4.0 International](LICENSE) license.

### What you can do:
- ✅ Share and distribute the material
- ✅ Adapt and modify the code
- ✅ Use for educational and personal purposes

### What you CANNOT do:
- ❌ Use for commercial purposes
- ❌ Omit attribution to the author
- ❌ Apply additional restrictions

## 👨‍💻 Author

**Antonino Mirabile** - Full-stack developer with experience in modern technologies and software development best practices.

## 🤖 AI Development Support

This project was developed with AI support to optimize the development process and ensure code quality. AI was used for:

- Boilerplate code generation
- Performance optimization
- Best practices implementation
- Testing and quality assurance
- Technical documentation

---

**Note**: This project is open source and accepts contributions from the community. For more details on how to contribute, consult the project guidelines.