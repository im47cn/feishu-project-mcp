# Feishu Project MCP Service

An intelligent development workflow automation service that integrates with Feishu project management system using Model Context Protocol (MCP).

## Features

- Automated requirement analysis and completeness checking
- Technical design generation based on requirements
- Code implementation assistance
- Automated code submission via Gitlab MCP
- Task status tracking and notification
- Integration with Feishu project management

## Prerequisites

- Node.js >= 16
- TypeScript >= 4.5
- Feishu API access token
- MCP SDK

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/feishu-project-mcp.git
cd feishu-project-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

Create a configuration file or use command line arguments to provide the following settings:

- `--feishu-token`: Feishu API access token (required)
- `--feishu-api-url`: Custom Feishu API URL (optional)
- `--check-interval`: Interval for checking projects in milliseconds (default: 900000)
- `--storage-dir`: Directory for storing task data (default: ./storage)
- `--log-dir`: Directory for log files (default: ./logs)
- `--log-level`: Logging level (default: info)
- `--max-concurrent-tasks`: Maximum number of concurrent tasks (default: 10)

## Usage

1. Start the service:
```bash
npm start -- --feishu-token YOUR_TOKEN
```

2. With custom configuration:
```bash
npm start -- \
  --feishu-token YOUR_TOKEN \
  --check-interval 300000 \
  --log-level debug \
  --max-concurrent-tasks 5
```

## Development

1. Start in development mode:
```bash
npm run dev
```

2. Run tests:
```bash
npm test
```

3. Lint code:
```bash
npm run lint
```

4. Format code:
```bash
npm run format
```

## Project Structure

```
feishu-project-mcp/
├── src/
│   ├── core/           # Core MCP service implementation
│   ├── integrators/    # External service integrations
│   ├── managers/       # Business logic managers
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions and helpers
│   └── index.ts        # Application entry point
├── docs/              # Documentation
├── tests/            # Test files
└── package.json
```

## Documentation

- [Architecture Decision Records](docs/ADR/)
- [API Documentation](docs/api.md)
- [Development Guide](docs/development.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
