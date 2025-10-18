from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

# Rate limiting
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per 15 minutes"]
)
limiter.init_app(app)


# In-memory payment store (for demo purposes)
payments = [
    {
        "id": "pay_001",
        "user_id": 1,
        "amount": 150.00,
        "currency": "USD",
        "status": "completed",
        "created_at": "2024-01-15T10:30:00Z"
    },
    {
        "id": "pay_002", 
        "user_id": 2,
        "amount": 75.50,
        "currency": "USD",
        "status": "pending",
        "created_at": "2024-01-15T11:15:00Z"
    }
]

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "payment-processing-api",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0"
    })

@app.route('/api/payments', methods=['GET'])
def get_payments():
    return jsonify({
        "success": True,
        "data": payments,
        "count": len(payments)
    })

@app.route('/api/payments/<payment_id>', methods=['GET'])
def get_payment(payment_id):
    payment = next((p for p in payments if p["id"] == payment_id), None)
    if not payment:
        return jsonify({
            "success": False,
            "message": "Payment not found"
        }), 404
    
    return jsonify({
        "success": True,
        "data": payment
    })

@app.route('/api/payments', methods=['POST'])
@limiter.limit("10 per minute")
def create_payment():
    data = request.get_json()
    
    if not data or not all(k in data for k in ("user_id", "amount", "currency")):
        return jsonify({
            "success": False,
            "message": "user_id, amount, and currency are required"
        }), 400
    
    # Validate amount
    try:
        amount = float(data["amount"])
        if amount <= 0:
            raise ValueError("Amount must be positive")
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Invalid amount"
        }), 400
    
    # Create new payment
    new_payment = {
        "id": f"pay_{str(uuid.uuid4())[:8]}",
        "user_id": data["user_id"],
        "amount": amount,
        "currency": data["currency"],
        "status": "pending",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    payments.append(new_payment)
    
    return jsonify({
        "success": True,
        "data": new_payment,
        "message": "Payment created successfully"
    }), 201

@app.route('/api/payments/<payment_id>/process', methods=['POST'])
@limiter.limit("5 per minute")
def process_payment(payment_id):
    payment = next((p for p in payments if p["id"] == payment_id), None)
    if not payment:
        return jsonify({
            "success": False,
            "message": "Payment not found"
        }), 404
    
    if payment["status"] != "pending":
        return jsonify({
            "success": False,
            "message": f"Payment is already {payment['status']}"
        }), 400
    
    # Simulate payment processing
    import random
    success = random.choice([True, True, True, False])  # 75% success rate
    
    if success:
        payment["status"] = "completed"
        message = "Payment processed successfully"
    else:
        payment["status"] = "failed"
        message = "Payment processing failed"
    
    return jsonify({
        "success": success,
        "data": payment,
        "message": message
    })

@app.route('/api/payments/user/<int:user_id>', methods=['GET'])
def get_user_payments(user_id):
    user_payments = [p for p in payments if p["user_id"] == user_id]
    return jsonify({
        "success": True,
        "data": user_payments,
        "count": len(user_payments)
    })

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "success": False,
        "message": "Rate limit exceeded"
    }), 429

@app.errorhandler(404)
def not_found_handler(e):
    return jsonify({
        "success": False,
        "message": "Route not found"
    }), 404

@app.errorhandler(500)
def internal_error_handler(e):
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3002))
    app.run(host='0.0.0.0', port=port, debug=False)

