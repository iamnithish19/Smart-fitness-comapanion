import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import * as mongoManager from './src/server/mongoManager.js';

const SMTP_CONFIG_FILE = path.resolve(process.cwd(), 'smtp_config.json');

function getSmtpConfig() {
  try {
    if (fs.existsSync(SMTP_CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(SMTP_CONFIG_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading smtp_config.json', e);
  }
  return {
    service: process.env.SMTP_SERVICE || 'gmail',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587
  };
}

function emailPlugin() {
  return {
    name: 'sfc-email-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url.split('?')[0];

        if (url === '/api/get-smtp-status' && req.method === 'GET') {
          const cfg = getSmtpConfig();
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              configured: Boolean(cfg.user && cfg.pass),
              service: cfg.service || 'gmail',
              user: cfg.user ? cfg.user.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null
            })
          );
          return;
        }

        if (url === '/api/save-smtp-config' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              fs.writeFileSync(SMTP_CONFIG_FILE, JSON.stringify(data, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  message: 'SMTP configuration saved successfully!'
                })
              );
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (url === '/api/send-otp-email' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { email, code } = JSON.parse(body);
              const cfg = getSmtpConfig();

              if (!cfg.user || !cfg.pass) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: false,
                    configured: false,
                    message:
                      'SMTP sender credentials are not set yet. Please configure sender Gmail or SMTP to deliver directly to mobile phones.'
                  })
                );
                return;
              }

              let transporterOpts = {};
              if (cfg.service && cfg.service !== 'custom') {
                transporterOpts = {
                  service: cfg.service,
                  auth: {
                    user: cfg.user,
                    pass: cfg.pass
                  }
                };
              } else {
                transporterOpts = {
                  host: cfg.host,
                  port: Number(cfg.port) || 587,
                  secure: Number(cfg.port) === 465,
                  auth: {
                    user: cfg.user,
                    pass: cfg.pass
                  }
                };
              }

              const transporter = nodemailer.createTransport(transporterOpts);

              await transporter.sendMail({
                from: `"Smart Fitness Companion" <${cfg.user}>`,
                to: email,
                subject: `🔐 Your Smart Fitness Login Code: ${code}`,
                text: `Hello,\n\nYour Smart Fitness Companion one-time verification code is: ${code}\n\nThis code is valid for 5 minutes. Enter this code into your screen to complete authentication.\n\nStay fit and strong,\nSmart Fitness Companion Team`,
                html: `
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
                    <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 28px 24px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.05em; font-weight: 900;">SMART FITNESS COMPANION</h1>
                      <p style="color: #bae6fd; margin: 6px 0 0 0; font-size: 14px; font-weight: 600;">SECURE ACCESS VERIFICATION</p>
                    </div>
                    <div style="padding: 32px 28px; text-align: center;">
                      <h2 style="color: #0f172a; margin: 0 0 12px; font-size: 20px; font-weight: 800;">One-Time Verification Code (OTP)</h2>
                      <p style="color: #475569; font-size: 15px; line-height: 1.5; margin: 0 0 24px;">
                        You requested a verification code to log in to your Smart Fitness account. Please use the 6-digit code below:
                      </p>
                      <div style="background: #f0fdf4; border: 2.5px dashed #22c55e; border-radius: 14px; padding: 20px; margin: 0 auto 24px; display: inline-block; min-width: 260px;">
                        <span style="font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #15803d; font-family: monospace;">${code}</span>
                      </div>
                      <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0 0 16px;">
                        ⏰ This verification code is active for <strong>5 minutes</strong>.
                      </p>
                      <div style="background: #f8fafc; border-radius: 10px; padding: 12px; font-size: 13px; color: #64748b;">
                        🛡️ If you did not request this verification code, please ignore this email.
                      </div>
                    </div>
                    <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                      Smart Fitness Companion Ecosystem • Instant OTP Security
                    </div>
                  </div>
                `
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  message: `Verification code successfully sent to ${email}!`
                })
              );
            } catch (err) {
              console.error('Failed to dispatch real email:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: false,
                  error: err.message || 'Failed to dispatch email'
                })
              );
            }
          });
          return;
        }

        next();
      });
    }
  };
}

function mongoApiPlugin() {
  return {
    name: 'sfc-mongodb-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url.split('?')[0];

        // 1. GET /api/mongodb/status
        if (url === '/api/mongodb/status' && req.method === 'GET') {
          try {
            const status = await mongoManager.getStatus();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(status));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ connected: false, error: err.message, collections: [] }));
          }
          return;
        }

        // 2. POST /api/mongodb/test
        if (url === '/api/mongodb/test' && req.method === 'POST') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const { uri, dbName } = JSON.parse(body || '{}');
              const result = await mongoManager.testConnection(uri, dbName);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // 3. POST /api/mongodb/save-config
        if (url === '/api/mongodb/save-config' && req.method === 'POST') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const saved = mongoManager.saveConfig(data);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, config: saved }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // 4. POST /api/mongodb/sync-all
        if (url === '/api/mongodb/sync-all' && req.method === 'POST') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const { data } = JSON.parse(body || '{}');
              if (!data) throw new Error('No dataset provided to sync');
              const result = await mongoManager.syncAllTables(data);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, result }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // 5. GET /api/mongodb/fetch-all
        if (url === '/api/mongodb/fetch-all' && req.method === 'GET') {
          try {
            const data = await mongoManager.fetchAllTables();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, data }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        // 6. POST /api/mongodb/save-row
        if (url === '/api/mongodb/save-row' && req.method === 'POST') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const { table, row, pkField } = JSON.parse(body || '{}');
              await mongoManager.saveRow(table, row, pkField);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // 7. POST /api/mongodb/delete-row
        if (url === '/api/mongodb/delete-row' && req.method === 'POST') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', async () => {
            try {
              const { table, id, pkField } = JSON.parse(body || '{}');
              await mongoManager.deleteRow(table, id, pkField);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), emailPlugin(), mongoApiPlugin()],
  server: {
    port: 5173
  }
});
