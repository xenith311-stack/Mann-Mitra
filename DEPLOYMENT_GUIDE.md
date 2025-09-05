# MannMitra Advanced Platform - Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying the advanced MannMitra platform with all AI services, real-time analysis, and cultural adaptation features.

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18+ 
- **npm/yarn**: Latest version
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+
- **HTTPS**: Required for camera/microphone access

### API Keys and Services
1. **Google AI Studio API Key** (Required)
   - Visit: https://makersuite.google.com/app/apikey
   - Create new API key
   - Add to `.env` file

2. **Google Cloud Vision API** (Optional - for enhanced emotion detection)
   - Enable Vision API in Google Cloud Console
   - Create service account key
   - Add credentials to project

3. **Firebase** (Optional - for user data persistence)
   - Create Firebase project
   - Enable Firestore and Authentication
   - Add configuration to project

## 🔧 Environment Configuration

### 1. Create Environment File
```bash
# Copy example environment file
cp .env.example .env
```

### 2. Configure Environment Variables
```env
# Required - Google AI API
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Optional - Enhanced Features
VITE_GOOGLE_CLOUD_PROJECT_ID=your_project_id
VITE_GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key

# Optional - Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# Optional - Analytics
VITE_ANALYTICS_ID=your_analytics_id

# Development
VITE_APP_ENV=production
VITE_API_BASE_URL=https://your-api-domain.com
```

## 📦 Installation and Build

### 1. Install Dependencies
```bash
# Install all dependencies
npm install

# Or with yarn
yarn install
```

### 2. Build for Production
```bash
# Create production build
npm run build

# Or with yarn
yarn build
```

### 3. Preview Build (Optional)
```bash
# Preview production build locally
npm run preview

# Or with yarn
yarn preview
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# vercel.com -> Project -> Settings -> Environment Variables
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

### Option 3: Firebase Hosting
```bash
# Install Firebase CLI
npm i -g firebase-tools

# Initialize Firebase
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### Option 4: Traditional Web Server
```bash
# Build the project
npm run build

# Upload dist/ folder to your web server
# Ensure server supports SPA routing
```

## ⚙️ Server Configuration

### HTTPS Configuration (Required)
Camera and microphone access require HTTPS. Ensure your deployment platform provides SSL certificates.

### SPA Routing Configuration

#### Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

#### Apache
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

## 🔒 Security Configuration

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://apis.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob: https:;
    media-src 'self' blob:;
    connect-src 'self' https://generativelanguage.googleapis.com https://vision.googleapis.com;
    camera 'self';
    microphone 'self';
">
```

### Permissions Policy
```html
<meta http-equiv="Permissions-Policy" content="
    camera=(self),
    microphone=(self),
    geolocation=(),
    payment=()
">
```

## 📊 Monitoring and Analytics

### 1. Performance Monitoring
```javascript
// Add to index.html
<script>
  // Web Vitals monitoring
  import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
  
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
</script>
```

### 2. Error Tracking
```javascript
// Add error boundary and reporting
window.addEventListener('error', (event) => {
  // Send error to monitoring service
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  // Send promise rejection to monitoring service
  console.error('Unhandled promise rejection:', event.reason);
});
```

### 3. AI Service Monitoring
```javascript
// Monitor AI service availability
const monitorServices = async () => {
  const services = {
    aiOrchestrator: true,
    voiceAnalysis: voiceAnalysis.isServiceAvailable(),
    emotionDetection: emotionDetection.isServiceAvailable(),
    sessionManager: sessionManager.getActiveSessionsCount() >= 0
  };
  
  // Send status to monitoring dashboard
  console.log('Service status:', services);
};
```

## 🧪 Testing Deployment

### 1. Functionality Tests
```bash
# Test basic functionality
curl -I https://your-domain.com
curl -I https://your-domain.com/dashboard
curl -I https://your-domain.com/companion

# Test API endpoints
curl -X POST https://your-domain.com/api/health
```

### 2. Performance Tests
- **Lighthouse**: Run performance audit
- **WebPageTest**: Test loading times
- **GTmetrix**: Analyze performance metrics

### 3. Security Tests
- **SSL Labs**: Test SSL configuration
- **Security Headers**: Verify security headers
- **OWASP ZAP**: Security vulnerability scan

### 4. Browser Compatibility
Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

### 5. Feature-Specific Tests
```javascript
// Test camera access
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => console.log('Camera access: OK'))
  .catch(err => console.error('Camera access failed:', err));

// Test microphone access
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => console.log('Microphone access: OK'))
  .catch(err => console.error('Microphone access failed:', err));

// Test AI services
import { geminiAI } from './services/geminiAI';
geminiAI.generateResponse('Test message')
  .then(response => console.log('AI service: OK'))
  .catch(err => console.error('AI service failed:', err));
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Camera/Microphone Not Working
- **Cause**: HTTP instead of HTTPS
- **Solution**: Ensure deployment uses HTTPS

#### 2. AI Services Failing
- **Cause**: Missing or invalid API keys
- **Solution**: Verify environment variables are set correctly

#### 3. SPA Routing Issues
- **Cause**: Server not configured for SPA
- **Solution**: Add proper rewrite rules

#### 4. Build Failures
- **Cause**: Missing dependencies or environment variables
- **Solution**: Check package.json and .env configuration

### Debug Mode
```bash
# Enable debug logging
VITE_DEBUG=true npm run build
```

### Health Check Endpoint
```javascript
// Add to your deployment
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      ai: process.env.VITE_GOOGLE_AI_API_KEY ? 'configured' : 'missing',
      vision: process.env.VITE_GOOGLE_CLOUD_VISION_API_KEY ? 'configured' : 'missing'
    }
  });
});
```

## 📈 Scaling Considerations

### Performance Optimization
1. **Code Splitting**: Lazy load advanced features
2. **Caching**: Implement service worker for offline support
3. **CDN**: Use CDN for static assets
4. **Compression**: Enable gzip/brotli compression

### Load Balancing
- Use load balancer for high traffic
- Implement session affinity if needed
- Monitor resource usage

### Database Scaling
- Use Firebase Firestore for automatic scaling
- Implement proper indexing
- Consider read replicas for high read loads

## 🔄 Continuous Deployment

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_GOOGLE_AI_API_KEY: ${{ secrets.GOOGLE_AI_API_KEY }}
        
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 📞 Support and Maintenance

### Monitoring Checklist
- [ ] SSL certificate expiry
- [ ] API key validity
- [ ] Service availability
- [ ] Performance metrics
- [ ] Error rates
- [ ] User feedback

### Regular Updates
- Update dependencies monthly
- Review security advisories
- Monitor AI service changes
- Update cultural content as needed

### Backup Strategy
- Regular database backups
- Configuration backups
- Code repository backups
- API key rotation schedule

---

**Note**: This deployment guide ensures your advanced MannMitra platform is production-ready with all AI features, security measures, and monitoring in place. Always test thoroughly in a staging environment before deploying to production.