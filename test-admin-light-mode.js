// Admin Light Mode Test Script
console.log('Testing admin light mode enforcement...');

// Function to test if admin container is in light mode
function testAdminLightMode() {
  const adminContainer = document.querySelector('[data-admin-theme-container]');
  
  if (!adminContainer) {
    console.log('❌ Admin container not found');
    return false;
  }
  
  // Check if light mode is applied
  const hasLightClass = adminContainer.classList.contains('admin-light');
  const noDarkClass = !adminContainer.classList.contains('admin-dark') && !adminContainer.classList.contains('dark');
  const lightColorScheme = window.getComputedStyle(adminContainer).colorScheme === 'light';
  
  console.log('🔍 Admin container classes:', adminContainer.className);
  console.log('🔍 Color scheme:', window.getComputedStyle(adminContainer).colorScheme);
  console.log('🔍 Background color:', window.getComputedStyle(adminContainer).backgroundColor);
  
  if (hasLightClass && noDarkClass && lightColorScheme) {
    console.log('✅ Admin panel is correctly in light mode!');
    return true;
  } else {
    console.log('❌ Admin panel is not in light mode');
    return false;
  }
}

// Test after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testAdminLightMode);
} else {
  testAdminLightMode();
}

// Export for manual testing
window.testAdminLightMode = testAdminLightMode;
