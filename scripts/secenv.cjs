#!/usr/bin/env node

/**
 * secenv.cjs - A zero-dependency secrets management tool for solo developers.
 * Syncs environment variables from a central private Git repository.
 * Supports shared secrets, repository-specific variables, and auto-syncing to GitHub Actions.
 */

const fs = require('node:fs')
const path = require('node:path')
const { execSync } = require('node:child_process')
const readline = require('node:readline')

// Directory configurations
const HOME_DIR = process.env.USERPROFILE || process.env.HOME || process.env.HOMEPATH
const CONFIG_DIR = path.join(HOME_DIR, '.secenv')
const SECRETS_DIR = path.join(CONFIG_DIR, 'secrets')
const SECRETS_FILE = path.join(SECRETS_DIR, 'secrets.json')

// Interface for prompting user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

// Helper to run shell commands safely
function runCmd(cmd, cwd = process.cwd()) {
  try {
    return execSync(cmd, { cwd, stdio: ['pipe', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch (_err) {
    return null
  }
}

// Ensure the local config directories exist
function ensureDirectories() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true })
  }
}

// Clone or pull the central secrets repository
async function syncCentralRepo() {
  ensureDirectories()

  if (!fs.existsSync(SECRETS_DIR)) {
    const gitUrl = await question('Enter the Git URL of your private secrets repository: ')

    if (!gitUrl) {
      console.error('Git URL is required to set up secenv.')
      process.exit(1)
    }
    try {
      execSync(`git clone ${gitUrl} "${SECRETS_DIR}"`, { stdio: 'inherit' })
    } catch (err) {
      console.error(
        'Failed to clone repository. Make sure your SSH keys/Git credentials are set up.',
        err.message,
      )
      process.exit(1)
    }
  } else if (fs.existsSync(path.join(SECRETS_DIR, '.git'))) {
    try {
      execSync('git pull', {
        cwd: SECRETS_DIR,
        stdio: ['ignore', 'pipe', 'ignore'],
      })
    } catch (_err) {
      console.warn(
        '\x1b[33m%s\x1b[0m',
        'Warning: Could not pull latest changes. Using cached secrets.',
      )
    }
  }
}

// Get the current repository identifiers
function getRepoInfo() {
  const gitUrl = runCmd('git config --get remote.origin.url')
  const fallbackName = path.basename(process.cwd())

  if (!gitUrl) {
    return { name: fallbackName, path: fallbackName }
  }

  // Parse repo owner and name (handles SSH and HTTPS URLs)
  const match = gitUrl.match(/[:/]([^/]+)\/([^/]+?)(?:\.git)?$/)
  if (match) {
    return {
      owner: match[1],
      name: match[2],
      fullName: `${match[1]}/${match[2]}`,
    }
  }

  return { name: fallbackName, fullName: fallbackName }
}

// Parse a .env or .env.example file
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {}
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const env = {}

  content.split(/\r?\n/).forEach((line) => {
    line = line.trim()
    if (!line || line.startsWith('#')) return

    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^['"]|['"]$/g, '') // strip quotes
      env[key] = value
    } else if (line && !line.includes('=')) {
      // Key with no value (e.g. KEY)
      env[line.trim()] = ''
    }
  })

  return env
}

// Main handler
async function main() {
  const args = process.argv.slice(2)
  const _isSyncOnly = args.includes('sync')
  const isGithubSync = args.includes('--github') || args.includes('-g')

  await syncCentralRepo()

  // Load secrets.json
  let secretsConfig = { shared: {}, projects: {} }
  if (fs.existsSync(SECRETS_FILE)) {
    try {
      secretsConfig = JSON.parse(fs.readFileSync(SECRETS_FILE, 'utf-8'))
    } catch (err) {
      console.error('Error parsing secrets.json:', err.message)
      process.exit(1)
    }
  }

  const repo = getRepoInfo()

  // Ensure project structure exists
  if (!secretsConfig.projects) secretsConfig.projects = {}
  if (!secretsConfig.shared) secretsConfig.shared = {}
  if (!secretsConfig.projects[repo.name]) {
    secretsConfig.projects[repo.name] = {}
  }

  const localExamplePath = path.join(process.cwd(), '.env.example')
  if (!fs.existsSync(localExamplePath)) {
    console.error('Error: .env.example not found in the current directory.')
    rl.close()
    process.exit(1)
  }

  const neededKeys = parseEnvFile(localExamplePath)
  const resolvedEnv = {}
  let modified = false

  for (const key of Object.keys(neededKeys)) {
    let rawValue = secretsConfig.projects[repo.name][key]

    // If key doesn't exist, prompt user
    if (rawValue === undefined) {
      const val = await question(
        `Enter value for ${key} (or 'shared.KEY_NAME' to link to a shared secret): `,
      )

      rawValue = val.trim()
      secretsConfig.projects[repo.name][key] = rawValue
      modified = true
    }

    // Resolve shared reference (e.g., shared.CLOUDFLARE_API_TOKEN)
    if (typeof rawValue === 'string' && rawValue.startsWith('shared.')) {
      const sharedKey = rawValue.substring(7)
      let sharedValue = secretsConfig.shared[sharedKey]

      // If shared secret doesn't exist, prompt for it
      if (sharedValue === undefined) {
        const val = await question(`Enter value for shared secret ${sharedKey}: `)
        sharedValue = val.trim()
        secretsConfig.shared[sharedKey] = sharedValue
        modified = true
      }

      resolvedEnv[key] = sharedValue
    } else {
      resolvedEnv[key] = rawValue
    }
  }

  // Write local .env file
  const localEnvPath = path.join(process.cwd(), '.env')
  let envFileContent = `# Generated by secenv.cjs - DO NOT COMMIT\n`
  for (const [key, val] of Object.entries(resolvedEnv)) {
    // Wrap value in quotes if it contains spaces or special characters
    const safeVal = /[^\w.-]/.test(val) ? `"${val.replace(/"/g, '\\"')}"` : val
    envFileContent += `${key}=${safeVal}\n`
  }

  fs.writeFileSync(localEnvPath, envFileContent, 'utf-8')

  // Save changes back to central store and push
  if (modified) {
    fs.writeFileSync(SECRETS_FILE, JSON.stringify(secretsConfig, null, 2), 'utf-8')

    if (fs.existsSync(path.join(SECRETS_DIR, '.git'))) {
      try {
        execSync('git add secrets.json', { cwd: SECRETS_DIR })
        execSync(`git commit -m "sync: update secrets for ${repo.name}"`, {
          cwd: SECRETS_DIR,
        })
        execSync('git push', { cwd: SECRETS_DIR })
      } catch (err) {
        console.error('Failed to commit/push secrets.json to remote repo:', err.message)
      }
    }
  }

  // Sync to GitHub Actions Secrets if requested
  if (isGithubSync) {
    const ghCheck = runCmd('gh --version')
    if (!ghCheck) {
      console.error('Error: GitHub CLI (gh) is not installed or not in PATH.')
      rl.close()
      process.exit(1)
    }

    try {
      for (const [key, val] of Object.entries(resolvedEnv)) {
        execSync(`gh secret set ${key} --body "${val.replace(/"/g, '\\"')}"`, {
          stdio: 'inherit',
        })
      }
    } catch (_err) {
      console.error(
        'Failed to sync secrets to GitHub Actions. Make sure you are logged in via "gh auth login".',
      )
    }
  }

  rl.close()
}

main().catch((err) => {
  console.error('An unexpected error occurred:', err)
  rl.close()
  process.exit(1)
})
