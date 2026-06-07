# MarkItDown 🚀

<div align="center">
  <p><strong>A lightning-fast, 100% client-side PDF to Markdown converter built with Next.js, PDF.js, and Tesseract.js.</strong></p>
</div>

## 🌟 Features

- **100% Client-Side Processing**: All PDF parsing and Optical Character Recognition (OCR) happens entirely within your browser. 
- **Zero Server Cost**: Because the heavy lifting is done on the client, you can deploy this on the free tiers of Vercel or Netlify without ever hitting serverless function timeout limits.
- **Absolute Privacy**: Your documents never leave your device. There is no backend server receiving your files, guaranteeing complete data privacy.
- **Offline Capable**: Once the page and OCR models are loaded, the tool works completely offline.
- **Beautiful UI**: Modern, responsive, and accessible interface built with Tailwind CSS and Framer Motion. Dark mode included!

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **PDF Parsing**: [pdfjs-dist](https://mozilla.github.io/pdf.js/)
- **OCR Engine**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Naveenkm07/MarkItDown.git
   cd MarkItDown
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

## 📦 Deployment

MarkItDown is optimized for edge and static hosting platforms. 

**To deploy on Vercel or Netlify:**
1. Connect your GitHub repository to your Vercel/Netlify dashboard.
2. The platform will automatically detect Next.js and apply the correct build settings (`npm run build`).
3. Deploy! There are no environment variables or backend configurations required.

## 💡 How it Works

1. **File Upload**: The user selects a PDF file.
2. **PDF Parsing**: `pdfjs-dist` reads the binary data locally and renders each page onto an invisible HTML `<canvas>`.
3. **OCR Extraction**: `Tesseract.js` analyzes the canvas image and extracts the text. (Note: The first run downloads a ~20MB language model to the browser cache).
4. **Markdown Generation**: The extracted text is formatted into clean Markdown and presented to the user.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
