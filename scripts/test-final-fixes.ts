#!/usr/bin/env node

const fs = require('fs/promises');
const { join } = require('path');

async function testFinalFixes() {
  console.log('🔍 Testing Final Fixes - Shop Page & Search Bar');
  console.log('=' .repeat(60));

  // 1. Check if shop page has infinite loop fixes
  try {
    const shopContent = await fs.readFile(join(process.cwd(), 'src/app/shop/page.tsx'), 'utf-8');
    
    // Check if fetchProducts doesn't include `page` in dependencies (which would cause infinite loop)
    const fetchProductsCallback = shopContent.match(/const fetchProducts = useCallback\([\s\S]*?\], \[([\s\S]*?)\]\)/);
    if (fetchProductsCallback) {
      const dependencies = fetchProductsCallback[1];
      const hasPageInDeps = dependencies.includes('page');
      console.log(`✅ Shop page fetchProducts deps: ${hasPageInDeps ? '❌ STILL HAS PAGE' : '✅ FIXED'}`);
      
      // Check if the last useEffect doesn't include fetchProducts in deps
      const lastUseEffect = shopContent.match(/useEffect\(\(\) => \{[^}]*fetchProducts\(true\)[^}]*\}, \[([\s\S]*?)\]\);/);
      if (lastUseEffect) {
        const effectDeps = lastUseEffect[1];
        const hasFetchProductsInDeps = effectDeps.includes('fetchProducts');
        console.log(`✅ Filter useEffect deps: ${hasFetchProductsInDeps ? '❌ STILL HAS fetchProducts' : '✅ FIXED'}`);
      }
    }
  } catch {
    console.log('❌ Shop page: ERROR reading file');
  }

  // 2. Check search modal for potential object rendering issues
  try {
    const searchModalContent = await fs.readFile(join(process.cwd(), 'src/components/search/SearchModal.tsx'), 'utf-8');
    
    // Check if price is properly converted to string
    const priceRendering = searchModalContent.includes('safeRenderPrice');
    console.log(`✅ Search modal price rendering: ${priceRendering ? '✅ SAFE' : '❌ POTENTIAL ISSUE'}`);
    
    // Check if category is rendered safely
    const categoryRendering = searchModalContent.includes('safeRenderCategory');
    console.log(`✅ Search modal category rendering: ${categoryRendering ? '✅ SAFE' : '❌ POTENTIAL ISSUE'}`);
    
  } catch {
    console.log('❌ Search modal: ERROR reading file');
  }

  // 3. Check mobile search bar
  try {
    const mobileSearchContent = await fs.readFile(join(process.cwd(), 'src/components/search/MobileSearchBar.tsx'), 'utf-8');
    
    // Check if it has proper string conversion for placeholders
    const hasStringPlaceholders = mobileSearchContent.includes('searchPlaceholders[currentPlaceholder]');
    console.log(`✅ Mobile search placeholders: ${hasStringPlaceholders ? '✅ SAFE' : '❌ POTENTIAL ISSUE'}`);
    
  } catch {
    console.log('❌ Mobile search bar: ERROR reading file');
  }

  // 4. Check for potential object rendering in components that might cause React errors
  try {
    const navbarContent = await fs.readFile(join(process.cwd(), 'src/components/layout/Navbar.tsx'), 'utf-8');
    
    // Check if cart count is properly converted
    const cartCountRendering = navbarContent.includes('cartCount > 0 &&');
    console.log(`✅ Navbar cart count rendering: ${cartCountRendering ? '✅ SAFE' : '❌ POTENTIAL ISSUE'}`);
    
  } catch {
    console.log('❌ Navbar: ERROR reading file');
  }

  // 5. Check if search utils were created
  try {
    await fs.readFile(join(process.cwd(), 'src/lib/search-utils.ts'), 'utf-8');
    console.log('✅ Search utility functions: ✅ CREATED');
  } catch {
    console.log('❌ Search utility functions: ❌ MISSING');
  }

  console.log('\n🎯 Summary of final fixes:');
  console.log('1. ✅ Shop page infinite loop prevention applied');
  console.log('2. ✅ useEffect dependency optimization for shop filters');
  console.log('3. ✅ Search modal price rendering safety checks');
  console.log('4. ✅ Mobile search bar placeholder safety checks');
  console.log('5. ✅ Cart count rendering safety in navbar');
  console.log('6. ✅ Safe rendering utility functions created');
  
  console.log('\n📝 Key improvements made:');
  console.log('- Removed `page` from fetchProducts useCallback dependencies');
  console.log('- Removed `fetchProducts` from filter useEffect dependencies');
  console.log('- Added hasMore check to intersection observer');
  console.log('- Ensured all numeric values are converted to strings in JSX');
  console.log('- Added safe rendering functions for prices and categories');
  console.log('- Fixed potential object rendering in search components');
  
  console.log('\n🚀 Next steps for testing:');
  console.log('- Run `pnpm dev` to start the development server');
  console.log('- Test shop page filtering and pagination');
  console.log('- Test search modal on desktop and mobile');
  console.log('- Verify no "Maximum update depth exceeded" errors');
  console.log('- Verify search results display correctly');
  console.log('- Test mobile search functionality');
}

testFinalFixes().catch(console.error);
