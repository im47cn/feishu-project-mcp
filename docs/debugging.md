# Debugging Guide

This guide explains how to debug the Feishu Project MCP Service in different environments.

## VSCode Debugging

### Local Development

1. **Debug Service**

   ```bash
   # Start the service in debug mode
   npm run dev:debug
   ```

   Or use VSCode:

   - Press F5 or select "Debug Service" from the debug menu
   - Set breakpoints in your code
   - Use the debug toolbar to control execution

2. **Debug Tests**

   - Open a test file
   - Select "Debug Current Test" from the debug menu
   - Set breakpoints in your test code
   - Press F5 to start debugging

3. **Debug CLI**
   ```bash
   # Start CLI in debug mode
   npm run debug:cli
   ```
   Or use VSCode:
   - Select "Debug CLI" from the debug menu
   - Set breakpoints in CLI code
   - Press F5 to start debugging

### Docker Environment

1. **Start Debug Container**

   ```bash
   npm run dev:docker
   ```

   This will:

   - Build the development image
   - Start containers with debug support
   - Expose debug ports

2. **Attach Debugger**

   - Select "Attach to Process" from VSCode debug menu
   - VSCode will automatically attach to the debug port
   - Set breakpoints and debug as normal

3. **Debug Tests in Docker**
   ```bash
   # Run tests in debug mode
   docker-compose -f docker-compose.yml -f docker-compose.debug.yml run test
   ```

## Debug Configurations

### Available VSCode Launch Configurations

- **Debug Service**: Launch the main service with debugger
- **Debug CLI**: Debug CLI commands
- **Debug Current Test**: Debug the currently open test file
- **Attach to Process**: Attach to a running debug process
- **Debug Full Stack**: Launch service and attach debugger

### NPM Debug Scripts

```bash
# Start service in debug mode
npm run dev:debug

# Debug tests
npm run test:debug

# Debug specific test file
npm run test:debug -- path/to/test.ts

# Debug CLI
npm run debug:cli

# Start Docker debug environment
npm run dev:docker
```

## Debugging Tips

1. **Source Maps**

   - Source maps are enabled for TypeScript debugging
   - Set breakpoints in `.ts` files, not compiled `.js` files
   - Check sourcemap configuration in `tsconfig.json` if issues occur

2. **Node.js Inspector**

   - Chrome DevTools: Open `chrome://inspect`
   - Add your debug configuration if needed
   - Use for advanced debugging features

3. **Docker Debugging**

   - Container must be built with `Dockerfile.dev`
   - Debug port (9229) must be exposed
   - Volume mounts must be configured correctly
   - Use `docker-compose.debug.yml` for debug settings

4. **Common Issues**
   - Port conflicts: Check if port 9229 is available
   - Connection refused: Ensure debug port is exposed
   - Source maps not working: Check TypeScript configuration
   - Docker connection issues: Check network configuration

## Environment-Specific Debugging

### Development

```bash
# Start with full development features
npm run dev:debug
```

### Testing

```bash
# Debug all tests
npm run test:debug

# Debug specific test
npm run test:debug -- --testNamePattern="test name"
```

### Production-like

```bash
# Build production code
npm run build

# Start with inspector
node --inspect dist/index.js
```

## Remote Debugging

1. **SSH Tunnel Setup**

   ```bash
   ssh -L 9229:localhost:9229 user@remote-host
   ```

2. **Start Remote Process**

   ```bash
   npm run dev:debug
   ```

3. **Local Connection**
   - Use "Attach to Process" in VSCode
   - Connect to localhost:9229

## Security Considerations

- Debug mode exposes additional ports
- Never enable debugging in production
- Use secure connections for remote debugging
- Restrict debug port access in Docker networks
- Remove debug configurations in production builds

## Additional Resources

- [Node.js Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [VSCode Debugging](https://code.visualstudio.com/docs/editor/debugging)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Docker Debug Documentation](https://docs.docker.com/compose/reference/)
