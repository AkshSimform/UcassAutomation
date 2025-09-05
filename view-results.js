const fs = require('fs');
const path = require('path');

const resultsDir = './allure-results';

console.log('=== ALLURE TEST RESULTS ===\n');

// Read all result files
const files = fs.readdirSync(resultsDir).filter(file => file.endsWith('-result.json'));

files.forEach(file => {
  const filePath = path.join(resultsDir, file);
  const result = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log(`Test: ${result.name}`);
  console.log(`Status: ${result.status}`);
  console.log(`Duration: ${result.stop - result.start}ms`);
  console.log(`Suite: ${result.labels?.find(l => l.name === 'suite')?.value || 'N/A'}`);
  
  if (result.statusDetails?.message) {
    console.log(`Error: ${result.statusDetails.message}`);
  }
  
  console.log('---\n');
});