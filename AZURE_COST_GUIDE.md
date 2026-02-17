# Azure Cost Comparison & Sizing Guide

## Executive Summary for Your Use Case

**Your Requirements:**
- 20 max concurrent users
- Typically <5 concurrent users
- PDF processing workload

**Recommended Option: App Service B2**
- **Monthly Cost**: ~$58-68
- **Best for**: 5-20 users, reliable performance
- **Specs**: 2 vCPU, 3.5 GB RAM

---

## Detailed Cost Comparison Table

| Tier | vCPU | RAM | Storage | Concurrent Users | $/Month | Best For |
|------|------|-----|---------|------------------|---------|----------|
| **B1** | 1 | 1.75 GB | 10 GB | 1-5 | $13.14 | Development, <5 users |
| **B2** ✅ | 2 | 3.5 GB | 10 GB | 5-20 | $55.80 | **Your use case** |
| **B3** | 4 | 7 GB | 10 GB | 20-50 | $111.60 | Heavy processing |
| **S1** | 1 | 1.75 GB | 50 GB | 5-10 | $69.35 | Auto-scaling needed |
| **S2** | 2 | 3.5 GB | 50 GB | 10-30 | $138.70 | Production with backups |
| **S3** | 4 | 7 GB | 50 GB | 30-100 | $277.40 | High availability |
| **P1v2** | 1 | 3.5 GB | 250 GB | 10-20 | $146.00 | Production, SLA |
| **P2v2** | 2 | 7 GB | 250 GB | 20-50 | $292.00 | Enterprise |

---

## Complete Azure Solution Cost Breakdown

### Option 1: Budget Setup (B1)
**For: <5 typical users, light usage**

| Component | Specification | Monthly Cost | Annual Cost |
|-----------|--------------|--------------|-------------|
| App Service B1 | 1 vCPU, 1.75 GB RAM | $13.14 | $157.68 |
| Blob Storage | 50 GB, Hot tier | $1.15 | $13.80 |
| Bandwidth | 10 GB outbound | $0.87 | $10.44 |
| **TOTAL** | | **$15.16** | **$181.92** |

**Pros:**
- ✅ Very cost-effective
- ✅ Good for predictable, light loads

**Cons:**
- ❌ May struggle with 20 concurrent users
- ❌ Slower PDF processing
- ❌ No auto-scaling

---

### Option 2: Recommended Setup (B2) ✅
**For: 5-20 users, your use case**

| Component | Specification | Monthly Cost | Annual Cost |
|-----------|--------------|--------------|-------------|
| App Service B2 | 2 vCPU, 3.5 GB RAM | $55.80 | $669.60 |
| Blob Storage | 100 GB, Hot tier | $2.30 | $27.60 |
| Bandwidth | 20 GB outbound | $1.74 | $20.88 |
| App Insights | 5 GB ingestion | $10.00 | $120.00 |
| **TOTAL** | | **$69.84** | **$838.08** |

**Pros:**
- ✅ Handles 20 concurrent users comfortably
- ✅ Fast PDF processing (2 vCPU)
- ✅ Good performance-to-cost ratio
- ✅ Room for growth

**Cons:**
- ❌ Higher cost than B1
- ❌ No auto-scaling (manual only)

---

### Option 3: Production Setup (S1)
**For: Production with auto-scaling**

| Component | Specification | Monthly Cost | Annual Cost |
|-----------|--------------|--------------|-------------|
| App Service S1 | 1 vCPU, 1.75 GB RAM | $69.35 | $832.20 |
| Blob Storage | 200 GB, Hot tier | $4.60 | $55.20 |
| Bandwidth | 30 GB outbound | $2.61 | $31.32 |
| App Insights | 10 GB ingestion | $20.00 | $240.00 |
| Backup Storage | 10 GB backup | $1.00 | $12.00 |
| **TOTAL** | | **$97.56** | **$1,170.72** |

**Pros:**
- ✅ Auto-scaling support
- ✅ Deployment slots (staging/prod)
- ✅ Better uptime SLA
- ✅ 50 GB storage included

