const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const templatesDir = path.join(__dirname, '../src/components/templates');
const manifestPath = path.join(__dirname, '../src/config/template-manifest.json');

// Helper function to convert AST nodes to a JavaScript object
function astToObject(node) {
  if (!node) return null;

  switch (node.type) {
    case 'StringLiteral':
      return node.value;
    case 'NumericLiteral':
      return node.value;
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    case 'ObjectExpression':
      const obj = {};
      for (const prop of node.properties) {
        if (prop.type === 'ObjectProperty') {
          const key = prop.key.name || prop.key.value;
          obj[key] = astToObject(prop.value);
        }
      }
      return obj;
    case 'ArrayExpression':
      return node.elements.map(element => astToObject(element));
    default:
      return null; // Or handle other types as needed
  }
}

function getTemplateMetadata() {
  const manifest = {};
  const categories = fs.readdirSync(templatesDir);

  for (const category of categories) {
    const categoryPath = path.join(templatesDir, category);
    if (fs.statSync(categoryPath).isDirectory()) {
      const templateFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.tsx'));

      for (const file of templateFiles) {
        const filePath = path.join(categoryPath, file);
        try {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const ast = parser.parse(fileContent, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
          });

          traverse(ast, {
            ExportNamedDeclaration(path) {
              const declaration = path.node.declaration;
              if (declaration && declaration.type === 'VariableDeclaration') {
                for (const declarator of declaration.declarations) {
                  if (declarator.id.name === 'metadata') {
                    const metadata = astToObject(declarator.init);
                    if (metadata && metadata.id) {
                      manifest[metadata.id] = metadata;
                      console.log(`✓ Discovered template: ${metadata.name}`);
                    }
                  }
                }
              }
            },
          });
        } catch (error) {
          console.error(`✗ Failed to parse metadata from ${file}:`, error);
        }
      }
    }
  }
  return manifest;
}

console.log('🔍 Starting template discovery...');
const manifestData = getTemplateMetadata();

fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));
console.log(`\n✨ Template manifest generated successfully at ${manifestPath}`);
console.log(`   Found ${Object.keys(manifestData).length} templates.`);
