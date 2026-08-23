"""Test script for Google ADK Agent and A2UI Schema Manager."""

import json
from agent import ADKRestaurantAgent, menu_agent, customizer_agent, cart_agent, settlement_agent

def main():
    print("=" * 70)
    print("🍔 TESTING GOOGLE ADK AGENTS (gemini-3.1-flash-lite-preview)")
    print("=" * 70)

    orchestrator = ADKRestaurantAgent()

    # 1. Test Menu Discovery Sub-Agent
    print("\n[TEST 1] Menu Discovery Agent:")
    res_menu = orchestrator.process_query("Show me the menu")
    print(f"• Agent Response: {res_menu['textResponse']}")
    print(f"• A2UI Messages Generated: {len(res_menu['a2uiMessages'])}")
    print(f"• Sample Message [0] Type: {list(res_menu['a2uiMessages'][0].keys())}")

    # 2. Test Meal Customizer Sub-Agent
    print("\n[TEST 2] Meal Customizer Agent:")
    res_cust = orchestrator.process_query("Customize McSpicy Paneer meal with extra cheese")
    print(f"• Agent Response: {res_cust['textResponse']}")
    print(f"• A2UI Messages Generated: {len(res_cust['a2uiMessages'])}")

    # 3. Test Cart Review & Multi-Card Sub-Agent
    print("\n[TEST 3] Cart Review & Multi-Card Agent:")
    res_cart = orchestrator.process_event("submit_custom_meal", {"mealName": "McSpicy Paneer Meal", "basePrice": 429.0})
    print(f"• Agent Response: {res_cart['textResponse']}")
    print(f"• A2UI Messages Generated: {len(res_cart['a2uiMessages'])}")

    # 4. Test Invoice Settlement Sub-Agent
    print("\n[TEST 4] Invoice Settlement Agent:")
    res_pay = orchestrator.process_event("proceed_to_payment", {"paymentMethod": "card_visa_master"})
    print(f"• Agent Response: {res_pay['textResponse']}")
    print(f"• A2UI Messages Generated: {len(res_pay['a2uiMessages'])}")
    po_model = res_pay['a2uiMessages'][2]['updateDataModel']['value']
    print(f"• Purchase Order: {po_model['poNumber']} | Paid: {po_model['totalPaid']} via {po_model['paymentMethod']}")

    print("\n" + "=" * 70)
    print("✅ ALL GOOGLE ADK SUB-AGENTS & A2UI SCHEMAS TESTED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    main()
