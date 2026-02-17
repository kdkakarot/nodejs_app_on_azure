# Azure Deployment Guide - PDF Automation Web App

## Architecture Overview

### Recommended Setup (Single App Service)
```
┌─────────────────────────────────────────────────┐
│  Azure App Service (Linux)                      │
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

## Azure Components & Pricing

| Component | Tier/Size | Specifications | Monthly Cost (USD) | Notes |
|-----------|-----------|----------------|-------------------|-------|
| **App Service Plan** | B2 (Basic) | 2 vCPU, 3.5 GB RAM, 10 GB storage | **~$55.80** | Best for 5-20 concurrent users |
| **App Service Plan** | B1 (Basic) | 1 vCPU, 1.75 GB RAM, 10 GB storage | **~$13.14** | Sufficient for <5 users |
| **Azure Blob Storage** | Standard (Hot) | LRS, 100 GB storage, 10K transactions | **~$2.30** | For PDF input/output files |
| **App Insights** | Basic (Optional) | 5 GB data ingestion | **~$0-10** | Monitoring & logging |
| **TOTAL (Recommended)** | B2 + Blob | - | **~$58-68** | For 5-20 users |
| **TOTAL (Budget)** | B1 + Blob | - | **~$15-25** | For <5 users, lighter loads |

### Detailed Cost Calculator

**Option 1: Production (B2 - Recommended for 20 users)**
- App Service B2: $55.80/month
- Blob Storage (100 GB): $2.30/month
- Data Transfer (out): ~$5-10/month (depends on PDF sizes)
- **Total: ~$63-68/month**

**Option 2: Budget (B1 - For <5 users)**
- App Service B1: $13.14/month
- Blob Storage (50 GB): $1.15/month
- Data Transfer (out): ~$2-5/month
- **Total: ~$16-19/month**

**Option 3: Enterprise (S1 - For production with autoscaling)**
- App Service S1: $69.35/month
- Blob Storage (200 GB): $4.60/month
- Application Gateway (optional): $140/month
- **Total: ~$74-214/month**

### Storage Pricing Details
| Operation | Cost |
|-----------|------|
| Hot Blob Storage | $0.0184/GB (first 50 TB) |
| Write operations | $0.05 per 10,000 transactions |
| Read operations | $0.004 per 10,000 transactions |
| Data egress | $0.087/GB (after first 5 GB free) |

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
$location = "eastus"

az group create --name $resourceGroup --location $location
```

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
  --sku B2 `
  --is-linux

# OR for budget (B1 - for <5 users):
# az appservice plan create `
#   --name $appServicePlan `
#   --resource-group $resourceGroup `
#   --sku B1 `
#   --is-linux
```

#### 3.6 Create Web App
```powershell
$webAppName = "pdf-automation-webapp"  # Must be globally unique

az webapp create `
  --name $webAppName `
  --resource-group $resourceGroup `
  --plan $appServicePlan `
  --runtime "NODE:20-lts"
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
Create: `deploy/startup.sh`
```bash
#!/bin/bash
echo "Starting PDF Automation App..."
node dist/server.js
```

#### 4.3 Create .deployment file
Create: `deploy/.deployment`
```
[config]
command = startup.sh
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

#### 5.2 Configure Startup Command
```powershell
az webapp config set `
  --name $webAppName `
  --resource-group $resourceGroup `
  --startup-file "node dist/server.js"
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
- Ensure the exe is compiled for Linux if using Linux App Service
- Alternative: Use Python runtime instead of exe:
  ```powershell
  az webapp config set --name $webAppName --resource-group $resourceGroup --linux-fx-version "NODE|20-lts"
  # Then install Python on the App Service
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

**Recommended for Your Use Case (20 max, <5 typical):**
- **Tier**: Azure App Service B1 or B2
- **Monthly Cost**: $16-68 depending on load
- **Deployment Time**: ~30-45 minutes
- **Maintenance**: Low (managed service)
- **Scalability**: Easy (just change tier or add instances)

**Next Steps:**
1. Run the deployment commands in order
2. Test the application
3. Configure monitoring
4. Set up backup strategy
5. Configure custom domain (optional)
