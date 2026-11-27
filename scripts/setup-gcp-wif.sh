#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# One-time setup: Keyless Google Cloud Workload Identity Federation (WIF)
# Works even when iam.disableServiceAccountKeyCreation is enforced!
# Run this in Git Bash (with gcloud installed) or GCP Cloud Shell.
# ──────────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ID="terraform-learning-514508"
GITHUB_REPO="PREMYPRASAD/devsecops-pipeline"
SA_NAME="github-terraform-deploy"
POOL_NAME="github-actions-pool"
PROVIDER_NAME="github-oidc-provider"

echo "==> Using GCP Project: $PROJECT_ID"
gcloud config set project "$PROJECT_ID"

PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "==> 1. Enabling required IAM & Compute APIs..."
gcloud services enable iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com compute.googleapis.com

echo "==> 2. Creating Service Account ($SA_EMAIL)..."
gcloud iam service-accounts create "$SA_NAME" \
  --display-name="GitHub Actions Terraform Deploy" 2>/dev/null || true

echo "==> 3. Granting Compute Admin + Service Account User roles..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/compute.admin" --quiet

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser" --quiet

echo "==> 4. Creating Workload Identity Pool ($POOL_NAME)..."
gcloud iam workload-identity-pools create "$POOL_NAME" \
  --location="global" \
  --display-name="GitHub Actions Pool" 2>/dev/null || true

echo "==> 5. Creating GitHub OIDC Provider ($PROVIDER_NAME)..."
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
  --location="global" \
  --workload-identity-pool="$POOL_NAME" \
  --display-name="GitHub OIDC Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='${GITHUB_REPO}'" 2>/dev/null || true

echo "==> 6. Allowing GitHub repo ($GITHUB_REPO) to impersonate $SA_EMAIL..."
gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${GITHUB_REPO}" --quiet

WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"

echo ""
echo "=================================================================="
echo "✅ SETUP COMPLETE! Add these 2 GitHub Repository Secrets:"
echo "   (GitHub -> Settings -> Secrets and variables -> Actions)"
echo "=================================================================="
echo "Secret 1 Name : GCP_WIF_PROVIDER"
echo "Secret 1 Value: ${WIF_PROVIDER}"
echo ""
echo "Secret 2 Name : GCP_SERVICE_ACCOUNT"
echo "Secret 2 Value: ${SA_EMAIL}"
echo "=================================================================="
