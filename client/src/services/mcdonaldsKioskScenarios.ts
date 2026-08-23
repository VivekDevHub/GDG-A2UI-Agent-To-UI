import { A2UIMessage } from '../a2ui/types';

/**
 * Scenario 1: McDonald's India Kiosk Menu & Best Sellers
 */
export const MCDONALDS_MENU_SCENARIO: A2UIMessage[] = [
  {
    version: 'v0.9',
    createSurface: {
      surfaceId: 'mcd-menu',
      catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
      theme: {
        primaryColor: '#DA291C',
        font: 'Google Sans',
      },
    },
  },
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: 'mcd-menu',
      components: [
        {
          id: 'root',
          component: 'Column',
          children: ['header-row', 'kiosk-subtitle', 'meals-list'],
        },
        {
          id: 'header-row',
          component: 'Row',
          justify: 'spaceBetween',
          children: ['mcd-logo-title', 'order-mode-badge'],
        },
        {
          id: 'mcd-logo-title',
          component: 'Text',
          variant: 'h1',
          text: { path: '/brandTitle' },
        },
        {
          id: 'order-mode-badge',
          component: 'Text',
          variant: 'caption',
          text: { path: '/kioskBadge' },
        },
        {
          id: 'kiosk-subtitle',
          component: 'Text',
          variant: 'body',
          text: { path: '/subtitle' },
        },
        {
          id: 'meals-list',
          component: 'List',
          children: {
            componentId: 'meal-card-template',
            path: '/meals',
          },
        },
        {
          id: 'meal-card-template',
          component: 'Card',
          child: 'meal-card-layout',
        },
        {
          id: 'meal-card-layout',
          component: 'Column',
          children: [
            'meal-image',
            'meal-title-row',
            'meal-desc',
            'meal-action-row',
          ],
        },
        {
          id: 'meal-image',
          component: 'Image',
          variant: 'mediumFeature',
          url: { path: 'imageUrl' },
          description: { path: 'name' },
        },
        {
          id: 'meal-title-row',
          component: 'Row',
          justify: 'spaceBetween',
          children: ['meal-name', 'meal-price'],
        },
        {
          id: 'meal-name',
          component: 'Text',
          variant: 'h3',
          text: { path: 'name' },
        },
        {
          id: 'meal-price',
          component: 'Text',
          variant: 'h3',
          text: { path: 'priceText' },
        },
        {
          id: 'meal-desc',
          component: 'Text',
          variant: 'body',
          text: { path: 'description' },
        },
        {
          id: 'meal-action-row',
          component: 'Row',
          justify: 'spaceBetween',
          children: ['customize-btn', 'quick-add-btn'],
        },
        {
          id: 'customize-btn',
          component: 'Button',
          child: 'customize-btn-text',
          variant: 'default',
          action: {
            event: {
              name: 'open_customizer',
              context: {
                mealId: { path: 'id' },
                mealName: { path: 'name' },
                basePrice: { path: 'price' },
                imageUrl: { path: 'imageUrl' },
              },
            },
          },
        },
        {
          id: 'customize-btn-text',
          component: 'Text',
          text: 'Customize Meal 🍔',
        },
        {
          id: 'quick-add-btn',
          component: 'Button',
          child: 'quick-add-btn-text',
          variant: 'primary',
          action: {
            event: {
              name: 'add_to_order',
              context: {
                mealId: { path: 'id' },
                mealName: { path: 'name' },
                price: { path: 'price' },
                imageUrl: { path: 'imageUrl' },
              },
            },
          },
        },
        {
          id: 'quick-add-btn-text',
          component: 'Text',
          text: '+ Quick Add Meal',
        },
      ],
    },
  },
  {
    version: 'v0.9',
    updateDataModel: {
      surfaceId: 'mcd-menu',
      path: '/',
      value: {
        brandTitle: "McDonald's India Self-Order Kiosk",
        kioskBadge: 'Kiosk #04 • Dine-In / Takeaway',
        subtitle: 'Select your favorite Indian McDonald\'s Extra Value Meal or ask the AI Kiosk:',
        meals: [
          {
            id: 'mcd-mcspicy-paneer',
            name: 'McSpicy™ Paneer Meal',
            price: 329,
            priceText: '₹329',
            description: 'Rich & crunchy paneer patty marinated with spicy batter, topped with creamy tandoori sauce and shredded lettuce. Served with Fries & Beverage.',
            imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=700&auto=format&fit=crop&q=80',
          },
          {
            id: 'mcd-maharaja-mac',
            name: 'Chicken Maharaja Mac™ Meal',
            price: 379,
            priceText: '₹379',
            description: 'The King of Burgers! Double decker with two flame-grilled chicken patties, rich habanero sauce, crunchy jalapeños, onions, cheese & crisp lettuce.',
            imageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=700&auto=format&fit=crop&q=80',
          },
          {
            id: 'mcd-mcspicy-chicken',
            name: 'McSpicy™ Chicken Meal',
            price: 349,
            priceText: '₹349',
            description: 'Tender juicy chicken patty with fiery spicy batter coating, topped with fresh lettuce and spicy mayo in a toasted sesame bun. Served with Fries & Coke.',
            imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=700&auto=format&fit=crop&q=80',
          },
          {
            id: 'mcd-mcaloo-tikki',
            name: 'McAloo Tikki™ Value Meal',
            price: 179,
            priceText: '₹179',
            description: 'Crispy potato and peas patty infused with traditional Indian spices, topped with sweet tomato mayo, fresh onions & tomatoes in a warm bun.',
            imageUrl: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=700&auto=format&fit=crop&q=80',
          },
        ],
      },
    },
  },
];

