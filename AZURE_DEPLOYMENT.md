# Azure Deployment Guide - PDF Automation Web App

> **Quick Cost Summary for Your Setup (20 max users, typically <5):**
> - **Recommended: $80-85/month** (includes monitoring, security, and all best practices)
> - **Budget: $17-20/month** (minimal setup for testing/light use)
> - **Deployment Time:** 30-45 minutes
> - **Platform:** Windows App Service with Node.js 20

## Architecture Overview

### Recommended Setup (Single App Service)
```
┌─────────────────────────────────────────────────┐
│  Azure App Service (Windows)                    │
│  ├── Frontend (React - built static files)      │
│  ├── Backend (Node.js Express API)              │
│  └── Python PDF Processor (PyInstaller exe)     │
└─────────────────────────────────────────────────┘
                    ↓ ↑
┌─────────────────────────────────────────────────┐
│  Azure Blob Storage                              │
│  ├── input-pdfs (Container)                     │
│  └── output-extracts (Container)                │
└─────────────────────────────────────────────────┘
```

## Complete Azure Components & Cost Breakdown

### Required Components (Must Have)

| Component | Purpose | Tier/Size | Monthly Cost (USD) | Notes |
|-----------|---------|-----------|-------------------|-------|
| **Resource Group** | Logical container for all resources | N/A | **FREE** | No cost, just a management container |
| **App Service Plan** | Compute resources for web app | B1 (1 vCPU, 1.75 GB) | **$13.14** | Budget option for <5 users |
| **App Service Plan** | Compute resources for web app | B2 (2 vCPU, 3.5 GB) | **$55.80** | Recommended for 5-20 users |
| **App Service (Web App)** | Hosted web application | Included in Plan | **FREE** | No additional cost beyond plan |
| **Azure Blob Storage** | PDF input/output file storage | Standard LRS (Hot) | **$1.84/GB** | ~$2-5/month for 100 GB |
| **Storage Transactions** | Read/write operations | Standard | **$0.05 per 10K writes** | ~$0.50-2/month estimated |
| **Data Transfer (Egress)** | Outbound data from Azure | Standard | **First 5 GB FREE**, then $0.087/GB | ~$5-10/month for PDF downloads |

### Optional Components (Enhanced Features)

| Component | Purpose | Tier/Size | Monthly Cost (USD) | Notes |
|-----------|---------|-----------|-------------------|-------|
| **Application Insights** | Performance monitoring & diagnostics | Basic (5 GB/month) | **$2.88/GB** | ~$5-15/month, highly recommended |
| **Log Analytics Workspace** | Centralized logging | Pay-as-you-go | **$2.76/GB** | ~$2-5/month, needed for App Insights |
| **Azure Key Vault** | Secure secrets management | Standard | **$0.03 per 10K operations** | ~$1-2/month for connection strings |
| **Azure DNS** | Custom domain name resolution | Standard | **$0.50/zone + $0.40/million queries** | ~$1/month with custom domain |
| **App Service Managed Certificate** | Free SSL/TLS certificate | Standard | **FREE** | Auto-renewing, for custom domains |
| **Azure Monitor Alerts** | Email/SMS notifications for issues | Standard | **$0.10 per alert** | ~$1-3/month with 10-30 alerts |

### Enterprise/Advanced Components (Enhanced Security & Scale)

| Component | Purpose | Tier/Size | Monthly Cost (USD) | Notes |
|-----------|---------|-----------|-------------------|-------|
| **Virtual Network (VNet)** | Private network isolation | Standard | **FREE** | No cost for VNet itself |
| **Private Endpoints** | Secure private access to Blob Storage | Standard | **$7.30 per endpoint** | ~$7-15/month for enhanced security |
| **Network Security Group (NSG)** | Firewall rules for VNet | Standard | **FREE** | No cost, just configuration |
| **Application Gateway** | Load balancer with WAF | Standard_v2 | **$140-260/month** | Only for high-scale production |
| **Azure Front Door** | Global CDN + WAF | Standard | **$35 + usage** | ~$50-100/month for global distribution |
| **Azure Backup** | Automated backups | Standard | **$10/50 GB** | ~$10-20/month for storage backups |

