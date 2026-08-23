import { A2UIMessage, ClientEventPayload } from '../a2ui/types';
import {
  MCDONALDS_MENU_SCENARIO,
  MCDONALDS_CUSTOMIZER_SCENARIO,
  MCDONALDS_CART_SCENARIO,
  MCDONALDS_PURCHASE_ORDER_SCENARIO,
} from './mcdonaldsKioskScenarios';

export class KioskAgentClient {
  private adkEndpoint: string;

  constructor(endpoint: string = 'http://localhost:10002') {
    this.adkEndpoint = endpoint;
  }

  async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.adkEndpoint}/`, { method: 'GET', signal: AbortSignal.timeout(1500) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async sendMessage(
    queryOrEvent: string | ClientEventPayload,
    onMessageChunk?: (msg: A2UIMessage) => void
  ): Promise<{ textResponse: string; a2uiMessages: A2UIMessage[] }> {
    // 1. Automatically try Python FastAPI backend if online
    try {
      const payload = typeof queryOrEvent === 'string'
        ? { message: queryOrEvent }
        : { event: queryOrEvent.eventName, context: queryOrEvent.context };

      const res = await fetch(`${this.adkEndpoint}/agent/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        const msgs = data.a2uiMessages || [];
        for (const m of msgs) {
          if (onMessageChunk) onMessageChunk(m);
        }
        return {
          textResponse: data.textResponse || 'Updated McDonald\'s India Kiosk via Google ADK Agent.',
          a2uiMessages: msgs,
        };
      }
    } catch {
      // Backend not running or timeout -> Seamlessly fallback to Smart POC Simulation
    }

    // 2. Local POC simulation fallback
    await new Promise((resolve) => setTimeout(resolve, 150));

    let messages: A2UIMessage[] = [];
    let textResponse = '';

    if (typeof queryOrEvent === 'object') {
      const eventName = queryOrEvent.eventName;

      if (eventName === 'open_customizer') {
        messages = MCDONALDS_CUSTOMIZER_SCENARIO;
        textResponse = `🍔 Customizer opened for ${queryOrEvent.context?.mealName || 'McSpicy Paneer Meal'}. Choose fries size, Piri Piri spice mix, beverage, and add-ons.`;
      } else if (eventName === 'submit_custom_meal' || eventName === 'add_to_order') {
        messages = MCDONALDS_CART_SCENARIO;
        textResponse = `✅ Added meal to your Kiosk tray. Ready to review your order and pay via UPI?`;
      } else if (eventName === 'proceed_to_payment') {
        messages = MCDONALDS_PURCHASE_ORDER_SCENARIO;
        textResponse = `🎉 Payment confirmed via Google Pay UPI! Generated McDonald's India Tax Invoice & Token #88.`;
      } else if (eventName === 'start_new_order') {
        messages = MCDONALDS_MENU_SCENARIO;
        textResponse = `Welcome to McDonald's India! What would you like to order today?`;
      } else {
        messages = MCDONALDS_MENU_SCENARIO;
        textResponse = `Processed Kiosk action: ${eventName}`;
      }
    } else {
      const q = queryOrEvent.toLowerCase();
      if (q.includes('custom') || q.includes('paneer') || q.includes('piri') || q.includes('spicy') || q.includes('maharaja') || q.includes('thums')) {
        messages = MCDONALDS_CUSTOMIZER_SCENARIO;
        textResponse = 'Here is the McSpicy Paneer Meal customizer. You can add Piri Piri shake shake, pick Thums Up, and adjust toppings:';
      } else if (q.includes('cart') || q.includes('tray') || q.includes('review') || q.includes('order')) {
        messages = MCDONALDS_CART_SCENARIO;
        textResponse = 'Here is your current Kiosk tray. Review your items, GST details, and dining mode:';
      } else if (q.includes('pay') || q.includes('upi') || q.includes('receipt') || q.includes('purchase order') || q.includes('invoice') || q.includes('token') || q.includes('checkout')) {
        messages = MCDONALDS_PURCHASE_ORDER_SCENARIO;
        textResponse = 'Generating your Official GST Tax Invoice & Pickup Token #88:';
      } else {
        messages = MCDONALDS_MENU_SCENARIO;
        textResponse = 'Welcome to McDonald\'s India Self-Order Kiosk! Here are our featured Extra Value Meals:';
      }
    }

    for (const msg of messages) {
      if (onMessageChunk) onMessageChunk(msg);
    }

    return {
      textResponse,
      a2uiMessages: messages,
    };
  }
}

export const defaultKioskAgent = new KioskAgentClient();
