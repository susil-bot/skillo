#!/usr/bin/env node
/**
 * Creates two tenants (Channels): susil and dev.
 * Run from repo root: npm run create-tenants -w server
 * Requires: server running (npm run dev -w server), and .env with SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const ADMIN_API = process.env.ADMIN_API_URL || 'http://localhost:3000/admin-api';
const USERNAME = process.env.SUPERADMIN_USERNAME || 'superadmin';
const PASSWORD = process.env.SUPERADMIN_PASSWORD || 'superadmin';
const DEFAULT_CHANNEL_TOKEN = '__default_channel__';

async function gql(body, authToken = null, channelToken = DEFAULT_CHANNEL_TOKEN) {
  const headers = {
    'Content-Type': 'application/json',
    'vendure-token': channelToken,
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };
  const res = await fetch(ADMIN_API, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return { data: json.data, authToken: res.headers.get('vendure-auth-token') || authToken };
}

async function main() {
  const channelTokensToTry = [DEFAULT_CHANNEL_TOKEN, 'susil', 'dev'];
  let authToken;
  let channelTokenForRequests = DEFAULT_CHANNEL_TOKEN;
  for (const ct of channelTokensToTry) {
    console.log(`Logging in as superadmin (channel: ${ct})...`);
    try {
      const loginRes = await gql(
        {
          query: `mutation Authenticate($input: AuthenticationInput!) {
            authenticate(input: $input) { ... on CurrentUser { id } }
          }`,
          variables: {
            input: { native: { username: USERNAME, password: PASSWORD } },
          },
        },
        null,
        ct
      );
      authToken = loginRes.authToken;
      channelTokenForRequests = ct;
      if (authToken) break;
    } catch (e) {
      if (e.message.includes('CHANNEL_NOT_FOUND') && channelTokensToTry.indexOf(ct) < channelTokensToTry.length - 1) {
        continue;
      }
      throw e;
    }
  }
  if (!authToken) throw new Error('Login did not return vendure-auth-token header');
  console.log('Logged in.');

  let taxZoneId, shippingZoneId;

  const zonesRes = await gql(
    { query: `query { zones { items { id name } } }` },
    authToken,
    channelTokenForRequests
  );
  const zones = zonesRes.data?.zones?.items || [];
  if (zones.length >= 1) {
    taxZoneId = zones[0].id;
    shippingZoneId = zones[1]?.id ?? zones[0].id;
    console.log(`Using existing zones: tax=${taxZoneId}, shipping=${shippingZoneId}`);
  } else {
    console.log('No zones found. Creating country and zone...');
    let countryId;
    try {
      const countryRes = await gql(
        {
          query: `mutation CreateCountry($input: CreateCountryInput!) {
            createCountry(input: $input) { id code }
          }`,
          variables: {
            input: {
              code: 'US',
              enabled: true,
              translations: [{ languageCode: 'en', name: 'United States' }],
            },
          },
        },
        authToken,
        channelTokenForRequests
      );
      countryId = countryRes.data?.createCountry?.id;
    } catch (e) {
      if (!e.message.includes('already exists') && !e.message.includes('unique')) throw e;
      const listRes = await gql(
        { query: `query { countries { items { id code } } }` },
        authToken,
        channelTokenForRequests
      );
      countryId = listRes.data?.countries?.items?.[0]?.id;
    }
    if (!countryId) throw new Error('Failed to get or create country');
    const zoneRes = await gql(
      {
        query: `mutation CreateZone($input: CreateZoneInput!) {
          createZone(input: $input) { id name }
        }`,
        variables: {
          input: { name: 'Default Zone', memberIds: [countryId] },
        },
      },
      authToken,
      channelTokenForRequests
    );
    const zoneId = zoneRes.data?.createZone?.id;
    if (!zoneId) throw new Error('Failed to create zone');
    taxZoneId = zoneId;
    shippingZoneId = zoneId;
    console.log(`  Created zone: ${zoneId}`);
  }

  const tenants = [
    { code: 'susil', token: 'susil' },
    { code: 'dev', token: 'dev' },
  ];

  for (const t of tenants) {
    console.log(`Creating channel (tenant): ${t.code}...`);
    try {
      await gql(
        {
          query: `mutation CreateChannel($input: CreateChannelInput!) {
            createChannel(input: $input) { ... on Channel { id code token } }
          }`,
          variables: {
            input: {
              code: t.code,
              token: t.token,
              defaultLanguageCode: 'en',
              availableLanguageCodes: ['en'],
              pricesIncludeTax: false,
              currencyCode: 'USD',
              defaultCurrencyCode: 'USD',
              availableCurrencyCodes: ['USD'],
              defaultTaxZoneId: taxZoneId,
              defaultShippingZoneId: shippingZoneId,
            },
          },
        },
        authToken,
        channelTokenForRequests
      );
      console.log(`  Created tenant: ${t.code} (token: ${t.token})`);
      channelTokenForRequests = t.token;
    } catch (e) {
      if (e.message.includes('already exists') || e.message.includes('unique') || e.message.includes('Unique')) {
        console.log(`  Tenant ${t.code} already exists, skipping.`);
        channelTokenForRequests = t.token;
      } else {
        throw e;
      }
    }
  }

  console.log('\nTenants ready. Storefront tenant-config already includes susil and dev.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