### Complete Cost Scenarios

#### Scenario 1: Budget Setup (<5 concurrent users)
| Component | Cost |
|-----------|------|
| Resource Group | $0 |
| App Service Plan B1 | $13.14 |
| Azure Blob Storage (50 GB) | $2.50 |
| Storage Transactions | $1.00 |
| Data Transfer (10 GB/month) | $0.44 |
| **TOTAL** | **~$17-20/month** |

#### Scenario 2: Recommended Production (5-20 concurrent users)
| Component | Cost |
|-----------|------|
| Resource Group | $0 |
| App Service Plan B2 | $55.80 |
| Azure Blob Storage (100 GB) | $5.00 |
| Storage Transactions | $2.00 |
| Data Transfer (20 GB/month) | $1.31 |
| Application Insights | $10.00 |
| Log Analytics Workspace | $3.00 |
| Azure Key Vault | $1.50 |
| Azure Monitor Alerts | $2.00 |
| **TOTAL** | **~$80-85/month** |

#### Scenario 3: Enterprise with High Security (20+ users, VNet isolation)
| Component | Cost |
|-----------|------|
| Resource Group | $0 |
| App Service Plan S1 | $69.35 |
| Azure Blob Storage (200 GB) | $10.00 |
| Storage Transactions | $3.00 |
| Data Transfer (50 GB/month) | $3.92 |
| Application Insights | $15.00 |
| Log Analytics Workspace | $5.00 |
| Azure Key Vault | $2.00 |
| Virtual Network | $0 |
| Private Endpoints (2x) | $14.60 |
| Network Security Group | $0 |
| Azure Monitor Alerts | $3.00 |
| Azure Backup | $15.00 |
| Custom Domain (Azure DNS) | $1.00 |
| **TOTAL** | **~$141-150/month** |

#### Scenario 4: Global Enterprise with Load Balancing
| Component | Cost |
|-----------|------|
| All from Scenario 3 | $141 |
| Application Gateway Standard_v2 | $160.00 |
| Additional App Service Instance | $69.35 |
| **TOTAL** | **~$370-400/month** |

### Annual Cost Projections (with Azure Reserved Instances - 30% savings)

| Scenario | Monthly (Pay-as-you-go) | Annual (Pay-as-you-go) | Annual (1-Year Reserved) | Annual Savings |
|----------|------------------------|----------------------|-------------------------|----------------|
| Budget | $20 | $240 | $180 | $60 (25%) |
| Production | $85 | $1,020 | $750 | $270 (26%) |
| Enterprise | $150 | $1,800 | $1,320 | $480 (27%) |
| Global | $400 | $4,800 | $3,500 | $1,300 (27%) |

---

## Detailed Component Explanations

### Core Infrastructure (Always Required)

**1. Resource Group**
- **Cost:** FREE
- **Purpose:** Logical container that groups all your Azure resources
- **What it does:** Organizes resources, manages permissions, tracks costs together
- **Required:** Yes (one resource group contains everything)

**2. App Service Plan**
- **Cost:** $13-$56/month depending on tier
- **Purpose:** Provides the compute resources (CPU, RAM) to run your web application
- **What it does:** Allocates Windows server capacity for your Node.js app
- **Required:** Yes (your app runs on this)
- **Recommendation:** B2 for 5-20 users, B1 for <5 users

**3. App Service (Web App)**
- **Cost:** FREE (included in App Service Plan)
- **Purpose:** The actual web application instance
- **What it does:** Hosts your Node.js backend + React frontend
- **Required:** Yes (this is your application)

**4. Azure Blob Storage**
- **Cost:** $1.84/GB + $0.05 per 10K operations
- **Purpose:** Cloud file storage for PDF input/output files
- **What it does:** Stores uploaded PDFs and extracted text files securely
- **Required:** Yes (replaces local folder storage)
- **Estimated usage:** ~$5-10/month for 100 GB with typical operations