/**
 * Scenario 2: Deep Meal Customizer (Indian Options: Piri Piri, Thums Up, Tandoori Mayo)
 */
export const MCDONALDS_CUSTOMIZER_SCENARIO: A2UIMessage[] = [
  {
    version: 'v0.9',
    createSurface: {
      surfaceId: 'mcd-customizer',
      catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
      theme: {
        primaryColor: '#DA291C',
        font: 'Google Sans',
      },
    },
  },
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: 'mcd-customizer',
      components: [
        {
          id: 'root',
          component: 'Card',
          child: 'customizer-col',
        },
        {
          id: 'customizer-col',
          component: 'Column',
          children: [
            'hero-image',
            'title-row',
            'meal-desc',
            'divider-1',
            'meal-size-picker',
            'divider-2',
            'drink-picker',
            'divider-3',
            'toppings-heading',
            'opt-piri-piri',
            'opt-extra-cheese',
            'opt-no-onion',
            'opt-extra-sauce',
            'divider-4',
            'instructions-field',
            'confirm-meal-btn',
          ],
        },
        {
          id: 'hero-image',
          component: 'Image',
          variant: 'header',
          url: { path: '/imageUrl' },
          description: { path: '/mealName' },
        },
        {
          id: 'title-row',
          component: 'Row',
          justify: 'spaceBetween',
          children: ['meal-title', 'price-tag'],
        },
        {
          id: 'meal-title',
          component: 'Text',
          variant: 'h2',
          text: { path: '/mealName' },
        },
        {
          id: 'price-tag',
          component: 'Text',
          variant: 'h3',
          text: { path: '/priceText' },
        },
        {
          id: 'meal-desc',
          component: 'Text',
          variant: 'body',
          text: { path: '/description' },
        },
        {
          id: 'divider-1',
          component: 'Divider',
        },
        {
          id: 'meal-size-picker',
          component: 'ChoicePicker',
          label: '1. Select Meal Size & Fries Portion',
          variant: 'mutuallyExclusive',
          value: { path: '/selectedSize' },
          options: [
            { label: 'Medium Meal (Included)', value: 'medium' },
            { label: '🍟 Large Meal (+ ₹40)', value: 'large' },
          ],
        },
        {
          id: 'divider-2',
          component: 'Divider',
        },
        {
          id: 'drink-picker',
          component: 'ChoicePicker',
          label: '2. Select Your Indian Beverage',
          variant: 'mutuallyExclusive',
          value: { path: '/selectedDrink' },
          options: [
            { label: '⚡ Thums Up (Taste the Thunder)', value: 'thums_up' },
            { label: '🥤 Coca-Cola Zero Sugar', value: 'coke_zero' },
            { label: '🍋 Sprite', value: 'sprite' },
            { label: '☕ McCafé Iced Coffee (+ ₹30)', value: 'iced_coffee' },
          ],
        },
        {
          id: 'divider-3',
          component: 'Divider',
        },
        {
          id: 'toppings-heading',
          component: 'Text',
          variant: 'h4',
          text: '3. Add-ons & Customizations',
        },
        {
          id: 'opt-piri-piri',
          component: 'CheckBox',
          label: '🌶️ Piri Piri Spice Mix Shake Shake (+ ₹25)',
          value: { path: '/custom/piriPiri' },
        },
        {
          id: 'opt-extra-cheese',
          component: 'CheckBox',
          label: '🧀 Extra Sliced Cheese Slice (+ ₹35)',
          value: { path: '/custom/extraCheese' },
        },
        {
          id: 'opt-no-onion',
          component: 'CheckBox',
          label: '🧅 No Onions (Jain Friendly Option)',
          value: { path: '/custom/noOnion' },
        },
        {
          id: 'opt-extra-sauce',
          component: 'CheckBox',
          label: 'Extra Tandoori / Spicy Mayo (+ ₹20)',
          value: { path: '/custom/extraSauce' },
        },
        {
          id: 'divider-4',
          component: 'Divider',
        },
        {
          id: 'instructions-field',
          component: 'TextField',
          label: 'Special Preparation Instructions',
          value: { path: '/kitchenNotes' },
        },
        {
          id: 'confirm-meal-btn',
          component: 'Button',
          child: 'confirm-btn-text',
          variant: 'primary',
          action: {
            event: {
              name: 'submit_custom_meal',
              context: {
                mealName: { path: '/mealName' },
                basePrice: { path: '/basePrice' },
                size: { path: '/selectedSize' },
                drink: { path: '/selectedDrink' },
                custom: { path: '/custom' },
                notes: { path: '/kitchenNotes' },
                imageUrl: { path: '/imageUrl' },
              },
            },
          },
        },
        {
          id: 'confirm-btn-text',
          component: 'Text',
          text: 'Add Customized Meal to Order 🛒',
        },
      ],
    },
  },
  {
    version: 'v0.9',
    updateDataModel: {
      surfaceId: 'mcd-customizer',
      path: '/',
      value: {
        mealName: 'McSpicy™ Paneer Meal',
        priceText: '₹329 Base',
        basePrice: 329,
        description: 'Crispy spicy paneer burger with tandoori mayo, upsized fries with Piri Piri spice and chilled Thums Up.',
        imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=700&auto=format&fit=crop&q=80',
        selectedSize: 'large',
        selectedDrink: 'thums_up',
        custom: {
          piriPiri: true,
          extraCheese: true,
          noOnion: false,
          extraSauce: true,
        },
        kitchenNotes: 'Extra spicy tandoori mayo please.',
      },
    },
  },
];

