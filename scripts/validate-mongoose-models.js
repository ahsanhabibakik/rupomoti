#!/usr/bin/env node

/**
 * Mongoose Schema Validation Script
 * 
 * This script checks all models to ensure they have proper:
 * - Timestamps
 * - Virtual ID fields
 * - Proper exports
 * - Proper TypeScript types
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Handle ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const modelsDir = path.join(__dirname, '..', 'src', 'models');
const outputPath = path.join(__dirname, '..', 'mongoose-validation-report.md');

// Read all model files
async function validateModels() {
  console.log('🔍 Validating Mongoose models...');
  
  let report = '# Mongoose Model Validation Report\n\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  try {
    const files = fs.readdirSync(modelsDir);
    const modelFiles = files.filter(file => 
      file.endsWith('.ts') && 
      !file.includes('.test.') && 
      !file.includes('.spec.') &&
      !file.endsWith('.d.ts')
    );
    
    report += `Found ${modelFiles.length} model files to validate\n\n`;
    
    for (const file of modelFiles) {
      const filePath = path.join(modelsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const modelName = file.replace('.ts', '');
      
      report += `## ${modelName}\n\n`;
      
      // Check for Schema definition
      const hasSchema = content.includes('new Schema(') || content.includes('new mongoose.Schema(');
      report += `- Schema definition: ${hasSchema ? '✅' : '❌'}\n`;
      
      // Check for timestamps
      const hasTimestamps = content.includes('timestamps: true');
      report += `- Timestamps: ${hasTimestamps ? '✅' : '❌'}\n`;
      
      // Check for virtuals
      const hasVirtualsEnabled = content.includes('toJSON: { virtuals: true }') || 
                              content.includes('virtuals: true');
      report += `- Virtual fields enabled: ${hasVirtualsEnabled ? '✅' : '❌'}\n`;
      
      // Check for ID virtual specifically
      const hasIdVirtual = content.includes('.virtual(\'id\')');
      report += `- ID virtual: ${hasIdVirtual ? '✅' : '❌'}\n`;
      
      // Check for TypeScript interface
      const hasInterface = content.includes('interface I') || 
                        content.includes('interface ' + modelName);
      report += `- TypeScript interface: ${hasInterface ? '✅' : '❌'}\n`;
      
      // Check for proper model export
      const hasProperExport = content.includes('export default') && 
                           (content.includes('mongoose.model(') || content.includes('mongoose.models.'));
      report += `- Proper export: ${hasProperExport ? '✅' : '❌'}\n`;
      
      // Check for indexes
      const hasIndexes = content.includes('index: true');
      report += `- Indexes defined: ${hasIndexes ? '✅' : '❌'}\n`;
      
      // Overall status
      const criticalChecks = [hasSchema, hasTimestamps, hasProperExport];
      const allCriticalPassed = criticalChecks.every(check => check);
      const allChecks = [hasSchema, hasTimestamps, hasVirtualsEnabled, hasIdVirtual, hasInterface, hasProperExport];
      const allPassed = allChecks.every(check => check);
      
      report += `\n**Status**: ${allPassed ? '✅ Perfect' : allCriticalPassed ? '⚠️ Acceptable with warnings' : '❌ Needs fixes'}\n\n`;
      
      // Recommendations if needed
      if (!allPassed) {
        report += '**Recommendations:**\n\n';
        
        if (!hasTimestamps) {
          report += '- Add `timestamps: true` to schema options\n';
        }
        
        if (!hasVirtualsEnabled) {
          report += '- Add `toJSON: { virtuals: true }, toObject: { virtuals: true }` to schema options\n';
        }
        
        if (!hasIdVirtual) {
          report += '- Add an ID virtual: `schema.virtual(\'id\').get(function() { return this._id.toHexString(); })`\n';
        }
        
        if (!hasInterface) {
          report += '- Define a TypeScript interface for the model\n';
        }
        
        if (!hasIndexes) {
          report += '- Consider adding indexes for frequently queried fields\n';
        }
        
        report += '\n';
      }
    }
    
    // Write the report
    fs.writeFileSync(outputPath, report);
    console.log(`✅ Validation complete. Report saved to ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error validating models:', error);
  }
}

// Run the validation
validateModels();