**5. Data Transfer (Egress)**
- **Cost:** First 5 GB FREE, then $0.087/GB
- **Purpose:** Outbound bandwidth when users download files
- **What it does:** Charges for data leaving Azure data centers
- **Required:** Yes (automatic, usage-based)
- **Estimated usage:** ~$5-15/month depending on PDF sizes

### Monitoring & Operations (Highly Recommended)

**6. Application Insights**
- **Cost:** $2.88/GB of telemetry data (~$5-15/month)
- **Purpose:** Performance monitoring, error tracking, diagnostics
- **What it does:** 
  - Tracks response times, failures, dependencies
  - Alerts you when app is down or slow
  - Shows user analytics and usage patterns
- **Required:** No, but strongly recommended
- **Recommendation:** Enable for production environments

**7. Log Analytics Workspace**
- **Cost:** $2.76/GB (~$2-5/month)
- **Purpose:** Centralized log storage and querying
- **What it does:** 
  - Stores logs from App Service, Application Insights
  - Enables advanced log queries and analysis
  - Required by Application Insights
- **Required:** Only if using Application Insights
- **Recommendation:** Enable with Application Insights

**8. Azure Monitor Alerts**
- **Cost:** $0.10 per alert rule + $0.20 per alert notification
- **Purpose:** Automated notifications for issues
- **What it does:**
  - Email/SMS when CPU >80%, app down, errors spike
  - Proactive issue detection
- **Required:** No
- **Recommendation:** Set 5-10 key alerts (~$2-3/month)

### Security & Secrets (Recommended for Production)

**9. Azure Key Vault**
- **Cost:** $0.03 per 10,000 operations (~$1-2/month)
- **Purpose:** Secure storage for secrets, keys, certificates
- **What it does:**
  - Stores connection strings, API keys securely
  - Better than environment variables
  - Audit logging for secret access
- **Required:** No, but best practice
- **Recommendation:** Use for production (avoid hardcoded secrets)

### Networking (Optional - Enterprise Security)

**10. Virtual Network (VNet)**
- **Cost:** FREE (VNet itself has no cost)
- **Purpose:** Private network isolation for Azure resources
- **What it does:**
  - Creates private IP space
  - Isolates resources from public internet
  - Enables network security rules
- **Required:** No
- **When to use:** Enterprise security requirements, compliance needs

**11. Private Endpoints**
- **Cost:** $7.30 per endpoint per month
- **Purpose:** Private connection to Azure services (Blob Storage)
- **What it does:**
  - Blob Storage accessible only via private IP (not public internet)
  - Data never leaves Azure network
  - Enhanced security for sensitive PDFs
- **Required:** No
- **When to use:** Healthcare, finance, sensitive data (HIPAA, PCI-DSS)

**12. Network Security Group (NSG)**
- **Cost:** FREE
- **Purpose:** Firewall rules for VNet subnets
- **What it does:**
  - Controls inbound/outbound traffic
  - Block/allow specific IPs, ports, protocols
- **Required:** Only with VNet
- **When to use:** With VNet for granular network control

### Custom Domain & DNS (Optional)

**13. Azure DNS**
- **Cost:** $0.50 per hosted DNS zone + $0.40 per million queries
- **Purpose:** DNS hosting for custom domain (e.g., pdf.yourcompany.com)
- **What it does:**
  - Routes custom domain to App Service
  - Manages DNS records
- **Required:** No (use *.azurewebsites.net by default)
- **When to use:** Professional custom domain needed

**14. App Service Managed Certificate**
- **Cost:** FREE
- **Purpose:** SSL/TLS certificate for HTTPS
- **What it does:**
  - Free SSL certificate for custom domains
  - Auto-renews every 6 months
- **Required:** Only with custom domain
- **When to use:** Always use HTTPS for production

### High Availability & Scale (Large Deployments)

**15. Application Gateway**
- **Cost:** $140-260/month (Standard_v2)
- **Purpose:** Layer 7 load balancer with Web Application Firewall (WAF)
- **What it does:**
  - Distributes traffic across multiple app instances
  - WAF protects against OWASP top 10 attacks
  - SSL termination, URL routing
- **Required:** No
- **When to use:** Multiple app instances, need WAF, >50 concurrent users

