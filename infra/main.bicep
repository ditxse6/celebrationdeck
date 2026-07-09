// CelebrationDeck — Phase 1 infrastructure (subscription-scoped entry point).
// Creates the resource group, then deploys resources via ./resources.bicep.
//
// Deploy (see infra/README.md for full steps):
//   az deployment sub create --location centralus \
//     --template-file infra/main.bicep \
//     --parameters infra/main.parameters.json
//
// Cost posture: Static Web Apps STANDARD (~$9/mo, only fixed cost) + Storage
// (Standard ZRS, Hot) consumption-billed. No other always-on / hourly resources.
// Standard is required for custom auth (Google + Microsoft), rolesSource, and BYOF.

targetScope = 'subscription'

@description('Azure region for all resources. Must be a Static Web Apps-supported region (e.g. centralus, eastus2, westus2, westeurope, eastasia).')
param location string = 'centralus'

@description('Resource group name.')
param resourceGroupName string = 'celebrationdeck'

@description('Base name used to compose resource names.')
param baseName string = 'celebrationdeck'

@description('Region abbreviation used in resource names (e.g. cus for Central US).')
param regionAbbr string = 'cus'

@description('Short environment suffix used in resource names (e.g. prod).')
param environmentName string = 'prod'

@description('Comma-separated Entra (AAD) object IDs (oid claim) granted admin at login (bootstrap). Keep in the gitignored real params file.')
param adminEntraOid string = ''

@description('Application (client) ID of the Entra app registration for Microsoft sign-in.')
param aadClientId string = ''

@description('Client secret for the Entra app registration. Keep only in the gitignored real params file.')
@secure()
param aadClientSecret string = ''

@description('Google OAuth client ID. Empty until configured in Google Cloud Console.')
param googleClientId string = ''

@description('Google OAuth client secret. Keep only in the gitignored real params file.')
@secure()
param googleClientSecret string = ''

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
}

module resources 'resources.bicep' = {
  name: 'celebrationdeck-resources'
  scope: rg
  params: {
    location: location
    baseName: baseName
    regionAbbr: regionAbbr
    environmentName: environmentName
    adminEntraOid: adminEntraOid
    aadClientId: aadClientId
    aadClientSecret: aadClientSecret
    googleClientId: googleClientId
    googleClientSecret: googleClientSecret
  }
}

@description('Default *.azurestaticapps.net hostname to point the Cloudflare CNAME at.')
output swaDefaultHostname string = resources.outputs.swaDefaultHostname
output swaName string = resources.outputs.swaName
output storageAccountName string = resources.outputs.storageAccountName
output resourceGroupName string = rg.name
