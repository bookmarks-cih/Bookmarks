#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE = 'https://urlscan.io/api/v1';
const RESULTS_FILE = path.join(__dirname, '..', 'data', 'results.json');
const BOOKMARKS_FILE = path.join(__dirname, '..', 'data', 'bookmarks-data.js');

// Récupérer la clé API depuis les variables d'environnement
const API_KEY = process.env.URLSCAN_API_KEY;

if (!API_KEY) {
  console.error('❌ URLSCAN_API_KEY environment variable is required');
  process.exit(1);
}

// Fonction pour parser le fichier bookmarks-data.js
function parseBookmarksData() {
  try {
    const content = fs.readFileSync(BOOKMARKS_FILE, 'utf8');
    // Extraire le tableau JSON du fichier JavaScript
    const match = content.match(/window\.BOOKMARKS_DATA\s*=\s*(\[[\s\S]*\]);?/);
    if (!match) {
      throw new Error('Could not parse BOOKMARKS_DATA');
    }
    return JSON.parse(match[1]);
  } catch (error) {
    console.error('❌ Error parsing bookmarks data:', error.message);
    process.exit(1);
  }
}

// Fonction pour faire une requête HTTP avec fetch natif (Node 18+)
async function fetchWithTimeout(url, options = {}, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'API-Key': API_KEY,
        ...options.headers
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Soumettre une URL pour scan
async function submitScan(url) {
  console.log(`🔍 Submitting scan for: ${url}`);
  
  try {
    const response = await fetchWithTimeout(`${API_BASE}/scan/`, {
      method: 'POST',
      body: JSON.stringify({
        url: url,
        visibility: 'public'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.message || errorData.description || 'Unknown error'}`);
    }

    return response.json();
  } catch (error) {
    console.error(`❌ Submit failed for ${url}:`, error.message);
    throw error;
  }
}

// Récupérer le résultat du scan
async function getScanResult(uuid) {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/result/${uuid}/`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`❌ Get result failed for ${uuid}:`, error.message);
    throw error;
  }
}

// Poller pour obtenir le résultat
async function pollForResult(uuid, maxAttempts = 30) {
  console.log(`⏳ Polling for result: ${uuid}`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes
      
      const result = await getScanResult(uuid);
      if (result) {
        console.log(`✅ Result ready for ${uuid} (attempt ${attempt})`);
        return result;
      }
      
      console.log(`⏳ Still waiting for ${uuid}... (${attempt}/${maxAttempts})`);
    } catch (error) {
      console.error(`❌ Polling attempt ${attempt} failed for ${uuid}:`, error.message);
      
      // Si ce n'est pas juste un 404, on arrête de poller
      if (!error.message.includes('404')) {
        throw error;
      }
    }
  }
  
  throw new Error(`Timeout waiting for scan result: ${uuid}`);
}

// Scanner une URL
async function scanUrl(urlItem) {
  const url = urlItem.link;
  
  try {
    // Soumettre le scan
    const submission = await submitScan(url);
    
    // Poller pour le résultat
    const result = await pollForResult(submission.uuid);
    
    // Déterminer le statut
    let status = 'healthy';
    if (result.verdicts?.malicious) {
      status = 'error';
    } else if (result.data?.response?.status >= 500) {
      status = 'error';
    } else if (result.data?.response?.status >= 400) {
      status = 'warning';
    }
    
    // Retourner les données formatées
    return {
      url: url,
      name: urlItem.name,
      category: urlItem.cat,
      description: urlItem.desc,
      status: status,
      statusCode: result.data?.response?.status || 0,
      title: result.page?.title || urlItem.name,
      reportUrl: `https://urlscan.io/result/${submission.uuid}/`,
      timestamp: Date.now(),
      scanUuid: submission.uuid
    };
    
  } catch (error) {
    console.error(`❌ Scan failed for ${url}:`, error.message);
    
    return {
      url: url,
      name: urlItem.name,
      category: urlItem.cat,
      description: urlItem.desc,
      status: 'error',
      statusCode: 0,
      title: urlItem.name,
      reportUrl: null,
      timestamp: Date.now(),
      error: error.message
    };
  }
}

// Scanner toutes les URLs avec limite de concurrence
async function scanAllUrls(urls, concurrency = 2) {
  console.log(`🚀 Starting scan of ${urls.length} URLs with concurrency ${concurrency}`);
  
  const results = [];
  
  // Traiter par lots pour contrôler la concurrence
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    console.log(`📦 Processing batch ${Math.floor(i/concurrency) + 1}/${Math.ceil(urls.length/concurrency)}`);
    
    const batchPromises = batch.map(urlItem => scanUrl(urlItem));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Pause entre les batches pour respecter les limites de l'API
    if (i + concurrency < urls.length) {
      console.log('⏸️ Pausing between batches...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  return results;
}

// Fonction principale
async function main() {
  console.log('🎯 Status Monitor Scanner Starting...');
  console.log(`📊 Results will be saved to: ${RESULTS_FILE}`);
  
  try {
    // Parser les URLs
    const urls = parseBookmarksData();
    console.log(`📚 Found ${urls.length} URLs to scan`);
    
    // Scanner toutes les URLs
    const results = await scanAllUrls(urls);
    
    // Ajouter des métadonnées
    const scanData = {
      scanTime: new Date().toISOString(),
      totalUrls: urls.length,
      results: results,
      summary: {
        healthy: results.filter(r => r.status === 'healthy').length,
        warning: results.filter(r => r.status === 'warning').length,
        error: results.filter(r => r.status === 'error').length,
        unknown: results.filter(r => r.status === 'unknown').length
      }
    };
    
    // Sauvegarder les résultats
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(scanData, null, 2));
    
    console.log('✅ Scan completed successfully!');
    console.log(`📊 Summary: ${scanData.summary.healthy} healthy, ${scanData.summary.warning} warnings, ${scanData.summary.error} errors`);
    console.log(`💾 Results saved to: ${RESULTS_FILE}`);
    
  } catch (error) {
    console.error('❌ Fatal error during scan:', error.message);
    process.exit(1);
  }
}

// Gérer les signaux d'interruption
process.on('SIGINT', () => {
  console.log('\n🛑 Scan interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Scan terminated');
  process.exit(1);
});

// Démarrer le script
if (require.main === module) {
  main();
}

module.exports = { scanUrl, scanAllUrls, parseBookmarksData };