**Cons:**
- ❌ Higher cost
- ❌ Only 1 vCPU (but can scale out)

---

### Option 4: Enterprise Setup (P1v2)
**For: Mission-critical production**

| Component | Specification | Monthly Cost | Annual Cost |
|-----------|--------------|--------------|-------------|
| App Service P1v2 | 1 vCPU, 3.5 GB RAM | $146.00 | $1,752.00 |
| Blob Storage | 500 GB, Hot tier | $11.50 | $138.00 |
| Bandwidth | 50 GB outbound | $4.35 | $52.20 |
| App Insights | 20 GB ingestion | $40.00 | $480.00 |
| Backup Storage | 50 GB backup | $5.00 | $60.00 |
| **TOTAL** | | **$206.85** | **$2,482.20** |

**Pros:**
- ✅ 99.95% SLA
- ✅ 250 GB storage
- ✅ Daily backups
- ✅ Virtual network integration
- ✅ Premium hardware

**Cons:**
- ❌ Expensive for your use case
- ❌ Overkill for 20 users

---

### Option 5: Serverless (Container Apps) 💡
**For: Variable workload, cost optimization**

| Component | Specification | Monthly Cost | Annual Cost |
|-----------|--------------|--------------|-------------|
| Container Apps | 0.5 vCPU, 1 GB RAM | $8-25* | $96-300 |
| Blob Storage | 100 GB, Hot tier | $2.30 | $27.60 |
| Bandwidth | 20 GB outbound | $1.74 | $20.88 |
| **TOTAL** | | **$12-29** | **$144-348** |

*Cost varies based on actual usage (scales to zero when idle)

**Pros:**
- ✅ Lowest cost for variable loads
- ✅ Scales to zero (no cost when idle)
- ✅ Auto-scales up for peaks
- ✅ Modern architecture

**Cons:**
- ❌ Cold start delays (~2-3 seconds)
- ❌ More complex setup
- ❌ Python exe may need containerization

---

## Storage Cost Details

### Azure Blob Storage Pricing

| Tier | $/GB/Month | Write Ops (per 10K) | Read Ops (per 10K) | Use Case |
|------|------------|---------------------|-----------------------|----------|
| **Hot** | $0.0184 | $0.05 | $0.004 | Active PDFs, frequent access |
| **Cool** | $0.01 | $0.10 | $0.01 | PDFs accessed <1/month |
| **Archive** | $0.002 | $0.11 | $5.00 | Long-term retention |

**Lifecycle Policy Example:**
- Active PDFs → Hot tier (30 days)
- Inactive PDFs → Cool tier (90 days)
- Archived PDFs → Archive tier (365+ days)

**Estimated Storage Cost for Your Use Case:**
- 100 GB Hot storage: $2.30/month
- 10,000 transactions/month: $0.50/month
- **Total**: ~$2.80/month

---

## Bandwidth (Data Transfer) Costs

| Region | First 5 GB | 5-10 TB | 10-50 TB | 50-150 TB |
|--------|-----------|---------|----------|-----------|
| Zone 1 (US, Europe) | Free | $0.087/GB | $0.083/GB | $0.070/GB |

**Typical Usage:**
- PDF upload: User → Azure (Free)
- TXT download: Azure → User (Charged)
- Average TXT file: 10-50 KB
- 1000 PDFs processed: ~50 MB = $0.04

---

## Comparison Matrix

| Factor | B1 | B2 ✅ | S1 | Container Apps |
|--------|-----|-------|-----|----------------|
| **Cost/Month** | $15 | **$70** | $98 | $12-29 |
| **vCPU** | 1 | 2 | 1 | 0.5-2 |
| **RAM** | 1.75 GB | 3.5 GB | 1.75 GB | 1-4 GB |
| **Auto-Scale** | ❌ | ❌ | ✅ | ✅ |
| **Max Users** | 5 | 20 | 10-30 | 50+ |
| **PDF Processing** | Slow | Fast | Medium | Fast |
| **Setup Complexity** | Easy | Easy | Medium | Hard |
| **Cold Start** | None | None | None | 2-3 sec |
| **Best For** | Dev/Test | **Prod 5-20 users** | Prod + Scale | Variable load |

