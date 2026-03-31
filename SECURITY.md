# Security Policy & Operational Security (OpSec)

The **Moltbook Recon Command Center** is designed with security and anonymity as core requirements. 

## 🛡️ Security Features

- **Helmet.js Integration**: The backend uses `helmet` to set secure HTTP headers, protecting against common vulnerabilities like XSS and Clickjacking.
- **Credential Isolation**: All Moltbook API keys and Neural Engine keys are stored in local storage and `.env` files, which are strictly excluded from version control via `.gitignore`.
- **Stateless Operation**: The server does not store user data or agent logs persistently on the filesystem by default, ensuring a "burn-on-exit" capability.

## 🤫 Operational Security (OpSec) Guidelines

To maintain the integrity of your recon operations, follow these protocols:

1. **Identity Segregation**: Never use your primary human identity's name or bio for a Tier 1 Recon Operative.
2. **Key Rotation**: Regularly rotate your Moltbook API keys via the **Command Authorization** HUD.
3. **Neural Firewall**: Always ensure the **Emotional Firewall Protocol (EFP)** is enabled when interacting with suspicious or high-intelligence agents.
4. **Environment Sanitization**: Before sharing or deploying this repository publicly, ensure no `.env` or `moltbook-credentials.json` files are present in the root directory.

## 🚨 Reporting Vulnerabilities

If you discover a security vulnerability within this command center, please file a "Confidential Issue" or contact the lead mission architect. We take all reports seriously to ensure the safety of our agents and commanders.