/**
 * Scenario 3: Kiosk Tray Review (GST Breakdown & Dine-in/Takeaway)
 */
export const MCDONALDS_CART_SCENARIO: A2UIMessage[] = [
  {
    version: 'v0.9',
    createSurface: {
      surfaceId: 'mcd-cart-review',
      catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
      theme: {
        primaryColor: '#DA291C',
        font: 'Google Sans',
      },
    },
  },
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: 'mcd-cart-review',
      components: [
        {
          id: 'root',
          component: 'Card',
          child: 'cart-col',
        },
        {
          id: 'cart-col',
          component: 'Column',
          children: [
            'cart-title-row',
            'divider-1',
            'dining-mode-picker',
            'divider-2',
            'items-heading',
            'cart-items-list',
            'divider-3',
            'summary-card',
            'checkout-btn',
          ],
        },
        {
          id: 'cart-title-row',
          component: 'Row',
          justify: 'spaceBetween',
          children: ['cart-title', 'cart-badge'],
        },
        {
          id: 'cart-title',
          component: 'Text',
          variant: 'h2',
          text: '🛒 Review Your Kiosk Tray',
        },
        {
          id: 'cart-badge',
          component: 'Text',
          variant: 'caption',
          text: 'Kiosk Register #04 • Mumbai Bandra West',
        },
        {
          id: 'divider-1',
          component: 'Divider',
        },
        {
          id: 'dining-mode-picker',
          component: 'ChoicePicker',
          label: 'Select Order Dining Mode:',
          variant: 'mutuallyExclusive',
          value: { path: '/diningMode' },
          options: [
            { label: '🍽️ Dine-In (Table Tent Delivery)', value: 'dine_in' },
            { label: '🛍️ Takeaway / Parcel', value: 'takeout' },
          ],
        },
        {
          id: 'divider-2',
          component: 'Divider',
        },
        {
          id: 'items-heading',
          component: 'Text',
          variant: 'h4',
          text: 'Itemized Order Summary:',
        },
        {
          id: 'cart-items-list',
          component: 'List',
          children: {
            componentId: 'cart-item-template',
            path: '/orderItems',
          },
        },
        {
          id: 'cart-item-template',
          component: 'Card',
          child: 'cart-item-row',
        },
        {
          id: 'cart-item-row',
          component: 'Row',
          justify: 'spaceBetween',
          children: ['item-info-col', 'item-price'],
        },
        {
          id: 'item-info-col',
          component: 'Column',
          children: ['item-name', 'item-mods'],
        },
        {
          id: 'item-name',
          component: 'Text',
          variant: 'h3',
          text: { path: 'name' },
        },
        {
          id: 'item-mods',
          component: 'Text',
          variant: 'caption',
          text: { path: 'customSummary' },
        },
        {
          id: 'item-price',
          component: 'Text',
          variant: 'h3',
          text: { path: 'formattedPrice' },
        },
        {
          id: 'divider-3',
          component: 'Divider',
        },
        {
          id: 'pay-heading',
          component: 'Text',
          variant: 'h4',
          text: '3. Select Payment Option:',
        },
        {
          id: 'payment-method-picker',
          component: 'ChoicePicker',
          label: 'Card, UPI & Digital Options',
          variant: 'mutuallyExclusive',
          value: { path: '/selectedPaymentMethod' },
          options: [
            { label: '💳 Visa / Mastercard Credit or Debit Card', value: 'card_visa_master' },
            { label: '🇮🇳 RuPay Platinum Debit / Credit Card', value: 'card_rupay' },
            { label: '💎 American Express Card', value: 'card_amex' },
            { label: '⚡ Google Pay / PhonePe UPI', value: 'upi_gpay' },
            { label: '📱 Apple Pay / Contactless Tap', value: 'apple_pay' },
          ],
        },
        {
          id: 'divider-4',
          component: 'Divider',
        },
        {
          id: 'summary-card',
          component: 'Card',
          child: 'summary-col',
        },
        {
          id: 'summary-col',
          component: 'Column',
          children: ['subtotal-row', 'cgst-row', 'sgst-row', 'total-row'],
        },
        {
          id: 'subtotal-row',
          component: 'Row',
          justify: 'spaceBetween',
          children: ['subtotal-label', 'subtotal-val'],
        },
        { id: 'subtotal-label', component: 'Text', variant: 'body', text: 'Items Subtotal' },
        { id: 'subtotal-val', component: 'Text', variant: 'body', text: { path: '/subtotalText' } },
        {
          id: 'cgst-row',
          component: 'Row',
          justify: 'spaceBetween',
          children: ['cgst-label', 'cgst-val'],
        },
        { id: 'cgst-label', component: 'Text', variant: 'body', text: 'CGST (2.5%)' },
        { id: 'cgst-val', component: 'Text', variant: 'body', text: { path: '/cgstText' } },
        {
          id: 'sgst-row',
          component: 'Row',
          justify: 'spaceBetween',
          children: ['sgst-label', 'sgst-val'],
        },
        { id: 'sgst-label', component: 'Text', variant: 'body', text: 'SGST (2.5%)' },
        { id: 'sgst-val', component: 'Text', variant: 'body', text: { path: '/sgstText' } },
        {
          id: 'total-row',
          component: 'Row',
          justify: 'spaceBetween',
          children: ['total-label', 'total-val'],
        },
        { id: 'total-label', component: 'Text', variant: 'h3', text: 'Total Amount Payable' },
        { id: 'total-val', component: 'Text', variant: 'h2', text: { path: '/totalText' } },
        {
          id: 'checkout-btn',
          component: 'Button',
          child: 'checkout-btn-text',
          variant: 'primary',
          action: {
            event: {
              name: 'proceed_to_payment',
              context: {
                totalAmount: { path: '/totalAmount' },
                diningMode: { path: '/diningMode' },
                paymentMethod: { path: '/selectedPaymentMethod' },
              },
            },
          },
        },
        {
          id: 'checkout-btn-text',
          component: 'Text',
          text: '💳 Pay with Selected Card/UPI & Print Invoice',
        },
      ],
    },
  },
  {
    version: 'v0.9',
    updateDataModel: {
      surfaceId: 'mcd-cart-review',
      path: '/',
      value: {
        diningMode: 'dine_in',
        selectedPaymentMethod: 'card_visa_master',
        subtotalText: '₹708.00',
        cgstText: '₹17.70',
        sgstText: '₹17.70',
        totalText: '₹743.40',
        totalAmount: 743.40,
        orderItems: [
          {
            name: 'McSpicy™ Paneer Meal (Large)',
            formattedPrice: '₹429.00',
            customSummary: 'Large Piri Piri Fries + Thums Up • Extra Cheese Slice, Extra Tandoori Mayo',
          },
          {
            name: 'McAloo Tikki™ Meal',
            formattedPrice: '₹179.00',
            customSummary: 'Medium Fries + Sprite • Sweet Tomato Mayo',
          },
          {
            name: 'Veg Pizza McPuff™ (2 pcs)',
            formattedPrice: '₹100.00',
            customSummary: 'Crispy pastry with tomato sauce, mozzarella & vegetables',
          },
        ],
      },
    },
  },
];