**16. Azure Front Door**
- **Cost:** $35 base + $0.01/GB egress (~$50-100/month)
- **Purpose:** Global CDN with load balancing and WAF
- **What it does:**
  - Caches static content globally
  - Routes users to nearest Azure region
  - DDoS protection, WAF
- **Required:** No
- **When to use:** Global users, need CDN, >100 concurrent users

**17. Azure Backup**
- **Cost:** $10 per 50 GB per month
- **Purpose:** Automated backups of Blob Storage
- **What it does:**
  - Scheduled backups of all PDFs
  - Point-in-time restore
  - Retention policies (7 days, 30 days, etc.)
- **Required:** No
- **When to use:** Critical data, compliance requirements

---

## Cost Optimization Strategies

### Track Your Actual Costs

```powershell
# View current month's costs for your resource group
az consumption usage list `
  --start-date (Get-Date).AddDays(-30).ToString("yyyy-MM-dd") `
  --end-date (Get-Date).ToString("yyyy-MM-dd") `
  | ConvertFrom-Json `
  | Select-Object pretaxCost, currency, usageStart, usageEnd

# Set up cost alert (when costs exceed $100/month)
az consumption budget create `
  --budget-name "pdf-automation-budget" `
  --category Cost `
  --amount 100 `
  --time-grain Monthly `
  --start-date (Get-Date).ToString("yyyy-MM-01") `
  --end-date (Get-Date).AddYears(1).ToString("yyyy-MM-01")
```

### Immediate Savings (0 effort)
1. **Use B1 tier** if concurrent users stay <5 consistently → Save $43/month
2. **Skip Application Insights** if you don't need monitoring → Save $10/month
3. **Use Cool Blob Storage tier** for old PDFs (>30 days) → Save 50% on storage
4. **Delete old output files** after 90 days → Reduce storage costs

### Medium Savings (Low effort)
1. **Reserved Instances** (1-year commitment) → Save 25-30% on App Service
2. **Lifecycle Management Policies** for Blob Storage → Auto-delete or archive old files
3. **Compress output text files** before storing → Reduce storage by 60-70%
4. **Use Azure Storage Lifecycle** → Auto-move old files to Cool/Archive tier

### Advanced Savings (More effort)
1. **Azure Container Apps** instead of App Service → Pay only when processing (~$10-20/month)
2. **Azure Functions** for PDF processing → Serverless, pay per execution
3. **Auto-shutdown** for non-business hours (dev/test environments) → Save 50% on dev costs
4. **Azure Hybrid Benefit** if you have Windows Server licenses → Save 40% on compute

---

---

## Recommended Setup for Your Requirements

**Your Requirements:** 20 max concurrent users, typically <5 concurrent users

### **Recommended: Production Scenario ($80-85/month)**

This balanced approach provides reliability, monitoring, and security without over-provisioning:

**Core Services:**
- ✅ Resource Group (FREE)
- ✅ App Service Plan B2 - $55.80/month (handles 20 users comfortably)
- ✅ Azure Blob Storage - $5/month (100 GB capacity)
- ✅ Data Transfer - $1.31/month (20 GB outbound)

**Monitoring & Management:**
- ✅ Application Insights - $10/month (catch issues before users do)
- ✅ Log Analytics Workspace - $3/month (debugging and audit trails)
- ✅ Azure Key Vault - $1.50/month (secure secret management)
- ✅ Azure Monitor Alerts - $2/month (email alerts for issues)

**Total: ~$80-85/month** | **Annual: ~$750 with reserved instances (save $270/year)**

### Why This Setup?
1. **B2 Plan**: Handles 20 concurrent users with room to spare, won't struggle during peak times
2. **Application Insights**: You'll know immediately if something breaks (worth every penny)
3. **Key Vault**: Much better than storing connection strings in app settings
4. **Total value**: Professional-grade setup at ~$3/day

### Start Cheaper, Scale Up Later?

If you want to start with absolute minimal cost, begin with **Budget Scenario ($17-20/month)** and scale to B2 when needed (takes 2 minutes, zero downtime):

```powershell
# Scale up command (run anytime):
az appservice plan update --name pdf-automation-plan --resource-group pdf-automation-rg --sku B2
```

