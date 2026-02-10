/**
 * CLI Authentication module for tridyme-cli.
 * Handles login, token storage (~/.tridyme/credentials.json),
 * and token validation against the TriDyme developers platform.
 */
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const axios = require('axios');

const TRIDYME_DIR = path.join(os.homedir(), '.tridyme');
const CREDENTIALS_FILE = path.join(TRIDYME_DIR, 'credentials.json');

// API base URL - configurable via env for testing
const API_BASE_URL =
  process.env.TRIDYME_API_URL || 'https://developers.tridyme.io';

/**
 * Save credentials to ~/.tridyme/credentials.json
 */
function saveCredentials(data) {
  fs.ensureDirSync(TRIDYME_DIR, { mode: 0o700 });
  fs.writeJsonSync(
    CREDENTIALS_FILE,
    {
      token: data.token,
      user_id: data.user_id,
      email: data.email,
      full_name: data.full_name,
      api_url: API_BASE_URL,
      saved_at: new Date().toISOString(),
    },
    { spaces: 2, mode: 0o600 }
  );
}

/**
 * Load credentials from disk. Returns null if not logged in.
 */
function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_FILE)) return null;
  try {
    return fs.readJsonSync(CREDENTIALS_FILE);
  } catch {
    return null;
  }
}

/**
 * Delete stored credentials (logout).
 */
function clearCredentials() {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    fs.removeSync(CREDENTIALS_FILE);
  }
}

/**
 * Get the auth token, or null if not logged in.
 */
function getToken() {
  const creds = loadCredentials();
  return creds ? creds.token : null;
}

/**
 * Login to the platform via email/password.
 * Returns { token, user_id, email, full_name }.
 */
async function login(email, password) {
  const response = await axios.post(`${API_BASE_URL}/api/cli/login`, {
    email,
    password,
    device_name: `${os.hostname()} (${os.platform()})`,
  });
  return response.data;
}

/**
 * Validate that the stored token is still valid.
 * Returns user info or null if invalid.
 */
async function validateToken() {
  const creds = loadCredentials();
  if (!creds) return null;

  try {
    const response = await axios.get(
      `${creds.api_url || API_BASE_URL}/api/cli/validate`,
      { params: { token: creds.token }, timeout: 10000 }
    );
    if (response.data.valid) {
      return response.data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Logout - invalidate token on server and delete local file.
 */
async function logout() {
  const creds = loadCredentials();
  if (creds) {
    try {
      await axios.post(
        `${creds.api_url || API_BASE_URL}/api/cli/logout`,
        null,
        { params: { token: creds.token }, timeout: 10000 }
      );
    } catch {
      /* ignore errors on logout */
    }
  }
  clearCredentials();
}

/**
 * Create an axios instance pre-configured with auth headers.
 */
function createAuthClient() {
  const creds = loadCredentials();
  if (!creds) throw new Error('Not logged in. Run: tridyme login');

  return axios.create({
    baseURL: creds.api_url || API_BASE_URL,
    headers: {
      Authorization: `Bearer ${creds.token}`,
    },
    timeout: 300000, // 5 min for uploads
  });
}

module.exports = {
  saveCredentials,
  loadCredentials,
  clearCredentials,
  getToken,
  login,
  validateToken,
  logout,
  createAuthClient,
  API_BASE_URL,
};
