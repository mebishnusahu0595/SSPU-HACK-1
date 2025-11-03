"""
Test script for FarmView AI
Run basic tests to verify the system is working
"""
import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"

# Test data
TEST_FIELD = {
    "farmer_id": f"TEST_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
    "crop": "Rice",
    "coordinates": [
        [81.6542, 21.2234],
        [81.6555, 21.2241],
        [81.6571, 21.2237],
        [81.6560, 21.2229],
        [81.6542, 21.2234]  # Close the polygon
    ],
    "insured_amount": 500000
}


def print_section(title):
    """Print a section header"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def test_health_check():
    """Test 1: Health check"""
    print_section("TEST 1: Health Check")
    
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API is healthy!")
            print(f"   Version: {data.get('version')}")
            print(f"   Status: {data.get('status')}")
            return True
        else:
            print("❌ Health check failed")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("   Make sure the API server is running!")
        return False


def test_register_field():
    """Test 2: Register field"""
    print_section("TEST 2: Register Field")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/register-field",
            json=TEST_FIELD
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Field registered successfully!")
            print(f"   Field ID: {data.get('field_id')}")
            print(f"   Area: {data.get('area_hectares')} hectares")
            return True, data
        else:
            print(f"❌ Registration failed: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False, None


def test_get_field(farmer_id):
    """Test 3: Get field information"""
    print_section("TEST 3: Get Field Information")
    
    try:
        response = requests.get(f"{BASE_URL}/api/field/{farmer_id}")
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Field information retrieved!")
            print(f"   Farmer ID: {data.get('farmer_id')}")
            print(f"   Crop: {data.get('crop')}")
            print(f"   Area: {data.get('area_hectares')} ha")
            return True
        else:
            print(f"❌ Failed to get field: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_analyze_field():
    """Test 4: Analyze field (WARNING: Takes 30-60 seconds)"""
    print_section("TEST 4: Analyze Field")
    print("⚠️  Note: This test requires:")
    print("   - Valid Sentinel Hub API credentials")
    print("   - Will take 30-60 seconds to complete")
    print("   - Fetches real satellite imagery")
    
    proceed = input("\nProceed with analysis test? (y/n): ")
    
    if proceed.lower() != 'y':
        print("⏭️  Skipping analysis test")
        return False
    
    try:
        print("\n🛰️  Fetching satellite imagery and analyzing...")
        print("   Please wait...")
        
        response = requests.post(
            f"{BASE_URL}/api/analyze-field",
            json=TEST_FIELD,
            timeout=120  # 2 minute timeout
        )
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Analysis completed successfully!")
            print(f"   Analysis ID: {data.get('analysis_id')}")
            print(f"   Damage: {data.get('damage_percent'):.1f}%")
            print(f"   Risk Score: {data.get('risk_score'):.1f}/10")
            print(f"   Damaged Area: {data.get('damaged_area_hectares'):.2f} ha")
            print(f"   Report URL: {data.get('report_url')}")
            
            if data.get('estimated_claim'):
                print(f"   Estimated Claim: ₹{data.get('estimated_claim'):,.2f}")
            
            return True
        else:
            print(f"❌ Analysis failed: {response.text}")
            return False
            
    except requests.Timeout:
        print("❌ Request timed out")
        print("   Analysis may still be processing on server")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_dashboard_stats():
    """Test 5: Dashboard statistics"""
    print_section("TEST 5: Dashboard Statistics")
    
    try:
        response = requests.get(f"{BASE_URL}/api/dashboard-stats")
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Dashboard stats retrieved!")
            print(f"   Total Fields: {data.get('total_fields')}")
            print(f"   Total Analyses: {data.get('total_analyses')}")
            print(f"   Recent Analyses: {data.get('recent_analyses')}")
            return True
        else:
            print(f"❌ Failed to get stats: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def run_all_tests():
    """Run all tests"""
    print("\n" + "🌾" * 30)
    print("   FarmView AI - Test Suite")
    print("🌾" * 30)
    
    results = []
    
    # Test 1: Health check
    results.append(("Health Check", test_health_check()))
    
    if not results[0][1]:
        print("\n❌ Cannot proceed - API server is not running!")
        print("   Start the server with: python main.py")
        return
    
    # Test 2: Register field
    success, data = test_register_field()
    results.append(("Register Field", success))
    
    if success and data:
        farmer_id = TEST_FIELD["farmer_id"]
        
        # Test 3: Get field
        results.append(("Get Field", test_get_field(farmer_id)))
        
        # Test 4: Analyze field (optional)
        results.append(("Analyze Field", test_analyze_field()))
    
    # Test 5: Dashboard stats
    results.append(("Dashboard Stats", test_dashboard_stats()))
    
    # Summary
    print_section("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
    else:
        print("\n⚠️  Some tests failed. Check the output above.")


if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