### Quick Comparison: What You Get at Each Price Point

| Component | Budget ($20) | **Recommended ($85)** | Enterprise ($150) |
|-----------|--------------|----------------------|-------------------|
| **App Service** | B1 (1 vCPU, 1.75 GB) | **B2 (2 vCPU, 3.5 GB)** | S1 (1 vCPU, 1.75 GB) |
| **Max Concurrent Users** | <5 | **5-20** | 20-50 |
| **Blob Storage** | 50 GB | **100 GB** | 200 GB |
| **Application Insights** | ❌ No | **✅ Yes** | ✅ Yes |
| **Log Analytics** | ❌ No | **✅ Yes** | ✅ Yes |
| **Azure Key Vault** | ❌ No | **✅ Yes** | ✅ Yes |
| **Monitor Alerts** | ❌ No | **✅ Yes (10 alerts)** | ✅ Yes (20 alerts) |
| **Virtual Network** | ❌ No | ❌ No | ✅ Yes |
| **Private Endpoints** | ❌ No | ❌ No | ✅ Yes (2x) |
| **Backup Strategy** | Manual | **Manual** | ✅ Automated |
| **Support Tier** | Community | **Community** | Paid Support Available |
| **Production Ready?** | Dev/Test Only | **✅ Yes** | ✅ Yes (High Security) |

**Legend:**
- Budget: Good for development, testing, personal projects
- **Recommended**: Best value for small business, production-ready with monitoring
- Enterprise: For regulated industries, high security requirements, compliance needs

### Resource Creation Checklist

When you follow the deployment steps, these resources will be created in Azure:

**Core Resources (Required):**
- [ ] Resource Group: `pdf-automation-rg`
- [ ] Storage Account: `pdfautomationstorage` (must be globally unique)
- [ ] Blob Container: `input-pdfs`
- [ ] Blob Container: `output-extracts`
- [ ] App Service Plan: `pdf-automation-plan`
- [ ] Web App: `pdf-automation-webapp` (must be globally unique)

**Configuration Items:**
- [ ] App Settings: `AZURE_STORAGE_CONNECTION_STRING`, `PORT`, `NODE_ENV`
- [ ] Startup Configuration: `web.config` deployed
- [ ] Deployment: Application code deployed via ZIP

**Optional Resources (If Enabled):**
- [ ] Application Insights: `pdf-automation-insights`
- [ ] Log Analytics Workspace: `pdf-automation-logs`
- [ ] Key Vault: `pdf-automation-kv`
- [ ] Monitor Alerts: CPU, Memory, Response Time, Error Rate

**Estimated Setup Time:** 30-45 minutes for core setup, +15 minutes for optional components

---

## Deployment Steps

### Prerequisites
1. Azure subscription
2. Azure CLI installed: `winget install Microsoft.AzureCLI`
3. Node.js & Python environments

### Step 1: Prepare the Application

#### 1.1 Build Frontend
```powershell
cd "D:\OneDrive\Code explorations\NodeJS_app_on_Azure\frontend"
npm run build
# Creates: frontend/dist folder with static files
```


#### 1.2 Modify Backend for Azure Blob Storage
Create: `backend/src/azureStorage.ts`

```typescript
import { BlobServiceClient } from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

export async function uploadBlob(containerName: string, blobName: string, content: Buffer) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.upload(content, content.length);
  return blockBlobClient.url;
}

export async function downloadBlob(containerName: string, blobName: string): Promise<Buffer> {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadResponse = await blockBlobClient.download(0);
  return Buffer.from(await downloadResponse.blobBody);
}

export async function listBlobs(containerName: string): Promise<string[]> {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobs: string[] = [];
  for await (const blob of containerClient.listBlobsFlat()) {
    blobs.push(blob.name);
  }
  return blobs;
}
```

#### 1.3 Update Backend Dependencies
```powershell
cd backend
npm install @azure/storage-blob
npm run build
```

#### 1.4 Copy Frontend Build to Backend
```powershell
# This allows single App Service deployment
Copy-Item -Path "frontend\dist\*" -Destination "backend\public" -Recurse -Force
```

