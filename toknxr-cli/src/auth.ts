import * as http from 'http';
import open from 'open';
import chalk from 'chalk';
import * as keytar from 'keytar'; // Import keytar

const CLI_LOGIN_PORT = 8789;
const WEB_APP_URL = 'http://localhost:3000';
const SERVICE_NAME = 'toknxr-cli'; // A unique name for our service in the keychain
const ACCOUNT_NAME = 'default-user'; // A generic account name for the stored token

// Function to securely store the token
const storeToken = async (token: string) => {
  await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, token);
  console.log(chalk.green('Supabase JWT securely stored in system keychain.'));
};

// Function to retrieve the token
const getToken = async (): Promise<string | null> => {
  return await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
};

export const login = async () => {
  const server = new Promise<string>((resolve, reject) => {
    const s = http.createServer(async (req, res) => {
      // Handle CORS preflight requests
      res.setHeader('Access-Control-Allow-Origin', WEB_APP_URL);
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.method === 'POST' && req.url === '/token') {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const requestBody = Buffer.concat(chunks).toString();
        const { token: supabaseJwt } = JSON.parse(requestBody); // Supabase JWT

        if (supabaseJwt) {
          console.log(chalk.green('CLI authentication successful!'));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
          s.close();
          resolve(supabaseJwt); // Resolve with the Supabase JWT
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No token provided' }));
          s.close();
          reject(new Error('No token provided'));
        }
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    s.listen(CLI_LOGIN_PORT, async () => {
      const loginUrl = `${WEB_APP_URL}/cli-login?port=${CLI_LOGIN_PORT}`;
      console.log(chalk.yellow('Your browser has been opened to complete the login process.'));
      await open(loginUrl);
    });
  });

  try {
    const supabaseJwt = await server; // Get the Supabase JWT
    await storeToken(supabaseJwt); // Store the Supabase JWT securely
    console.log(chalk.cyan('Authentication complete. You can now use TokNxr CLI commands.'));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red('Login failed:', message));
  }
};

// Export getToken for other parts of the CLI to use
export { getToken };
