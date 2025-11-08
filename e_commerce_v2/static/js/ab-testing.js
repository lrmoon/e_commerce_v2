// e_commerce_v2/static/js/ab-testing.js
// A/B Testing Manager for GreatKart E-commerce

class ABTestManager {
    constructor() {
        this.experiments = {
            'add_to_cart_button': {
                variants: {
                    'A': { color: '#28a745', text: 'Add to Cart' }, // Original (green)
                    'B': { color: '#dc3545', text: '🛒 Add to Cart Now!' }  // Variant (red with icon)
                },
                weight: 0.5 // 50/50 split
            },
            'checkout_button': {
                variants: {
                    'A': { color: '#007bff', text: 'Proceed to Checkout' }, // Original (blue)
                    'B': { color: '#ff6b00', text: '🚀 Quick Checkout' }    // Variant (orange with rocket)
                },
                weight: 0.5
            },
            'buy_now_button': {
                variants: {
                    'A': { color: '#6c757d', text: 'Buy Now' }, // Original (gray)
                    'B': { color: '#17a2b8', text: '⭐ Buy Now' }  // Variant (teal with star)
                },
                weight: 0.5
            }
        };
    }

    getVariant(experimentName) {
        // Check if user already has a variant (for consistency)
        const stored = localStorage.getItem(`ab_${experimentName}`);
        if (stored) return stored;

        // Assign new variant
        const experiment = this.experiments[experimentName];
        const variant = Math.random() < experiment.weight ? 'B' : 'A'; // B is experimental
        
        // Store for future visits
        localStorage.setItem(`ab_${experimentName}`, variant);
        
        // Track the assignment
        this.trackAssignment(experimentName, variant);
        
        return variant;
    }

    trackAssignment(experimentName, variant) {
        // Track in GA4 if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ab_test_assigned', {
                'experiment_name': experimentName,
                'variant': variant
            });
        }
        
        console.log(`AB Test - ${experimentName}: Variant ${variant}`);
    }

    trackConversion(experimentName, element, eventType = 'click') {
        $(element).on(eventType, () => {
            const variant = localStorage.getItem(`ab_${experimentName}`) || 'A';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'ab_test_conversion', {
                    'experiment_name': experimentName,
                    'variant': variant,
                    'element_type': element.tagName,
                    'element_text': element.textContent.trim()
                });
            }
            
            console.log(`AB Conversion - ${experimentName}: Variant ${variant}`);
        });
    }

    applyAddToCartTest() {
        const variant = this.getVariant('add_to_cart_button');
        const config = this.experiments.add_to_cart_button.variants[variant];
        
        // Use jQuery to target add to cart buttons
        const $buttons = $('.btn-add-to-cart, .add-to-cart, .add_to_cart, .cart-btn, .ajax-add-to-cart');
        
        $buttons.each(function() {
            const $button = $(this);
            
            // Apply style changes
            $button.css({
                'backgroundColor': config.color,
                'borderColor': config.color
            });
            
            // Apply text changes if it contains cart-related text
            const buttonText = $button.text().toLowerCase();
            if (buttonText.includes('add') || buttonText.includes('cart')) {
                $button.text(config.text);
            }
            
            // Add tracking
            this.trackConversion('add_to_cart_button', this);
        }.bind(this));
    }

    applyCheckoutTest() {
        const variant = this.getVariant('checkout_button');
        const config = this.experiments.checkout_button.variants[variant];
        
        const $buttons = $('.btn-checkout, .checkout-btn, .proceed-to-checkout, .checkout-button, a[href*="checkout"]');
        
        $buttons.each(function() {
            const $button = $(this);
            
            $button.css({
                'backgroundColor': config.color,
                'borderColor': config.color
            });
            
            const buttonText = $button.text().toLowerCase();
            if (buttonText.includes('checkout')) {
                $button.text(config.text);
            }
            
            this.trackConversion('checkout_button', this);
        }.bind(this));
    }

    applyBuyNowTest() {
        const variant = this.getVariant('buy_now_button');
        const config = this.experiments.buy_now_button.variants[variant];
        
        const $buttons = $('.btn-buy-now, .buy-now-btn, .buy-now, .purchase-btn');
        
        $buttons.each(function() {
            const $button = $(this);
            
            $button.css({
                'backgroundColor': config.color,
                'borderColor': config.color
            });
            
            const buttonText = $button.text().toLowerCase();
            if (buttonText.includes('buy now') || buttonText.includes('purchase')) {
                $button.text(config.text);
            }
            
            this.trackConversion('buy_now_button', this);
        }.bind(this));
    }

    init() {
        // Wait for jQuery to be ready
        if (typeof $ !== 'undefined') {
            $(document).ready(() => {
                // Run all A/B tests
                this.applyAddToCartTest();
                this.applyCheckoutTest();
                this.applyBuyNowTest();
                
                console.log('A/B Testing initialized with jQuery');
            });
        } else {
            // Fallback to vanilla JS if jQuery not available
            document.addEventListener('DOMContentLoaded', () => {
                this.applyAddToCartTest();
                this.applyCheckoutTest();
                this.applyBuyNowTest();
                
                console.log('A/B Testing initialized (vanilla JS)');
            });
        }
    }
}

// Initialize A/B Testing
window.abTestManager = new ABTestManager();
window.abTestManager.init();