#### 1.5 Update Backend server.ts to Serve Frontend
```typescript
// Add to backend/src/server.ts after other middleware
app.use(express.static(path.join(__dirname, '..', 'public')));

// Add this AFTER all API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});
```

---

### Step 2: Azure CLI Setup

#### 2.1 Login to Azure
```powershell
az login
```

#### 2.2 Set Subscription (if you have multiple)
```powershell
az account list --output table
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

---

### Step 3: Create Azure Resources

#### 3.1 Create Resource Group
```powershell
$resourceGroup = "pdf-automation-rg"
$location = "eastus"  # Or: westus, westeurope, southeastasia, etc.

az group create --name $resourceGroup --location $location
```
**Note:** Resource Groups are FREE - they're just logical containers for organizing resources.

#### 3.2 Create Storage Account
```powershell
$storageAccount = "pdfautomationstorage"  # Must be globally unique, lowercase, no hyphens

az storage account create `
  --name $storageAccount `
  --resource-group $resourceGroup `
  --location $location `
  --sku Standard_LRS `
  --kind StorageV2
```

#### 3.3 Get Storage Connection String
```powershell
$connectionString = az storage account show-connection-string `
  --name $storageAccount `
  --resource-group $resourceGroup `
  --query connectionString `
  --output tsv

Write-Host "Connection String: $connectionString"
```

#### 3.4 Create Blob Containers
```powershell
az storage container create `
  --name "input-pdfs" `
  --account-name $storageAccount `
  --connection-string $connectionString

az storage container create `
  --name "output-extracts" `
  --account-name $storageAccount `
  --connection-string $connectionString
```

#### 3.5 Create App Service Plan
```powershell
$appServicePlan = "pdf-automation-plan"

# For production (B2 - recommended for 20 users):
az appservice plan create `
  --name $appServicePlan `
  --resource-group $resourceGroup `
  --sku B2

# OR for budget (B1 - for <5 users):
# az appservice plan create `
#   --name $appServicePlan `
#   --resource-group $resourceGroup `
#   --sku B1
```

#### 3.6 Create Web App
```powershell
$webAppName = "pdf-automation-webapp"  # Must be globally unique

az webapp create `
  --name $webAppName `
  --resource-group $resourceGroup `
  --plan $appServicePlan `
  --runtime "node|20-lts"
```

#### 3.7 Configure App Settings (Environment Variables)
```powershell
az webapp config appsettings set `
  --name $webAppName `
  --resource-group $resourceGroup `
  --settings `
    AZURE_STORAGE_CONNECTION_STRING=$connectionString `
    PORT=8080 `
    NODE_ENV=production
```

---

### Step 4: Prepare Deployment Package

#### 4.1 Create Deployment Structure
```powershell
cd "D:\OneDrive\Code explorations\NodeJS_app_on_Azure"

# Create deployment folder
New-Item -ItemType Directory -Path "deploy" -Force

# Copy backend
Copy-Item -Path "backend\dist" -Destination "deploy\dist" -Recurse -Force
Copy-Item -Path "backend\node_modules" -Destination "deploy\node_modules" -Recurse -Force
Copy-Item -Path "backend\package.json" -Destination "deploy\" -Force

# Copy frontend build (already in backend/public from step 1.4)
Copy-Item -Path "backend\public" -Destination "deploy\public" -Recurse -Force

# Copy Python exe
Copy-Item -Path "pdf_processin_exe\pdf_processor.exe" -Destination "deploy\" -Force
```

#### 4.2 Create deployment startup script
Create: `deploy/web.config`
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="dist/server.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^dist/server.js\/debug[/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="dist/server.js"/>
        </rule>
      </rules>
    </rewrite>
    <iisnode node_env="production" />
  </system.webServer>
</configuration>
```

---

### Step 5: Deploy to Azure

#### 5.1 Deploy via ZIP
```powershell
cd deploy
Compress-Archive -Path * -DestinationPath ../app.zip -Force
cd ..

az webapp deployment source config-zip `
  --name $webAppName `
  --resource-group $resourceGroup `
  --src app.zip
