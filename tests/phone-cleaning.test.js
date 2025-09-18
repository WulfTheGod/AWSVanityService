function cleanPhoneNumber(phoneNumber) {
    const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');

    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
        return digitsOnly.substring(1);
    }

    return digitsOnly;
}

// Test runner helper
function runTest(description, input, expected) {
    const result = cleanPhoneNumber(input);
    const passed = result === expected;

    console.log(`${passed ? '✅' : '❌'} ${description}`);
    console.log(`   Input:    "${input}"`);
    console.log(`   Expected: "${expected}"`);
    console.log(`   Got:      "${result}"`);

    if (!passed) {
        console.log(`   ❌ FAILED: Expected "${expected}" but got "${result}"`);
    }
    console.log('');

    return passed;
}

console.log('🧪 Phone Number Cleaning Test Suite\n');

let passedTests = 0;
let totalTests = 0;

// Test 1: Amazon Connect format
totalTests++;
if (runTest('Amazon Connect format', '+15551234567', '5551234567')) passedTests++;

// Test 2: Common US format with parentheses
totalTests++;
if (runTest('US format with parentheses', '(555) 123-4567', '5551234567')) passedTests++;

// Test 3: Dash format
totalTests++;
if (runTest('Dash format', '555-123-4567', '5551234567')) passedTests++;

// Test 4: Dot format
totalTests++;
if (runTest('Dot format', '555.123.4567', '5551234567')) passedTests++;

// Test 5: Already clean
totalTests++;
if (runTest('Already clean digits', '5551234567', '5551234567')) passedTests++;

// Test 6: With spaces
totalTests++;
if (runTest('Format with spaces', '+1 555 123 4567', '5551234567')) passedTests++;

// Test 7: Country code with dashes
totalTests++;
if (runTest('Country code with dashes', '1-555-123-4567', '5551234567')) passedTests++;

// Test 8: Edge case - no country code, already 10 digits
totalTests++;
if (runTest('No country code needed', '5551234567', '5551234567')) passedTests++;

// Summary
console.log('📊 Test Results:');
console.log(`   Passed: ${passedTests}/${totalTests}`);
console.log(`   Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);

if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Phone cleaning function works correctly.');
} else {
    console.log('\n⚠️  Some tests failed. Review the function logic.');
}