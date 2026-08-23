import json
import os
from typing import List, Dict, Any, Optional

DATA_PATH = os.path.join(os.path.dirname(__file__), "restaurant_data.json")

def load_restaurant_data() -> Dict[str, Any]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def query_menu_database(
    query: Optional[str] = None,
    category: Optional[str] = None,
    veg_only: Optional[bool] = None,
    max_price: Optional[float] = None,
) -> List[Dict[str, Any]]:
    """Queries McDonald's India meal catalog with multi-field filtering."""
    data = load_restaurant_data()
    meals = data.get("meals", [])
    results = []

    q_lower = query.lower() if query else ""

    for meal in meals:
        if veg_only is True and not meal.get("isVeg", False):
            continue
        if category and meal.get("category") != category:
            continue
        if max_price is not None and meal.get("price", 0) > max_price:
            continue
        if q_lower:
            name_match = q_lower in meal.get("name", "").lower()
            desc_match = q_lower in meal.get("description", "").lower()
            tag_match = any(q_lower in tag.lower() for tag in meal.get("tags", []))
            if not (name_match or desc_match or tag_match):
                continue
        results.append(meal)

    return results if results else meals

def get_meal_details(meal_id_or_name: str) -> Optional[Dict[str, Any]]:
    """Retrieves full details for a specific McDonald's meal."""
    data = load_restaurant_data()
    meals = data.get("meals", [])
    target = meal_id_or_name.lower().strip()

    for meal in meals:
        if meal["id"].lower() == target or target in meal["name"].lower():
            return meal
    return meals[0] if meals else None

def get_customization_options() -> Dict[str, Any]:
    """Fetches valid Indian McDonald's upsize sizes, beverages, and add-on options."""
    data = load_restaurant_data()
    return data.get("customizations", {})

def get_available_payment_methods() -> List[Dict[str, Any]]:
    """Fetches all supported card, UPI, and digital wallet payment options."""
    data = load_restaurant_data()
    return data.get("payment_options", [])

def calculate_tray_totals(
    items: Optional[List[Dict[str, Any]]] = None,
    dining_mode: str = "dine_in",
    payment_method: str = "card_visa_master",
) -> Dict[str, Any]:
    """Calculates itemized subtotal, 5% Restaurant GST (2.5% CGST + 2.5% SGST), and grand total."""
    data = load_restaurant_data()
    restaurant = data.get("restaurant", {})

    if not items or len(items) == 0:
        items = [
            {
                "name": "McSpicy™ Paneer Meal (Large)",
                "price": 429.00,
                "customSummary": "Large Piri Piri Fries + Thums Up • Extra Cheese Slice",
            },
            {
                "name": "McAloo Tikki™ Value Meal",
                "price": 179.00,
                "customSummary": "Medium Fries + Sprite • Sweet Tomato Mayo",
            },
            {
                "name": "Veg Pizza McPuff™ (2 pcs)",
                "price": 100.00,
                "customSummary": "Crispy pastry with mozzarella & vegetables",
            },
        ]

    subtotal = sum(float(i.get("price", 0)) for i in items)
    cgst = round(subtotal * 0.025, 2)
    sgst = round(subtotal * 0.025, 2)
    total = round(subtotal + cgst + sgst, 2)

    return {
        "store": restaurant,
        "items": items,
        "subtotal": subtotal,
        "subtotalText": f"₹{subtotal:.2f}",
        "cgst": cgst,
        "cgstText": f"₹{cgst:.2f}",
        "sgst": sgst,
        "sgstText": f"₹{sgst:.2f}",
        "total": total,
        "totalText": f"₹{total:.2f}",
        "dining_mode": dining_mode,
        "dining_mode_text": "🍽️ Dine-In (Table Tent #12)" if dining_mode == "dine_in" else "🛍️ Takeaway / Parcel",
        "payment_method": payment_method,
    }

def generate_purchase_order_invoice(
    order_id: str = "88",
    payment_method_id: str = "card_visa_master",
    table_tent: str = "12",
) -> Dict[str, Any]:
    """Generates official McDonald's India GST Tax Invoice and Order Pickup Token."""
    tray_summary = calculate_tray_totals()
    payment_options = get_available_payment_methods()

    selected_pm = next((pm for pm in payment_options if pm["id"] == payment_method_id), payment_options[0])

    return {
        "po_number": f"TOKEN # {order_id}",
        "invoice_number": f"GST-MCD-2026-{order_id}",
        "timestamp": "Today • GSTIN: 27AAACM0000A1Z5",
        "store_info": "McDonald's India (Hardcastle Restaurants) #1042",
        "table_tent": f"Table Service: Tent #{table_tent}",
        "dining_mode": tray_summary["dining_mode_text"],
        "payment_method_label": selected_pm["label"],
        "total_paid": tray_summary["totalText"],
        "items": [
            { "name": f"1x {i['name']} ({i.get('customSummary', '')})", "price": f"₹{float(i['price']):.2f}" }
            for i in tray_summary["items"]
        ] + [
            { "name": "GST (5% Total: CGST 2.5% + SGST 2.5%)", "price": f"₹{tray_summary['cgst'] + tray_summary['sgst']:.2f}" }
        ]
    }
