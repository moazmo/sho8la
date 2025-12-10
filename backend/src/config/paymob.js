// Paymob Egypt Payment Gateway Integration
const crypto = require('crypto');

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_HMAC = process.env.PAYMOB_HMAC;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID || '5140095'; // Card integration
const PAYMOB_WALLET_INTEGRATION = process.env.PAYMOB_WALLET_INTEGRATION || '5431613'; // Wallet integration

const PAYMOB_API = 'https://accept.paymob.com/api';

class Paymob {
    static async getToken() {
        const res = await fetch(`${PAYMOB_API}/auth/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: PAYMOB_API_KEY })
        });
        const data = await res.json();
        return data.token;
    }

    static async createOrder(token, amountCents, merchantOrderId) {
        const res = await fetch(`${PAYMOB_API}/ecommerce/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                auth_token: token,
                delivery_needed: false,
                amount_cents: amountCents,
                merchant_order_id: merchantOrderId,
                currency: 'EGP',
                items: []
            })
        });
        return res.json();
    }

    static async getPaymentKey(token, orderId, amountCents, billingData, integrationId) {
        const res = await fetch(`${PAYMOB_API}/acceptance/payment_keys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                auth_token: token,
                amount_cents: amountCents,
                expiration: 3600,
                order_id: orderId,
                billing_data: billingData,
                currency: 'EGP',
                integration_id: integrationId
            })
        });
        return res.json();
    }

    static async initiatePayment(amount, orderId, user, method = 'card') {
        const token = await this.getToken();
        const amountCents = Math.round(amount * 100);

        const order = await this.createOrder(token, amountCents, orderId);

        const billingData = {
            first_name: user.name?.split(' ')[0] || 'User',
            last_name: user.name?.split(' ').slice(1).join(' ') || 'Name',
            email: user.email || 'user@example.com',
            phone_number: '+201000000000',
            apartment: 'NA', building: 'NA', floor: 'NA',
            street: 'NA', city: 'Cairo', country: 'EG',
            state: 'Cairo', postal_code: '00000'
        };

        const integrationId = method === 'wallet' ? PAYMOB_WALLET_INTEGRATION : PAYMOB_INTEGRATION_ID;
        const paymentKey = await this.getPaymentKey(token, order.id, amountCents, billingData, integrationId);

        return {
            paymentKey: paymentKey.token,
            orderId: order.id,
            iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/908498?payment_token=${paymentKey.token}`
        };
    }

    // Simplified deposit for wallet top-up
    static async initiateDeposit(amount, userId, method = 'card') {
        const token = await this.getToken();
        const amountCents = Math.round(amount * 100);
        const orderId = `deposit_${userId}_${Date.now()}`;

        const order = await this.createOrder(token, amountCents, orderId);

        const billingData = {
            first_name: 'User', last_name: 'Deposit',
            email: 'deposit@sho8la.com', phone_number: '+201000000000',
            apartment: 'NA', building: 'NA', floor: 'NA',
            street: 'NA', city: 'Cairo', country: 'EG',
            state: 'Cairo', postal_code: '00000'
        };

        const integrationId = method === 'wallet' ? PAYMOB_WALLET_INTEGRATION : PAYMOB_INTEGRATION_ID;
        const paymentKey = await this.getPaymentKey(token, order.id, amountCents, billingData, integrationId);

        return {
            paymentKey: paymentKey.token,
            orderId: order.id,
            iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/931262?payment_token=${paymentKey.token}`,
            method
        };
    }

    static verifyHmac(data, receivedHmac) {
        const fields = [
            'amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction',
            'id', 'integration_id', 'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded',
            'is_standalone_payment', 'is_voided', 'order.id', 'owner', 'pending',
            'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success'
        ];

        const concatenated = fields.map(f => {
            const keys = f.split('.');
            let val = data;
            for (const k of keys) val = val?.[k];
            return val ?? '';
        }).join('');

        const hash = crypto.createHmac('sha512', PAYMOB_HMAC).update(concatenated).digest('hex');
        return hash === receivedHmac;
    }
}

module.exports = Paymob;
