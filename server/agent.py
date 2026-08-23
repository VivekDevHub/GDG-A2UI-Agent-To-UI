import os
import sys
import json
import logging
from typing import Dict, Any, List, Optional

# Ensure server directory is in sys.path for adk web import loader
_server_dir = os.path.dirname(os.path.abspath(__file__))
if _server_dir not in sys.path:
    sys.path.insert(0, _server_dir)

from dotenv import load_dotenv
load_dotenv(os.path.join(_server_dir, ".env"))
if os.getenv("GEMINI_API_KEY") and not os.getenv("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

# Official Google ADK Imports (https://adk.dev/)
from google.adk.agents import Agent

try:
    from a2ui_schema_manager import A2uiSchemaManager
    from tools import (
        query_menu_database,
        get_meal_details,
        get_customization_options,
        get_available_payment_methods,
        calculate_tray_totals,
        generate_purchase_order_invoice,
    )
    from prompt_builder import get_system_prompt
except ImportError:
    from server.a2ui_schema_manager import A2uiSchemaManager
    from server.tools import (
        query_menu_database,
        get_meal_details,
        get_customization_options,
        get_available_payment_methods,
        calculate_tray_totals,
        generate_purchase_order_invoice,
    )
    from server.prompt_builder import get_system_prompt

logger = logging.getLogger(__name__)

# =====================================================================
# 1. A2UI Schema Manager Initialization
# =====================================================================
schema_manager = A2uiSchemaManager(
    version="0.9",
    catalogs=["https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"],
)

# =====================================================================
# 2. Official Google ADK Specialist Agents (https://adk.dev/)
# =====================================================================
menu_agent = Agent(
    name="menu_discovery",
    model=os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite-preview"),
    instruction="You help customers discover McDonald's India Extra Value Meals and burgers with dietary filtering.",
    tools=[query_menu_database],
)

customizer_agent = Agent(
    name="meal_customizer",
    model=os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite-preview"),
    instruction="You help customers customize burgers with Piri Piri fries, cheese slices, and Indian beverages.",
    tools=[get_meal_details, get_customization_options],
)

cart_agent = Agent(
    name="cart_and_payment",
    model=os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite-preview"),
    instruction="You manage the Kiosk tray, 5% GST calculations (CGST + SGST), and multiple card payment selections.",
    tools=[calculate_tray_totals, get_available_payment_methods],
)

settlement_agent = Agent(
    name="invoice_settlement",
    model=os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite-preview"),
    instruction="You finalize payments (Cards, UPI, Apple Pay) and generate official GST Tax Invoices and Pickup Tokens.",
    tools=[generate_purchase_order_invoice],
)

# Root agent for Google ADK runtime
root_agent = Agent(
    name="mcdonalds_kiosk_orchestrator",
    model=os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite-preview"),
    instruction="You are the master McDonald's India Kiosk Assistant coordinating menu discovery, customizers, and checkout.",
    sub_agents=[menu_agent, customizer_agent, cart_agent, settlement_agent],
    tools=[query_menu_database, calculate_tray_totals, generate_purchase_order_invoice],
)

# =====================================================================
# 3. Master Kiosk Orchestrator Bridge for A2UI Protocol
# =====================================================================
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

class ADKRestaurantAgent:
    """Master Orchestrator Agent delegating tasks to Google ADK Specialist Agents with live Gemini generation."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        self.schema_manager = schema_manager
        self.root_agent = root_agent
        self.menu_agent = menu_agent
        self.customizer_agent = customizer_agent
        self.cart_agent = cart_agent
        self.settlement_agent = settlement_agent
        
        # Initialize Google ADK Runner & Session
        self.session_service = InMemorySessionService()
        self.runner = Runner(agent=root_agent, session_service=self.session_service, app_name="mcdonalds_kiosk")
        self.session_id: Optional[str] = None

    async def generate_conversational_text(self, prompt: str) -> Optional[str]:
        """Generates live conversational response from the Google ADK Agent using Gemini."""
        try:
            if not self.session_id:
                session = await self.session_service.create_session(app_name="mcdonalds_kiosk", user_id="customer")
                self.session_id = session.id
            
            content = types.Content(role="user", parts=[types.Part.from_text(text=prompt)])
            text_parts = []
            async for event in self.runner.run_async(user_id="customer", session_id=self.session_id, new_message=content):
                if hasattr(event, "content") and event.content:
                    for part in getattr(event.content, "parts", []):
                        if getattr(part, "text", None):
                            text_parts.append(part.text)
            
            generated = "".join(text_parts).strip()
            return generated if generated else None
        except Exception as e:
            logger.warning("ADK Live generation fallback: %s", e)
            return None

    async def handle_message(
        self,
        message: Optional[str] = None,
        event_name: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Unified entry point handling conversational queries and UI actions without ambiguity."""
        context = context or {}
        
        if event_name == "open_customizer" or (message and any(k in message.lower() for k in ["custom", "paneer", "piri", "spicy", "maharaja"])):
            meal_name = context.get("mealName", "McSpicy Paneer Meal")
            base_res = self._build_customizer_response(meal_name)
            prompt = f"Customer wants to customize {meal_name}. Briefly introduce the customization options and beverages in 1-2 friendly sentences."
        elif event_name in ["add_to_order", "submit_custom_meal"] or (message and any(k in message.lower() for k in ["cart", "tray", "review"])):
            base_res = self._build_cart_response()
            prompt = "Customer added items to tray. Briefly tell them their tray is ready for review and multi-card payment."
        elif event_name == "proceed_to_payment" or (message and any(k in message.lower() for k in ["pay", "card", "upi", "receipt", "invoice", "checkout"])):
            pm = str(context.get("paymentMethod", "card_visa_master"))
            base_res = self._build_settlement_response(pm)
            prompt = f"Payment approved via {pm}. Congratulate the customer, confirm their Tax Invoice, and let them know Order Token #88 is in the kitchen."
        elif event_name == "start_new_order":
            base_res = self._build_menu_response()
            prompt = "Customer started a new order. Greet them warmly and present the McDonald's India menu."
        else:
            base_res = self._build_menu_response(message or "")
            prompt = message or "Customer is viewing the McDonald's India menu. Welcome them warmly."

        # Fetch actual live conversational response from the Google ADK Agent
        llm_text = await self.generate_conversational_text(prompt)
        if llm_text:
            base_res["textResponse"] = llm_text

        return base_res

    def process_query(self, query: str) -> Dict[str, Any]:
        """Synchronous helper for CLI testing."""
        q = query.lower()
        if "custom" in q or "paneer" in q or "piri" in q or "spicy" in q or "maharaja" in q or "thums" in q:
            return self._build_customizer_response("McSpicy Paneer Meal")
        elif "cart" in q or "tray" in q or "review" in q:
            return self._build_cart_response()
        elif "pay" in q or "card" in q or "upi" in q or "receipt" in q or "invoice" in q or "token" in q or "checkout" in q:
            return self._build_settlement_response("card_visa_master")
        else:
            return self._build_menu_response(query)

    def process_event(self, event_name: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Synchronous helper for CLI testing."""
        if event_name == "open_customizer":
            meal_name = context.get("mealName", "McSpicy Paneer Meal")
            return self._build_customizer_response(meal_name=meal_name)
        elif event_name in ["add_to_order", "submit_custom_meal"]:
            return self._build_cart_response()
        elif event_name == "proceed_to_payment":
            pm = context.get("paymentMethod", "card_visa_master")
            return self._build_settlement_response(payment_method_id=str(pm))
        elif event_name == "start_new_order":
            return self._build_menu_response()

        return {
            "textResponse": f"Handled Kiosk event: {event_name}",
            "a2uiMessages": [],
        }

    def _build_menu_response(self, query: str = "") -> Dict[str, Any]:
        veg_only = True if "veg" in query.lower() and "non" not in query.lower() else None
        meals = query_menu_database(query=query if query != "Show me the McDonald's menu" else None, veg_only=veg_only)

        components = [
            { "id": "root", "component": "Column", "children": ["header-row", "subtitle", "meals-list"] },
            { "id": "header-row", "component": "Row", "justify": "spaceBetween", "children": ["brand-title", "badge-text"] },
            { "id": "brand-title", "component": "Text", "variant": "h1", "text": { "path": "/brandTitle" } },
            { "id": "badge-text", "component": "Text", "variant": "caption", "text": "Kiosk #04 Active" },
            { "id": "subtitle", "component": "Text", "variant": "body", "text": { "path": "/subtitle" } },
            { "id": "meals-list", "component": "List", "children": { "componentId": "meal-card", "path": "/meals" } },
            { "id": "meal-card", "component": "Card", "child": "meal-col" },
            { "id": "meal-col", "component": "Column", "children": ["m-img", "m-header", "m-desc", "m-actions"] },
            { "id": "m-img", "component": "Image", "variant": "mediumFeature", "url": { "path": "imageUrl" }, "description": { "path": "name" } },
            { "id": "m-header", "component": "Row", "justify": "spaceBetween", "children": ["m-name", "m-price"] },
            { "id": "m-name", "component": "Text", "variant": "h3", "text": { "path": "name" } },
            { "id": "m-price", "component": "Text", "variant": "h3", "text": { "path": "priceText" } },
            { "id": "m-desc", "component": "Text", "variant": "body", "text": { "path": "description" } },
            { "id": "m-actions", "component": "Row", "justify": "spaceBetween", "children": ["btn-custom", "btn-quick"] },
            {
                "id": "btn-custom",
                "component": "Button",
                "child": "btn-custom-text",
                "variant": "default",
                "action": { "event": { "name": "open_customizer", "context": { "mealName": { "path": "name" } } } }
            },
            { "id": "btn-custom-text", "component": "Text", "text": "Customize Meal 🍔" },
            {
                "id": "btn-quick",
                "component": "Button",
                "child": "btn-quick-text",
                "variant": "primary",
                "action": { "event": { "name": "add_to_order", "context": { "mealName": { "path": "name" }, "basePrice": { "path": "price" } } } }
            },
            { "id": "btn-quick-text", "component": "Text", "text": "+ Quick Add Meal" }
        ]

        data_model = {
            "brandTitle": "McDonald's India Self-Order Kiosk",
            "subtitle": f"Found {len(meals)} Extra Value Meals for you:",
            "meals": [
                { **m, "priceText": f"₹{int(m['price'])}" } for m in meals
            ]
        }

        messages = self.schema_manager.build_surface_payload(
            surface_id="mcd-menu",
            components=components,
            data_model=data_model,
        )

        return {
            "textResponse": f"Welcome to McDonald's India! Found {len(meals)} meals for your order.",
            "a2uiMessages": messages,
        }

    def _build_customizer_response(self, meal_name: str = "McSpicy Paneer Meal") -> Dict[str, Any]:
        meal = get_meal_details(meal_name) or {}
        customizations = get_customization_options()

        components = [
            { "id": "root", "component": "Card", "child": "cust-col" },
            { "id": "cust-col", "component": "Column", "children": ["c-img", "c-title-row", "c-desc", "div-1", "size-pick", "div-2", "drink-pick", "div-3", "top-head", "opt-piri", "opt-cheese", "opt-onion", "div-4", "c-submit"] },
            { "id": "c-img", "component": "Image", "variant": "header", "url": meal.get("imageUrl", "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=700&auto=format&fit=crop&q=80"), "description": meal.get("name", "Burger") },
            { "id": "c-title-row", "component": "Row", "justify": "spaceBetween", "children": ["c-name", "c-price"] },
            { "id": "c-name", "component": "Text", "variant": "h2", "text": meal.get("name", "McSpicy™ Paneer Meal") },
            { "id": "c-price", "component": "Text", "variant": "h3", "text": f"₹{int(meal.get('price', 329))} Base" },
            { "id": "c-desc", "component": "Text", "variant": "body", "text": meal.get("description", "Customize your meal with Piri Piri fries and Indian drinks.") },
            { "id": "div-1", "component": "Divider" },
            {
                "id": "size-pick",
                "component": "ChoicePicker",
                "label": "1. Select Meal Size & Fries Portion",
                "variant": "mutuallyExclusive",
                "value": { "path": "/selectedSize" },
                "options": [
                    { "label": s["name"], "value": s["id"] } for s in customizations.get("sizes", [])
                ]
            },
            { "id": "div-2", "component": "Divider" },
            {
                "id": "drink-pick",
                "component": "ChoicePicker",
                "label": "2. Select Your Indian Beverage",
                "variant": "mutuallyExclusive",
                "value": { "path": "/selectedDrink" },
                "options": [
                    { "label": b["name"], "value": b["id"] } for b in customizations.get("beverages", [])
                ]
            },
            { "id": "div-3", "component": "Divider" },
            { "id": "top-head", "component": "Text", "variant": "h4", "text": "3. Add-ons & Customizations" },
            { "id": "opt-piri", "component": "CheckBox", "label": "🌶️ Piri Piri Spice Mix Shake Shake (+ ₹25)", "value": { "path": "/custom/piriPiri" } },
            { "id": "opt-cheese", "component": "CheckBox", "label": "🧀 Extra Sliced Cheese Slice (+ ₹35)", "value": { "path": "/custom/extraCheese" } },
            { "id": "opt-onion", "component": "CheckBox", "label": "🧅 No Onions (Jain Option)", "value": { "path": "/custom/noOnion" } },
            { "id": "div-4", "component": "Divider" },
            {
                "id": "c-submit",
                "component": "Button",
                "child": "c-submit-text",
                "variant": "primary",
                "action": { "event": { "name": "submit_custom_meal", "context": { "mealName": meal.get("name", "Custom Meal"), "basePrice": meal.get("price", 329.0) + 100.0 } } }
            },
            { "id": "c-submit-text", "component": "Text", "text": "Add Customized Meal to Order 🛒" }
        ]

        data_model = {
            "selectedSize": "large",
            "selectedDrink": "thums_up",
            "custom": {
                "piriPiri": True,
                "extraCheese": True,
                "noOnion": False
            }
        }

        messages = self.schema_manager.build_surface_payload(
            surface_id="mcd-customizer",
            components=components,
            data_model=data_model,
        )

        return {
            "textResponse": f"Opened customizer for {meal.get('name', 'McSpicy Paneer Meal')}. Choose size, drink, and add-ons.",
            "a2uiMessages": messages,
        }

    def _build_cart_response(self) -> Dict[str, Any]:
        tray = calculate_tray_totals()
        payment_methods = get_available_payment_methods()

        components = [
            { "id": "root", "component": "Card", "child": "cart-col" },
            { "id": "cart-col", "component": "Column", "children": ["c-title-row", "div-1", "dining-pick", "div-2", "items-head", "cart-items", "div-3", "pay-methods-head", "pay-method-pick", "div-4", "summary-card", "pay-btn"] },
            { "id": "c-title-row", "component": "Row", "justify": "spaceBetween", "children": ["c-title", "c-badge"] },
            { "id": "c-title", "component": "Text", "variant": "h2", "text": "🛒 Review Tray & Choose Payment" },
            { "id": "c-badge", "component": "Text", "variant": "caption", "text": "Kiosk Register #04 • Mumbai" },
            { "id": "div-1", "component": "Divider" },
            {
                "id": "dining-pick",
                "component": "ChoicePicker",
                "label": "1. Where will you be eating today?",
                "variant": "mutuallyExclusive",
                "value": { "path": "/diningMode" },
                "options": [
                    { "label": "🍽️ Dine-In (Table Tent Service)", "value": "dine_in" },
                    { "label": "🛍️ Takeaway / Parcel", "value": "takeout" }
                ]
            },
            { "id": "div-2", "component": "Divider" },
            { "id": "items-head", "component": "Text", "variant": "h4", "text": "2. Itemized Order Summary:" },
            { "id": "cart-items", "component": "List", "children": { "componentId": "c-item-card", "path": "/orderItems" } },
            { "id": "c-item-card", "component": "Card", "child": "c-item-row" },
            { "id": "c-item-row", "component": "Row", "justify": "spaceBetween", "children": ["c-item-info", "c-item-price"] },
            { "id": "c-item-info", "component": "Column", "children": ["ci-name", "ci-mods"] },
            { "id": "ci-name", "component": "Text", "variant": "h3", "text": { "path": "name" } },
            { "id": "ci-mods", "component": "Text", "variant": "caption", "text": { "path": "customSummary" } },
            { "id": "c-item-price", "component": "Text", "variant": "h3", "text": { "path": "formattedPrice" } },
            { "id": "div-3", "component": "Divider" },
            { "id": "pay-methods-head", "component": "Text", "variant": "h4", "text": "3. Select Payment Method:" },
            {
                "id": "pay-method-pick",
                "component": "ChoicePicker",
                "label": "Cards, UPI & Contactless Options",
                "variant": "mutuallyExclusive",
                "value": { "path": "/selectedPaymentMethod" },
                "options": [
                    { "label": pm["label"], "value": pm["id"] } for pm in payment_methods
                ]
            },
            { "id": "div-4", "component": "Divider" },
            { "id": "summary-card", "component": "Card", "child": "sum-col" },
            { "id": "sum-col", "component": "Column", "children": ["sub-row", "cgst-row", "sgst-row", "tot-row"] },
            { "id": "sub-row", "component": "Row", "justify": "spaceBetween", "children": ["sub-lbl", "sub-val"] },
            { "id": "sub-lbl", "component": "Text", "variant": "body", "text": "Items Subtotal" },
            { "id": "sub-val", "component": "Text", "variant": "body", "text": { "path": "/subtotalText" } },
            { "id": "cgst-row", "component": "Row", "justify": "spaceBetween", "children": ["cgst-lbl", "cgst-val"] },
            { "id": "cgst-lbl", "component": "Text", "variant": "body", "text": "CGST (2.5%)" },
            { "id": "cgst-val", "component": "Text", "variant": "body", "text": { "path": "/cgstText" } },
            { "id": "sgst-row", "component": "Row", "justify": "spaceBetween", "children": ["sgst-lbl", "sgst-val"] },
            { "id": "sgst-lbl", "component": "Text", "variant": "body", "text": "SGST (2.5%)" },
            { "id": "sgst-val", "component": "Text", "variant": "body", "text": { "path": "/sgstText" } },
            { "id": "tot-row", "component": "Row", "justify": "spaceBetween", "children": ["tot-lbl", "tot-val"] },
            { "id": "tot-lbl", "component": "Text", "variant": "h3", "text": "Total Amount Payable" },
            { "id": "tot-val", "component": "Text", "variant": "h2", "text": { "path": "/totalText" } },
            {
                "id": "pay-btn",
                "component": "Button",
                "child": "pay-btn-text",
                "variant": "primary",
                "action": { "event": { "name": "proceed_to_payment", "context": { "totalAmount": tray["total"], "paymentMethod": { "path": "/selectedPaymentMethod" } } } }
            },
            { "id": "pay-btn-text", "component": "Text", "text": "💳 Pay with Selected Option & Print Invoice" }
        ]

        data_model = {
            "diningMode": "dine_in",
            "selectedPaymentMethod": "card_visa_master",
            "subtotalText": tray["subtotalText"],
            "cgstText": tray["cgstText"],
            "sgstText": tray["sgstText"],
            "totalText": tray["totalText"],
            "orderItems": [
                {
                    "name": i["name"],
                    "formattedPrice": f"₹{float(i['price']):.2f}",
                    "customSummary": i.get("customSummary", "")
                }
                for i in tray["items"]
            ]
        }

        messages = self.schema_manager.build_surface_payload(
            surface_id="mcd-cart-review",
            components=components,
            data_model=data_model,
        )

        return {
            "textResponse": f"Reviewing your Kiosk tray. Total: {tray['totalText']} (incl. 5% GST). Choose your card / UPI option to complete payment.",
            "a2uiMessages": messages,
        }

    def _build_settlement_response(self, payment_method_id: str = "card_visa_master") -> Dict[str, Any]:
        invoice = generate_purchase_order_invoice(order_id="88", payment_method_id=payment_method_id)

        components = [
            { "id": "root", "component": "Card", "child": "po-col" },
            { "id": "po-col", "component": "Column", "children": ["header-row", "order-banner", "table-row", "div-1", "items-list", "div-2", "pay-card", "instructions", "new-order-btn"] },
            { "id": "header-row", "component": "Row", "justify": "spaceBetween", "children": ["store-name", "timestamp"] },
            { "id": "store-name", "component": "Text", "variant": "h3", "text": invoice["store_info"] },
            { "id": "timestamp", "component": "Text", "variant": "caption", "text": { "path": "/orderTimestamp" } },
            { "id": "order-banner", "component": "Card", "child": "banner-col" },
            { "id": "banner-col", "component": "Column", "align": "center", "children": ["po-lbl", "po-num", "po-status"] },
            { "id": "po-lbl", "component": "Text", "variant": "caption", "text": "TAX INVOICE & ORDER PICKUP TOKEN" },
            { "id": "po-num", "component": "Text", "variant": "h1", "text": { "path": "/poNumber" } },
            { "id": "po-status", "component": "Text", "variant": "h4", "text": "STATUS: PAYMENT APPROVED • SENT TO KITCHEN GRILL 🍳" },
            { "id": "table-row", "component": "Row", "justify": "spaceBetween", "children": ["table-tent", "dining-type"] },
            { "id": "table-tent", "component": "Text", "variant": "body", "text": { "path": "/tableTent" } },
            { "id": "dining-type", "component": "Text", "variant": "body", "text": { "path": "/diningType" } },
            { "id": "div-1", "component": "Divider" },
            { "id": "items-list", "component": "List", "children": { "componentId": "po-item-card", "path": "/items" } },
            { "id": "po-item-card", "component": "Card", "child": "po-item-row" },
            { "id": "po-item-row", "component": "Row", "justify": "spaceBetween", "children": ["poi-name", "poi-price"] },
            { "id": "poi-name", "component": "Text", "variant": "body", "text": { "path": "name" } },
            { "id": "poi-price", "component": "Text", "variant": "body", "text": { "path": "price" } },
            { "id": "div-2", "component": "Divider" },
            { "id": "pay-card", "component": "Card", "child": "pay-col" },
            { "id": "pay-col", "component": "Column", "children": ["pay-method-row", "total-paid-row"] },
            { "id": "pay-method-row", "component": "Row", "justify": "spaceBetween", "children": ["pm-lbl", "pm-val"] },
            { "id": "pm-lbl", "component": "Text", "variant": "body", "text": "Payment Option Used" },
            { "id": "pm-val", "component": "Text", "variant": "body", "text": { "path": "/paymentMethod" } },
            { "id": "total-paid-row", "component": "Row", "justify": "spaceBetween", "children": ["tp-lbl", "tp-val"] },
            { "id": "tp-lbl", "component": "Text", "variant": "h3", "text": "Total Amount Charged" },
            { "id": "tp-val", "component": "Text", "variant": "h2", "text": { "path": "/totalPaid" } },
            { "id": "instructions", "component": "Text", "variant": "caption", "text": "📢 Please collect your Table Tent #12. When Token #88 appears on the pickup screen, your order will be delivered to your table." },
            {
                "id": "new-order-btn",
                "component": "Button",
                "child": "new-order-text",
                "variant": "primary",
                "action": { "event": { "name": "start_new_order", "context": {} } }
            },
            { "id": "new-order-text", "component": "Text", "text": "✨ Start Next Customer Order" }
        ]

        data_model = {
            "poNumber": invoice["po_number"],
            "orderTimestamp": invoice["timestamp"],
            "tableTent": invoice["table_tent"],
            "diningType": "Mumbai Bandra West • Store #1042",
            "paymentMethod": invoice["payment_method_label"],
            "totalPaid": invoice["total_paid"],
            "items": invoice["items"]
        }

        messages = self.schema_manager.build_surface_payload(
            surface_id="mcd-purchase-order",
            components=components,
            data_model=data_model,
        )

        return {
            "textResponse": f"Payment approved via {invoice['payment_method_label']}. McDonald's Tax Invoice & Token #88 generated.",
            "a2uiMessages": messages,
        }
