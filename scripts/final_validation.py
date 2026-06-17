import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_endpoint(name, path, payload):
    print(f"\n--- TESTING {name} ({path}) ---")
    try:
        response = requests.post(f"{BASE_URL}{path}", json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"SUCCESS: {name} returned 200")
            # print(json.dumps(data, indent=2)[:500] + "...")
            return data
        else:
            print(f"FAILED: {name} returned {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"ERROR: {name} - {e}")
        return None

def run_full_suite():
    # 1. Health Check
    print("\n--- HEALTH CHECK ---")
    try:
        h = requests.get(f"{BASE_URL}/")
        print(f"Status: {h.status_code}, Body: {h.text}")
    except:
        print("Backend not reachable yet...")
        time.sleep(5)

    # 2. Multi-turn AI Assessment (The Core)
    case_state = {
        "currentSituation": "",
        "primaryConcern": "",
        "riskLevel": "medium",
        "identifiedNeeds": [],
        "answeredQuestions": [],
        "currentStep": 1,
        "assessmentData": {}
    }
    history = []

    print("\n--- STARTING AI-DRIVEN CONVERSATION ---")
    
    # Turn 1
    t1_msg = "I lost my job and I have no food for tomorrow."
    data1 = test_endpoint("Assessment Turn 1", "/api/assess", {
        "userMessage": t1_msg,
        "history": history,
        "caseState": case_state
    })
    
    if data1:
        print(f"AI Acknowledgment: {data1['acknowledgment']}")
        print(f"AI Response: {data1['response']}")
        print(f"AI Next Questions: {data1['nextQuestions']}")
        print(f"Extracted Facts: {json.dumps(data1['updatedCaseState']['assessmentData'], indent=2)}")
        
        # Update for Turn 2
        case_state = data1['updatedCaseState']
        history.append({"role": "user", "content": t1_msg})
        history.append({"role": "assistant", "content": data1['response']})
        
        # Turn 2: Providing specific info requested or extra info
        t2_msg = "I stay alone in a small apartment in Kozhikode."
        data2 = test_endpoint("Assessment Turn 2", "/api/assess", {
            "userMessage": t2_msg,
            "history": history,
            "caseState": case_state
        })
        
        if data2:
            print(f"AI Response: {data2['response']}")
            print(f"Extracted Facts: {json.dumps(data2['updatedCaseState']['assessmentData'], indent=2)}")
            case_state = data2['updatedCaseState']

    # 3. Programs
    test_endpoint("Programs", "/api/programs", {
        "situation": case_state.get('currentSituation', "I lost my job and have no food"),
        "answers": {"Have you eaten today?": "No"}
    })

    # 4. Recovery Plan
    test_endpoint("Recovery Plan", "/api/recovery-plan", {
        "situation": case_state.get('currentSituation', "I lost my job and have no food")
    })

    # 5. Document Insights
    test_endpoint("Document Insights", "/api/document-insights", {
        "resumeText": "Experienced factory worker with 5 years in logistics. Certified forklift operator."
    })

if __name__ == "__main__":
    time.sleep(5) # Wait for backend
    run_full_suite()
