#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api/v1"
TOTAL_TESTS=0
PASSED_TESTS=0

echo -e "${BLUE}🚀 LogisticsPricer API - Test Suite${NC}"
echo "=================================="
echo ""

# Function to run test
run_test() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${YELLOW}📋 Test $TOTAL_TESTS: $test_name${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    # Extract status code (last 3 characters)
    status_code="${response: -3}"
    # Extract response body (everything except last 3 characters)
    response_body="${response%???}"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "  ${GREEN}✅ PASSED${NC} (Status: $status_code)"
        echo -e "  Response: ${response_body:0:100}..."
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ${RED}❌ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        echo -e "  Response: ${response_body:0:100}..."
    fi
    echo ""
}

# Wait for server to be ready
echo -e "${BLUE}⏳ Waiting for server to be ready...${NC}"
sleep 3

# Test 1: API Info
run_test "API principale" "GET" "/" "" "200"

# Test 2: Calculate Price
run_test "Calcolo prezzo" "POST" "/pricing/calculate" '{"origin":"IT","destination":"DE","weight":100,"volume":0.5,"transportType":"road"}' "200"

# Test 3: Search HS Codes
run_test "Ricerca codici HS" "GET" "/tariffs/hs-codes?query=smartphone" "" "200"

# Test 4: Calculate Duties
run_test "Calcolo dazi" "POST" "/tariffs/calculate" '{"originCountry":"CN","destinationCountry":"US","hsCode":"8517.13.00","productValue":1000,"transportType":"sea"}' "200"

# Test 5: Get Shipping Routes
run_test "Rotte di spedizione" "GET" "/shipping/routes?originCountry=CN&destinationCountry=US" "" "200"

# Test 6: Calculate Transit Time
run_test "Tempo di transito" "POST" "/shipping/calculate-transit" '{"origin":"CN","destination":"US","transportType":"sea","productType":"electronics","urgency":"standard"}' "200"

# Test 7: Get Required Documents
run_test "Documenti richiesti" "GET" "/shipping/documents?originCountry=CN&destinationCountry=US&productType=electronics&transportType=sea&value=5000" "" "200"

# Test 8: Check Restrictions
run_test "Restrizioni di spedizione" "GET" "/shipping/restrictions?originCountry=CN&destinationCountry=US&productType=electronics&hsCode=8517.13.00" "" "200"

# Test 9: Validate Route
run_test "Validazione rotta" "POST" "/shipping/validate-route" '{"originCountry":"CN","destinationCountry":"US","transportType":"sea","productType":"electronics"}' "200"

# Test 10: Validation Error
run_test "Validazione errori" "POST" "/pricing/calculate" '{"origin":"IT"}' "400"

# Test 11: Complete Calculation with Duties
run_test "Calcolo completo con dazi" "POST" "/pricing/calculate" '{"origin":"CN","destination":"US","weight":50,"volume":0.2,"transportType":"sea","hsCode":"8517.13.00","productValue":2000}' "200"

# Summary
echo "=================================="
echo -e "${BLUE}📊 TEST SUMMARY${NC}"
echo "=================================="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$((TOTAL_TESTS - PASSED_TESTS))${NC}"
echo ""

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    exit 1
fi 