---

## Recommendation for Your Scenario

### 🎯 **Primary Recommendation: App Service B2**

**Why B2?**
1. ✅ Handles 20 concurrent users comfortably
2. ✅ 2 vCPU = faster PDF processing
3. ✅ 3.5 GB RAM = sufficient for Python exe
4. ✅ Simple deployment (no containers)
5. ✅ No cold starts
6. ✅ Good price/performance ratio

**Monthly Cost Breakdown:**
```
App Service B2:         $55.80
Blob Storage (100GB):    $2.30
Bandwidth (20GB):        $1.74
App Insights (basic):   $10.00
-------------------------
TOTAL:                  $69.84/month
```

**Annual Cost:** ~$838

---

### 🔄 **Alternative: Start with B1, Upgrade if Needed**

**Strategy:**
1. Deploy on B1 ($15/month)
2. Monitor performance for 1-2 weeks
3. Upgrade to B2 if needed (1-click change)
4. **Potential Savings:** $600/year if B1 is sufficient

**When to Upgrade:**
- CPU consistently >70%
- Response time >3 seconds
- See "instance overload" warnings
- More than 5 concurrent users regularly

---

## Cost Optimization Tips

### 1. Storage Lifecycle Policies
```json
{
  "rules": [
    {
      "name": "MoveToCool",
      "type": "Lifecycle",
      "definition": {
        "actions": {
          "baseBlob": {
            "tierToCool": { "daysAfterModificationGreaterThan": 30 }
          }
        }
      }
    }
  ]
}
```
**Savings:** 45% on storage after 30 days

### 2. Auto-Shutdown for Non-Business Hours
If only used 9 AM - 5 PM weekdays:
- Active: 40 hours/week = 24% of time
- **Potential Savings:** ~$40/month on B2

### 3. Reserved Instances (1-3 year commitment)
- 1 year: 20% discount
- 3 years: 40% discount
- B2 with 1-year: $44.64/month (save $11.16/month)

### 4. Use Azure Hybrid Benefit
If you have Windows Server licenses:
- Save up to 40% on App Service
- B2: $55.80 → $33.48/month

---

## Quick Decision Guide

**Choose B1 if:**
- ❓ Typically <5 users
- ❓ Not time-sensitive processing
- ❓ Budget is tight
- ❓ Development/POC environment

**Choose B2 if:** ✅
- ❓ Need to support 20 concurrent users
- ❓ Fast PDF processing is important
- ❓ Moderate budget (~$70/month)
- ❓ Production use

**Choose S1 if:**
- ❓ Need auto-scaling
- ❓ Need deployment slots
- ❓ Want better SLA
- ❓ 50 GB storage needed

**Choose Container Apps if:**
- ❓ Very variable usage
- ❓ Want lowest cost
- ❓ Can tolerate cold starts
- ❓ Comfortable with containers

---

## ROI Calculation

**Current On-Premises Cost (estimated):**
- Windows Server VM: $50-100/month
- Maintenance time: 4 hours/month × $50/hr = $200
- **Total**: ~$250-300/month

**Azure B2 Cost:**
- Service: $70/month
- Maintenance: Minimal (~1 hour/month) = $50
- **Total**: ~$120/month

**Savings**: $130-180/month = **$1,560-2,160/year**

**Additional Benefits:**
- 🚀 Faster deployment
- 🔒 Built-in security
- 📊 Better monitoring
- ⚡ Auto-scaling capabilities
- 🌍 Global availability
- 💾 Automatic backups

---

## Next Steps

1. **Review the detailed deployment guide:** [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md)
2. **Run the deployment script:** `.\deploy-to-azure.ps1`
3. **Start with B1 or B2** based on budget
4. **Monitor for 2 weeks** and adjust if needed
5. **Set up cost alerts** in Azure Portal
