# Andrew's Digital Garden

A personal digital garden showcasing my journey from mathematics to culinary arts to software engineering. This interactive space features a terminal-inspired interface with folders and files that organize my projects, interests, and creative explorations.

![Digital Garden Screenshot](public/screenshot.png)

## 🌱 About This Digital Garden

This digital garden serves as a creative expression of my professional journey and personal interests. After graduating from the University of Chicago with a degree in pure mathematics, I spent time working as a chef in elite kitchens across America before finding my passion in software engineering. This space reflects the diverse experiences and interests I've cultivated along the way.

## 💻 What You'll Find Here

- **Projects**: Explore my software development work, from full-stack applications to experimental tools
- **Interests**: Dive into my personal interests including sports, music, gaming, and athletic pursuits
- **Film**: Discover my passion for cinema through appreciation, filmmaking, and favorite films
- **Music**: Explore my musical journey as both a listener and creator

## ✨ Features

- **Terminal-Inspired Interface**: Complete with a Linux-style boot sequence and command-line aesthetic
- **Interactive Desktop**: Click and drag windows, open folders, and read files
- **Responsive Design**: Works on desktop and mobile devices
- **File System**: Organized content in a familiar folder structure
- **Markdown Support**: Content files written in Markdown for easy formatting

## 🛠️ Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- React Markdown

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/andrewlidong/andrews-digital-garden.git
   cd andrews-digital-garden
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
andrews-digital-garden/
├── public/                  # Static assets
│   ├── files/               # Markdown content files
│   ├── macos_assets/        # UI assets
│   └── ...
├── src/
│   ├── components/          # React components
│   │   ├── personal/        # Desktop UI components
│   │   └── ui/              # shadcn UI components
│   ├── content/             # Content configuration
│   │   └── filesystem.json  # File system structure
│   ├── pages/               # Page components
│   └── ...
└── ...
```

## 🔧 Customization

### Adding New Content

1. Add your Markdown file to the `public/files/` directory
2. Update the `src/content/filesystem.json` file to include your new content

Example:
```json
{
  "id": "my_new_file",
  "name": "My New File.txt",
  "type": "file",
  "path": "/files/my_new_file.md"
}
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 About Me

I'm a software engineer with a background in pure mathematics and professional cooking. My journey has taken me from the University of Chicago to elite kitchens across America, and finally to the world of software engineering. I strive to work with style, taste, dignity, and grace, focusing on how my work moves and touches those around me.

When I'm not coding, you can find me rock climbing, exploring local farmer's markets, running through Central Park, enjoying the outdoors, attending live music events, or making use of my library card.