```

#### 5.2 Configure App Settings for Windows
```powershell
# Windows App Service uses web.config for startup configuration
# The web.config file created in step 4.2 handles the startup automatically

# Optionally, you can also set the Node.js version explicitly:
az webapp config appsettings set `
  --name $webAppName `
  --resource-group $resourceGroup `
  --settings WEBSITE_NODE_DEFAULT_VERSION="~20"
```

---

### Step 6: Configure Custom Domain (Optional)

```powershell
# Add custom domain
az webapp config hostname add `
  --webapp-name $webAppName `
  --resource-group $resourceGroup `
  --hostname "pdf.yourdomain.com"

# Enable HTTPS
az webapp update `
  --name $webAppName `
  --resource-group $resourceGroup `
  --https-only true
```

---

### Step 7: Enable Application Insights (Optional but Recommended)

```powershell
az monitor app-insights component create `
  --app pdf-automation-insights `
  --location $location `
  --resource-group $resourceGroup `
  --application-type web

# Link to Web App
az webapp config appsettings set `
  --name $webAppName `
  --resource-group $resourceGroup `
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="YOUR_KEY"
```

---

## Post-Deployment Configuration

### Access Your Application
```powershell
# Get URL
$appUrl = az webapp show `
  --name $webAppName `
  --resource-group $resourceGroup `
  --query defaultHostName `
  --output tsv

Write-Host "Your app is running at: https://$appUrl"
Start-Process "https://$appUrl"
```

### View Logs
```powershell
# Stream logs
az webapp log tail --name $webAppName --resource-group $resourceGroup

# Or download logs
az webapp log download --name $webAppName --resource-group $resourceGroup
```

### Scale the App
```powershell
# Scale up (change tier)
az appservice plan update `
  --name $appServicePlan `
  --resource-group $resourceGroup `
  --sku S1

# Scale out (add instances)
az appservice plan update `
  --name $appServicePlan `
  --resource-group $resourceGroup `
  --number-of-workers 2
```

---

## File Upload Modification for Azure

Update the frontend to use file upload instead of folder paths:

**frontend/src/App.tsx** (simplified version):
```typescript
const [files, setFiles] = useState<FileList | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!files) return;

  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('pdfs', file);
  });

  const response = await fetch('/api/jobs', {
    method: 'POST',
    body: formData,
  });
  // Handle response...
};

// In the form:
<input 
  type="file" 
  multiple 
  accept="application/pdf"
  onChange={(e) => setFiles(e.target.files)}
/>
```

---

## Monitoring & Maintenance

### Key Metrics to Monitor
1. **Response Time**: Should be <2 seconds
2. **CPU Usage**: Should stay <70%
3. **Memory Usage**: Should stay <80%
4. **Failed Requests**: Should be minimal

### Backup Strategy
```powershell
# Backup storage account data
az storage blob download-batch `
  --source "input-pdfs" `
  --destination "backup/input" `
  --account-name $storageAccount

az storage blob download-batch `
  --source "output-extracts" `
  --destination "backup/output" `
  --account-name $storageAccount
```

---

## Troubleshooting

### Issue: App not starting
```powershell
# Check logs
az webapp log tail --name $webAppName --resource-group $resourceGroup

