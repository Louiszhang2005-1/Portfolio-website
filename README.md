# Portfolio Website - Isle Commander

A modern, high-performance portfolio website built with Next.js, React, and TypeScript. Features smooth animations, physics-based interactions, and responsive design.

**Live Demo:** https://portfolio-tan-eta-4nkbpc29pz.vercel.app

## 🚀 Tech Stack

- **Framework:** Next.js 16.2.6
- **Frontend:** React 19.2.4, TypeScript
- **Styling:** Tailwind CSS 4, PostCSS
- **Animations:** Framer Motion, GSAP, Motion
- **Physics:** Matter.js
- **Icons:** Lucide React
- **Performance:** Vercel Speed Insights
- **Linting:** ESLint

## 📦 Project Structure

```
portfolio-ship/
├── isle-commander/           # Main application workspace
│   ├── src/                  # Source code
│   ├── public/               # Static assets
│   ├── scripts/              # Development scripts
│   └── package.json
├── package.json              # Root workspace configuration
└── tailwind.config.js        # Tailwind CSS configuration
```

## ⚙️ Installation

### Prerequisites
- Node.js 18+ 
- npm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/Louiszhang2005-1/Portfolio-website.git
cd Portfolio-website

# Install dependencies
npm install

# Install workspace dependencies
cd isle-commander
npm install
cd ..
```

## 🛠️ Development

### Local Development

```bash
# Standard development server (webpack)
npm run dev

# Development with Next.js turbo mode
npm run dev:turbo

# Development with smoke testing (12 seconds)
npm run dev:smoke
```

The application runs on `http://127.0.0.1:3000`

### Build

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Start production server
npm start
```

### Linting

```bash
npm run lint
```

## 🎨 Features

- **Responsive Design:** Mobile-first approach with Tailwind CSS
- **Smooth Animations:** Framer Motion and GSAP for fluid transitions
- **Physics Interactions:** Matter.js for interactive elements
- **Performance Optimized:** Vercel Speed Insights integration
- **Type-Safe:** Full TypeScript support
- **ESLint Configured:** Code quality and consistency

## 📊 Language Composition

- TypeScript: 53.9%
- JavaScript: 21%
- Shell: 14.5%
- CSS: 5.9%
- HTML: 2.9%
- SCSS: 1.3%
- PowerShell: 0.5%

## 🚢 Deployment

This project is deployed on **Vercel** with automatic deployments on every push to the main branch.

### Deploy to Vercel

```bash
# Using Vercel CLI
vercel deploy

# Production deployment
vercel deploy --prod
```

## 📝 Scripts Reference

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | Safe development with PowerShell wrapper | Development with safety checks |
| `dev:next` | Next.js dev with webpack | Standard Next.js development |
| `dev:turbo` | Next.js dev with turbo mode | Faster development builds |
| `dev:smoke` | Smoke test for 12 seconds | Quick validation of changes |
| `build` | Next.js build with webpack | Production build |
| `preview` | Build and start server | Local production preview |
| `start` | Next.js start | Start production server |
| `lint` | ESLint check | Code quality checks |

## 🔧 Configuration Files

- **`package.json`** - Dependencies and scripts
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`next.config.js`** - Next.js configuration
- **`tsconfig.json`** - TypeScript configuration
- **`.eslintrc.json`** - ESLint rules

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is already in use, Next.js will automatically use the next available port.

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### PowerShell Execution Policy
On Windows, if you encounter execution policy errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
```

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Louis Zhang**  
GitHub: [@Louiszhang2005-1](https://github.com/Louiszhang2005-1)

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📞 Support

For issues or questions, please open an issue on the GitHub repository.

---

**Last Updated:** May 18, 2026