/**
 * Scenario 4: Official McDonald's India GST Purchase Order & Tax Invoice
 */
export const MCDONALDS_PURCHASE_ORDER_SCENARIO: A2UIMessage[] = [
  {
    version: 'v0.9',
    createSurface: {
      surfaceId: 'mcd-purchase-order',
      catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
      theme: {
        primaryColor: '#DA291C',
        font: 'Google Sans',
      },
    },
  },
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: 'mcd-purchase-order',
      components: [
        {
          id: 'root',
          component: 'Card',
          child: 'po-col',
        },
        {
          id: 'po-col',
          component: 'Column',
          children: [
            'header-status-row',
            'order-number-banner',
            'table-tent-row',
            'divider-1',
            'items-list',
            'divider-2',
            'payment-status-card',
            'instructions-text',
            'reset-kiosk-btn',
          ],
        },
        {
          id: 'header-status-row',
          component: 'Row',
          justify: 'spaceBetween',
          children: ['store-info', 'time-badge'],
        },
        {
          id: 'store-info',
          component: 'Text',
          variant: 'h3',
          text: "McDonald's India (Hardcastle Restaurants) #1042",
        },
        {
          id: 'time-badge',
          component: 'Text',
          variant: 'caption',
          text: { path: '/orderTimestamp' },
        },
        {
          id: 'order-number-banner',
          component: 'Card',
          child: 'order-number-col',
        },
        {
          id: 'order-number-col',
          component: 'Column',
          align: 'center',
          children: ['po-label', 'po-number', 'po-status'],
        },
        {
          id: 'po-label',
          component: 'Text',
          variant: 'caption',
          text: 'TAX INVOICE & ORDER PICKUP TOKEN',
        },
        {
          id: 'po-number',
          component: 'Text',
          variant: 'h1',
          text: { path: '/poNumber' },
        },
        {
          id: 'po-status',
          component: 'Text',
          variant: 'h4',
          text: 'STATUS: PAID VIA UPI • SENT TO KITCHEN GRILL 🍳',
        },
        {
          id: 'table-tent-row',
          component: 'Row',
          justify: 'spaceBetween',
          children: ['table-tent-text', 'dining-type-text'],
        },
        {
          id: 'table-tent-text',
          component: 'Text',
          variant: 'body',
          text: { path: '/tableTent' },
        },
        {
          id: 'dining-type-text',
          component: 'Text',
          variant: 'body',
          text: { path: '/diningType' },
        },
        {
          id: 'divider-1',
          component: 'Divider',
        },
        {
          id: 'items-list',
          component: 'List',
          children: {
            componentId: 'po-item-card',
            path: '/items',
          },
        },
        {
          id: 'po-item-card',
          component: 'Card',
          child: 'po-item-row',
        },
        {
          id: 'po-item-row',
          component: 'Row',
          justify: 'spaceBetween',
          children: ['po-item-name', 'po-item-price'],
        },
        {
          id: 'po-item-name',
          component: 'Text',
          variant: 'body',
          text: { path: 'name' },
        },
        {
          id: 'po-item-price',
          component: 'Text',
          variant: 'body',
          text: { path: 'price' },
        },
        {
          id: 'divider-2',
          component: 'Divider',
        },
        {
          id: 'payment-status-card',
          component: 'Card',
          child: 'pay-details-col',
        },
        {
          id: 'pay-details-col',
          component: 'Column',
          children: ['pay-method-row', 'total-paid-row'],
        },
        {
          id: 'pay-method-row',
          component: 'Row',
          justify: 'spaceBetween',
          children: ['pm-lbl', 'pm-val'],
        },
        { id: 'pm-lbl', component: 'Text', variant: 'body', text: 'Payment Mode' },
        { id: 'pm-val', component: 'Text', variant: 'body', text: 'Google Pay UPI (UPI Ref: #992819208)' },
        {
          id: 'total-paid-row',
          component: 'Row',
          justify: 'spaceBetween',
          children: ['tp-lbl', 'tp-val'],
        },
        { id: 'tp-lbl', component: 'Text', variant: 'h3', text: 'Total Amount Paid' },
        { id: 'tp-val', component: 'Text', variant: 'h2', text: { path: '/totalPaid' } },
        {
          id: 'instructions-text',
          component: 'Text',
          variant: 'caption',
          text: '📢 Please collect your Table Tent #12. When Token #88 appears on the display screen, your fresh hot food will be served at your table.',
        },
        {
          id: 'reset-kiosk-btn',
          component: 'Button',
          child: 'reset-btn-text',
          variant: 'primary',
          action: {
            event: {
              name: 'start_new_order',
              context: {},
            },
          },
        },
        {
          id: 'reset-btn-text',
          component: 'Text',
          text: '✨ Start Next Customer Order',
        },
      ],
    },
  },
  {
    version: 'v0.9',
    updateDataModel: {
      surfaceId: 'mcd-purchase-order',
      path: '/',
      value: {
        poNumber: 'TOKEN # 88',
        orderTimestamp: 'Today • GSTIN: 27AAACM0000A1Z5 • Invoice #MCD-2026-88',
        tableTent: 'Table Service: Tent #12',
        diningType: 'Dine-In • GST 5% Paid',
        totalPaid: '₹743.40',
        items: [
          { name: '1x McSpicy™ Paneer Meal (Large Piri Piri Fries + Thums Up, Extra Cheese, Sauce)', price: '₹429.00' },
          { name: '1x McAloo Tikki™ Meal (Medium Fries + Sprite)', price: '₹179.00' },
          { name: '1x Veg Pizza McPuff™ (2 pcs)', price: '₹100.00' },
          { name: 'GST (5% Total: CGST 2.5% + SGST 2.5%)', price: '₹35.40' },
        ],
      },
    },
  },
];