# Restart app
az webapp restart --name $webAppName --resource-group $resourceGroup
```

### Issue: Python exe not executing
- Ensure the exe is compiled for Windows (Windows App Service)
- Verify the exe has proper permissions and is in the correct path
- Alternative: Install Python runtime on Windows App Service:
  ```powershell
  # Add Python to the App Service via Site Extensions
  # Or use Kudu console to install Python manually
  ```

### Issue: Slow performance
- Scale up to higher tier (B2 → S1)
- Enable Application Insights to identify bottlenecks
- Consider Azure CDN for static content

---

## Cost Optimization Tips

1. **Use B1 tier** if actual concurrent users stay <5
2. **Enable auto-shutdown** for non-business hours (if applicable)
3. **Use Cool/Archive tiers** for old PDF files in Blob Storage
4. **Set blob lifecycle policies** to auto-delete old files after 30/60/90 days
5. **Monitor usage** with Azure Cost Management

---

## Alternative: Azure Container Apps (Serverless)

For even better cost optimization with variable load:

| Component | Monthly Cost |
|-----------|--------------|
| Azure Container Apps | $0.000012/vCPU-second + $0.000002/GiB-second |
| Estimated for <5 users | **~$5-10/month** |
| Estimated for 20 users peak | **~$20-30/month** |

Container Apps scales to zero when not in use, making it ideal for variable workloads!

---

## Summary

### Complete Cost Breakdown for Your Requirements (20 max, <5 typical users)

**Recommended Production Setup: $80-85/month**

**Required Components:**
- Resource Group: FREE
- App Service Plan B2: $55.80/month
- Azure Blob Storage (100 GB): $5.00/month
- Storage Transactions: $2.00/month
- Data Transfer: $1.31/month

**Recommended Add-ons:**
- Application Insights: $10.00/month
- Log Analytics: $3.00/month
- Azure Key Vault: $1.50/month
- Monitor Alerts: $2.00/month

**Total Monthly: $80.61** | **Annual: $967** | **With Reserved Instances: $750/year (save $217)**

### Alternative Options

| Scenario | Monthly Cost | Best For | Components |
|----------|--------------|----------|------------|
| **Budget** | **$17-20** | Dev/test, <5 users always | B1 + Blob Storage only |
| **Recommended** | **$80-85** | Production, 5-20 users | B2 + Blob + Monitoring + Security |
| **Enterprise** | **$141-150** | High security, compliance | S1 + VNet + Private Endpoints + Backup |
| **Global Scale** | **$370-400** | 50+ users, global reach | Multiple instances + App Gateway |

### What's Included vs Optional

**Core Services (Required - Minimum $17/month):**
1. Resource Group (FREE) - Logical container
2. App Service Plan (B1: $13.14 or B2: $55.80) - Compute resources
3. Azure Blob Storage ($2-5) - File storage
4. Data Transfer ($1-5) - Bandwidth

**Monitoring & Operations (Recommended - Add $16/month):**
5. Application Insights ($10) - Performance monitoring
6. Log Analytics ($3) - Centralized logging
7. Azure Key Vault ($1.50) - Secure secrets
8. Monitor Alerts ($2) - Issue notifications

**Security & Networking (Optional - Add $15-30/month):**
9. Virtual Network (FREE) - Network isolation
10. Private Endpoints ($7.30/each) - Private connectivity
11. Network Security Group (FREE) - Firewall rules

**Advanced Features (Optional - Add $150+/month):**
12. Application Gateway ($140+) - Load balancer + WAF
13. Azure Front Door ($50-100) - Global CDN
14. Azure Backup ($10-20) - Automated backups
15. Azure DNS ($1) - Custom domain

### Key Takeaways

1. **Start Budget, Scale Up:** Begin with B1 ($17/month), upgrade to B2 when traffic grows (2-minute command, zero downtime)

2. **Monitoring is Worth It:** Application Insights ($10/month) pays for itself by catching issues before users complain

3. **Reserved Instances:** Commit to 1 year = save 25-30% (~$200-270/year for recommended setup)

4. **Most Expensive Items:**
   - App Service Plan: $13-56/month (60-70% of total cost)
   - Application Gateway: $140/month (only if you need it)
   - Private Endpoints: $7.30 each (only for high security)

5. **Free Components:**
   - Resource Group, VNet, NSG, App Service Managed Certificates
   - First 5 GB data transfer per month
   - Many Azure services have free tiers

### Deployment Information

**Recommended for Your Use Case (20 max, <5 typical):**
- **Tier**: Azure App Service B2 (Windows)
- **Monthly Cost**: $80-85 with monitoring
- **Deployment Time**: ~30-45 minutes
- **Maintenance**: Low (managed service)
- **Scalability**: Easy (just change tier or add instances)

**Next Steps:**
1. Run the deployment commands in order (Steps 1-7)
2. Test the application thoroughly
3. Configure monitoring alerts (email/SMS)
4. Set up backup strategy for critical PDFs
5. Configure custom domain (optional)
6. Enable Azure Cost Management alerts to track spending
