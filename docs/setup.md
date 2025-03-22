# Development Environment Setup

## Prerequisites

1. **Install Node.js and npm**

   - Download and install Node.js (v16.0.0 or later) from [Node.js official website](https://nodejs.org/)
   - npm will be installed automatically with Node.js

   For macOS users (using Homebrew):

   ```bash
   brew install node
   ```

   For Linux users:

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

   For Windows users:

   - Download and run the installer from [Node.js website](https://nodejs.org/)

2. **Verify Installation**
   ```bash
   node --version
   npm --version
   ```

## Project Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up Environment Variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build Project**

   ```bash
   npm run build
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Docker Alternative

If you prefer using Docker without installing Node.js locally:

1. **Install Docker**

   - [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
   - [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
   - [Docker Engine for Linux](https://docs.docker.com/engine/install/)

2. **Start with Docker**
   ```bash
   docker-compose up
   ```

## IDE Setup

1. **Install VSCode**

   - Download from [Visual Studio Code website](https://code.visualstudio.com/)

2. **Install Recommended Extensions**

   - ESLint
   - Prettier
   - TypeScript and JavaScript Language Features
   - Docker
   - Remote Development

3. **Configure VSCode**
   - The project includes preconfigured settings in `.vscode/`
   - Debugging configurations are ready to use

## Troubleshooting

1. **Node.js/npm Issues**

   - Clear npm cache: `npm cache clean --force`
   - Reinstall Node.js if needed
   - Check environment variables (PATH)

2. **Permission Issues**

   - Linux/macOS: `sudo chown -R $USER:$GROUP ~/.npm`
   - Windows: Run terminal as administrator

3. **Port Conflicts**
   - Check if ports 3000 and 9229 are available
   - Modify port numbers in configuration if needed

## Next Steps

After setup:

1. Read the [Debugging Guide](debugging.md)
2. Review [Project Documentation](../README.md)
3. Check [Contributing Guidelines](../CONTRIBUTING.md)

## Support

If you encounter any issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review project issues on GitHub
3. Create a new issue if needed
