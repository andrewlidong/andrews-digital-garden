# Andrew's Digital Garden

A personal digital garden website inspired by macOS, featuring a nostalgic desktop interface with folders and files that showcase projects, interests, and creative work.

![Digital Garden Screenshot](public/macos_assets/startup_message.png)

## 🌱 What is a Digital Garden?

A digital garden is a personal space on the web where ideas, projects, and interests can grow and evolve over time. Unlike traditional blogs with chronological posts, a digital garden is organized by topic and allows for continuous updates and connections between different pieces of content.

## ✨ Features

- **macOS-inspired Interface**: Complete with folders, files, and windows
- **Interactive Desktop**: Click and drag windows, open folders, and read files
- **Responsive Design**: Works on desktop and mobile devices
- **Startup Screen**: Classic macOS-style boot sequence
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
│   ├── macos_assets/        # macOS UI assets
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

### Changing the Theme

The project uses Tailwind CSS for styling. You can customize the theme in the `tailwind.config.js` file.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by macOS interface
- Built with love and airplane pretzels
