from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
import requests
import jwt
import secrets
import os
import smtplib
from email.message import EmailMessage
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()
# =========================================
# CASHFREE CONFIGURATION
# =========================================

CASHFREE_APP_ID = os.getenv("CASHFREE_APP_ID", "").strip()
CASHFREE_SECRET_KEY = os.getenv("CASHFREE_SECRET_KEY", "").strip()
CASHFREE_ENV = os.getenv("CASHFREE_ENV", "sandbox").strip().lower()

if CASHFREE_ENV == "production":
    CASHFREE_BASE_URL = "https://api.cashfree.com/pg"
else:
    CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg"

# =========================================
# FLASK APP
# =========================================

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": [
    "http://localhost:5173",
    "https://qaverin-perfume-ecommerce.vercel.app"
]}})


# =========================================
# PASSWORD RESET STORE
# =========================================
# Temporary in-memory storage for password reset
# OTPs. This is suitable for local development.
# For production, use a database/Redis and send
# the OTP through email or SMS.
password_reset_store = {}


# =========================================
# JWT SECRET KEY
# =========================================

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "").strip()

if not SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY is not configured. Set it in the backend .env file."
    )


# =========================================
# EMAIL CONFIGURATION - GMAIL
# =========================================
# Set these environment variables before starting Flask:
# QAVERIN_MAIL_USERNAME = your Gmail address
# QAVERIN_MAIL_APP_PASSWORD = your 16-character Gmail App Password
#
# Do NOT use your normal Gmail password here.
MAIL_USERNAME = os.getenv("QAVERIN_MAIL_USERNAME", "").strip()
MAIL_APP_PASSWORD = os.getenv("QAVERIN_MAIL_APP_PASSWORD", "").strip()


# =========================================
# SEND PASSWORD RESET EMAIL
# =========================================
def send_password_reset_email(recipient_email, reset_code):

    if not MAIL_USERNAME or not MAIL_APP_PASSWORD:
        raise RuntimeError(
            "Email is not configured. Set QAVERIN_MAIL_USERNAME "
            "and QAVERIN_MAIL_APP_PASSWORD."
        )

    message = EmailMessage()
    message["Subject"] = "Qaverin - Password Reset Code"
    message["From"] = f"Qaverin <{MAIL_USERNAME}>"
    message["To"] = recipient_email

    message.set_content(
        f"""QAVERIN

Password Reset Request

Hello,

We received a request to reset your Qaverin account password.

Your 6-digit password reset code is:

    {reset_code}

IMPORTANT: This reset code is valid for 10 minutes only.
After 10 minutes, the code will expire and you will need to request a new code.

For your security, do not share this code with anyone.

If you did not request a password reset, you can safely ignore this email.

Regards,
Qaverin Team
"""
    )

    with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as smtp:
        smtp.starttls()
        smtp.login(MAIL_USERNAME, MAIL_APP_PASSWORD)
        smtp.send_message(message)


# =========================================
# MYSQL CONFIGURATION
# =========================================

DB_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "127.0.0.1").strip(),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
    "user": os.getenv("MYSQL_USER", "root").strip(),
    "password": os.getenv("MYSQL_PASSWORD", "").strip(),
    "database": os.getenv("MYSQL_DATABASE", "qaverin_db").strip(),
    "connection_timeout": 10,
    "autocommit": False,
    "ssl_disabled": False
}

# =========================================
# DATABASE CONNECTION HELPER
# =========================================

def get_db_connection():

    try:

        connection = mysql.connector.connect(
            **DB_CONFIG
        )

        if connection.is_connected():

            return connection

        return None

    except mysql.connector.Error as error:

        print(
            "MySQL connection error:",
            error
        )

        return None


# =========================================
# CLOSE DATABASE CONNECTION
# =========================================

def close_db(connection, cursor=None):

    try:

        if cursor:
            cursor.close()

    except Exception:
        pass


    try:

        if connection and connection.is_connected():
            connection.close()

    except Exception:
        pass


# =========================================
# HOME API
# =========================================

@app.route("/")
def home():

    return "Qaverin Backend Running!"


# =========================================
# DATABASE TEST
# =========================================

@app.route("/db-test")
def db_test():

    connection = get_db_connection()

    if connection:

        connection.close()

        return "MySQL Connected Successfully!"

    return "MySQL Connection Failed!", 500


# =========================================
# REGISTER API
# =========================================

@app.route("/api/register", methods=["POST"])
def register():

    connection = None
    cursor = None

    try:

        data = request.get_json() or {}

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")


        # =================================
        # VALIDATION
        # =================================

        if not name or not email or not password:

            return jsonify({
                "message":
                    "Name, email and password are required"
            }), 400


        # =================================
        # DATABASE
        # =================================

        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500


        # =================================
        # HASH PASSWORD
        # =================================

        password_hash = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        )


        cursor = connection.cursor()


        # =================================
        # INSERT USER
        # =================================

        cursor.execute(
            """
            INSERT INTO users
            (
                name,
                email,
                password_hash,
                role
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s
            )
            """,
            (
                name,
                email,
                password_hash.decode("utf-8"),
                "customer"
            )
        )


        connection.commit()


        return jsonify({
            "message":
                "Registration successful"
        }), 201


    except mysql.connector.Error as error:

        if connection:
            connection.rollback()

        print(
            "Register error:",
            error
        )


        return jsonify({
            "message":
                "Registration failed",
            "error":
                str(error)
        }), 500


    except Exception as error:

        if connection:
            connection.rollback()

        print(
            "Register error:",
            error
        )


        return jsonify({
            "message":
                "Registration failed"
        }), 500


    finally:

        close_db(
            connection,
            cursor
        )


# =========================================
# LOGIN API
# =========================================

@app.route("/api/login", methods=["POST"])
def login():

    connection = None
    cursor = None

    try:

        data = request.get_json() or {}

        email = data.get("email")
        password = data.get("password")


        if not email or not password:

            return jsonify({
                "message":
                    "Email and password are required"
            }), 400


        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500


        cursor = connection.cursor(
            dictionary=True
        )


        # =================================
        # FIND USER
        # =================================

        cursor.execute(
            """
            SELECT *
            FROM users
            WHERE email = %s
            """,
            (email,)
        )


        user = cursor.fetchone()


        if not user:

            return jsonify({
                "message":
                    "Invalid email or password"
            }), 401


        # =================================
        # CHECK PASSWORD
        # =================================

        password_correct = bcrypt.checkpw(
            password.encode("utf-8"),
            user["password_hash"].encode("utf-8")
        )


        if not password_correct:

            return jsonify({
                "message":
                    "Invalid email or password"
            }), 401


        # =================================
        # CREATE JWT
        # =================================

        token = jwt.encode(
            {
                "user_id":
                    user["id"],

                "email":
                    user["email"],

                "exp":
                    datetime.now(timezone.utc)
                    + timedelta(hours=24)

            },
            SECRET_KEY,
            algorithm="HS256"
        )


        return jsonify({

            "message":
                "Login successful",

            "token":
                token,

            "user": {

                "id":
                    user["id"],

                "name":
                    user["name"],

                "email":
                    user["email"],

                "role":
                    user["role"]

            }

        }), 200


    except Exception as error:

        print(
            "Login error:",
            error
        )


        return jsonify({
            "message":
                "Login failed"
        }), 500


    finally:

        close_db(
            connection,
            cursor
        )


# =========================================
# FORGOT PASSWORD API
# =========================================

@app.route(
    "/api/forgot-password",
    methods=["POST"]
)
def forgot_password():
    connection = None
    cursor = None

    try:
        data = request.get_json() or {}
        email = str(
            data.get("email", "")
        ).strip().lower()

        if not email:
            return jsonify({
                "message": "Email address is required"
            }), 400

        connection = get_db_connection()

        if not connection:
            return jsonify({
                "message": "Database connection failed"
            }), 500

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute(
            """
            SELECT id, email
            FROM users
            WHERE LOWER(email) = %s
            """,
            (email,)
        )

        user = cursor.fetchone()

        # Do not reveal whether an email exists.
        if not user:
            return jsonify({
                "message":
                    "If this email is registered, a reset code has been generated."
            }), 200

        # Generate a 6-digit OTP.
        otp = f"{secrets.randbelow(1000000):06d}"

        password_reset_store[email] = {
            "user_id": user["id"],
            "otp": otp,
            "expires_at":
                datetime.now(timezone.utc)
                + timedelta(minutes=10)
        }

        # Send the reset code to the user's registered email.
        try:
            send_password_reset_email(
                user["email"],
                otp
            )
        except Exception as mail_error:
            password_reset_store.pop(email, None)
            print(
                "Password reset email error:",
                mail_error
            )

            return jsonify({
                "message":
                    "Unable to send the reset code email. Please check the email configuration."
            }), 500

        # Never return the reset code to the frontend.
        return jsonify({
            "message":
                "A 6-digit reset code has been sent to your registered email address.",
            "expires_in_minutes": 10
        }), 200

    except mysql.connector.Error as error:
        print(
            "Forgot password MySQL error:",
            error
        )

        return jsonify({
            "message":
                "Unable to process password recovery"
        }), 500

    except Exception as error:
        print(
            "Forgot password error:",
            error
        )

        return jsonify({
            "message":
                "Unable to process password recovery"
        }), 500

    finally:
        close_db(
            connection,
            cursor
        )


# =========================================
# RESET PASSWORD API
# =========================================

@app.route(
    "/api/reset-password",
    methods=["POST"]
)
def reset_password():
    connection = None
    cursor = None

    try:
        data = request.get_json() or {}

        email = str(
            data.get("email", "")
        ).strip().lower()

        otp = str(
            data.get("otp", "")
        ).strip()

        new_password = str(
            data.get("new_password", "")
        )

        if not email or not otp or not new_password:
            return jsonify({
                "message":
                    "Email, reset code and new password are required"
            }), 400

        if len(new_password) < 6:
            return jsonify({
                "message":
                    "New password must be at least 6 characters"
            }), 400

        reset_data = password_reset_store.get(
            email
        )

        if not reset_data:
            return jsonify({
                "message":
                    "Reset code is invalid or expired"
            }), 400

        if datetime.now(timezone.utc) > reset_data["expires_at"]:
            password_reset_store.pop(
                email,
                None
            )

            return jsonify({
                "message":
                    "Reset code has expired. Please request a new code."
            }), 400

        if not secrets.compare_digest(
            otp,
            reset_data["otp"]
        ):
            return jsonify({
                "message":
                    "Invalid reset code"
            }), 400

        # Do not allow the user to reuse the same password.
        connection = get_db_connection()

        if not connection:
            return jsonify({
                "message":
                    "Database connection failed"
            }), 500

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute(
            """
            SELECT password_hash
            FROM users
            WHERE id = %s
            """,
            (reset_data["user_id"],)
        )

        current_user = cursor.fetchone()

        if current_user and bcrypt.checkpw(
            new_password.encode("utf-8"),
            current_user["password_hash"].encode("utf-8")
        ):
            connection.rollback()
            return jsonify({
                "message":
                    "You cannot use the same password. Please enter a different password."
            }), 400

        password_hash = bcrypt.hashpw(
            new_password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE users
            SET password_hash = %s
            WHERE id = %s
            """,
            (
                password_hash,
                reset_data["user_id"]
            )
        )

        if cursor.rowcount == 0:
            connection.rollback()

            return jsonify({
                "message":
                    "Unable to update password"
            }), 400

        connection.commit()

        password_reset_store.pop(
            email,
            None
        )

        return jsonify({
            "message":
                "Password reset successfully. You can now login with your new password."
        }), 200

    except mysql.connector.Error as error:
        if connection:
            connection.rollback()

        print(
            "Reset password MySQL error:",
            error
        )

        return jsonify({
            "message":
                "Unable to reset password"
        }), 500

    except Exception as error:
        if connection:
            connection.rollback()

        print(
            "Reset password error:",
            error
        )

        return jsonify({
            "message":
                "Unable to reset password"
        }), 500

    finally:
        close_db(
            connection,
            cursor
        )


# =========================================
# PROFILE API
# =========================================

@app.route("/api/profile", methods=["GET"])
def profile():

    auth_header = request.headers.get(
        "Authorization"
    )


    if not auth_header:

        return jsonify({
            "message":
                "Authorization token is required"
        }), 401


    if not auth_header.startswith("Bearer "):

        return jsonify({
            "message":
                "Invalid authorization format"
        }), 401


    token = auth_header.split(" ", 1)[1]

    connection = None
    cursor = None


    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )


        user_id = payload["user_id"]


        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500


        cursor = connection.cursor(
            dictionary=True
        )


        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )


        user = cursor.fetchone()


        if not user:

            return jsonify({
                "message":
                    "User not found"
            }), 404


        return jsonify({

            "message":
                "Profile accessed successfully",

            "user":
                user

        }), 200


    except jwt.ExpiredSignatureError:

        return jsonify({
            "message":
                "Token has expired"
        }), 401


    except jwt.InvalidTokenError:

        return jsonify({
            "message":
                "Invalid token"
        }), 401


    except Exception as error:

        print(
            "Profile error:",
            error
        )


        return jsonify({
            "message":
                "Unable to fetch profile"
        }), 500


    finally:

        close_db(
            connection,
            cursor
        )


# =========================================
# GET ALL PRODUCTS
# =========================================

@app.route("/api/products", methods=["GET"])
def get_products():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500


        cursor = connection.cursor(
            dictionary=True
        )


        cursor.execute(
            """
            SELECT
                id,
                name,
                brand,
                price,
                description,
                image,
                category,
                stock
            FROM products
            ORDER BY id DESC
            """
        )


        products = cursor.fetchall()


        return jsonify({

            "products":
                products

        }), 200


    except Exception as error:

        print(
            "Get products error:",
            error
        )


        return jsonify({
            "message":
                "Unable to fetch products"
        }), 500


    finally:

        close_db(
            connection,
            cursor
        )


# =========================================
# ADD PRODUCT TO CART
# =========================================

@app.route("/api/cart", methods=["POST"])
def add_to_cart():

    auth_header = request.headers.get(
        "Authorization"
    )


    if not auth_header:

        return jsonify({
            "message":
                "Authorization token is required"
        }), 401


    if not auth_header.startswith("Bearer "):

        return jsonify({
            "message":
                "Invalid authorization format"
        }), 401


    token = auth_header.split(" ", 1)[1]

    connection = None
    cursor = None


    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )


        user_id = payload["user_id"]


        data = request.get_json() or {}


        product_id = data.get(
            "product_id"
        )


        quantity = int(
            data.get(
                "quantity",
                1
            )
        )


        if not product_id:

            return jsonify({
                "message":
                    "Product ID is required"
            }), 400


        if quantity < 1:

            return jsonify({
                "message":
                    "Quantity must be at least 1"
            }), 400


        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500


        cursor = connection.cursor(
            dictionary=True
        )


        # =================================
        # CHECK PRODUCT
        # =================================

        cursor.execute(
            """
            SELECT id, stock
            FROM products
            WHERE id = %s
            """,
            (product_id,)
        )


        product = cursor.fetchone()


        if not product:

            return jsonify({
                "message":
                    "Product not found"
            }), 404


        if product["stock"] <= 0:

            return jsonify({
                "message":
                    "Product is out of stock"
            }), 400


        if quantity > product["stock"]:

            return jsonify({
                "message":
                    f"Only {product['stock']} item(s) available"
            }), 400


        # =================================
        # CHECK EXISTING ITEM
        # =================================

        cursor.execute(
            """
            SELECT
                id,
                quantity
            FROM cart_items
            WHERE user_id = %s
            AND product_id = %s
            """,
            (
                user_id,
                product_id
            )
        )


        existing_item = cursor.fetchone()


        if existing_item:

            new_quantity = (
                existing_item["quantity"]
                + quantity
            )


            if new_quantity > product["stock"]:

                return jsonify({
                    "message":
                        f"Only {product['stock']} item(s) available"
                }), 400


            cursor.execute(
                """
                UPDATE cart_items
                SET quantity = %s
                WHERE id = %s
                """,
                (
                    new_quantity,
                    existing_item["id"]
                )
            )


        else:

            cursor.execute(
                """
                INSERT INTO cart_items
                (
                    user_id,
                    product_id,
                    quantity
                )
                VALUES
                (
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    user_id,
                    product_id,
                    quantity
                )
            )


        connection.commit()


        return jsonify({
            "message":
                "Product added to cart"
        }), 201


    except jwt.ExpiredSignatureError:

        return jsonify({
            "message":
                "Token has expired"
        }), 401


    except jwt.InvalidTokenError:

        return jsonify({
            "message":
                "Invalid token"
        }), 401


    except Exception as error:

        if connection:
            connection.rollback()

        print(
            "Add cart error:",
            error
        )


        return jsonify({
            "message":
                "Unable to add product to cart"
        }), 500


    finally:

        close_db(
            connection,
            cursor
        )


# =========================================
# GET USER CART
# =========================================

@app.route("/api/cart", methods=["GET"])
def get_cart():

    auth_header = request.headers.get(
        "Authorization"
    )


    if not auth_header:

        return jsonify({
            "message":
                "Authorization token is required"
        }), 401


    if not auth_header.startswith("Bearer "):

        return jsonify({
            "message":
                "Invalid authorization format"
        }), 401


    token = auth_header.split(" ", 1)[1]

    connection = None
    cursor = None


    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )


        user_id = payload["user_id"]


        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500


        cursor = connection.cursor(
            dictionary=True
        )


        cursor.execute(
            """
            SELECT

                cart_items.id AS cart_id,

                cart_items.product_id,

                cart_items.quantity,

                products.name,

                products.brand,

                products.price,

                products.stock,

                products.description,

                products.image,

                products.category

            FROM cart_items

            INNER JOIN products
                ON cart_items.product_id =
                   products.id

            WHERE cart_items.user_id = %s

            ORDER BY cart_items.id DESC
            """,
            (user_id,)
        )


        cart_items = cursor.fetchall()


        return jsonify({

            "message":
                "Cart fetched successfully",

            "cart":
                cart_items

        }), 200


    except jwt.ExpiredSignatureError:

        return jsonify({
            "message":
                "Token has expired"
        }), 401


    except jwt.InvalidTokenError:

        return jsonify({
            "message":
                "Invalid token"
        }), 401


    except Exception as error:

        print(
            "Get cart error:",
            error
        )


        return jsonify({
            "message":
                "Unable to fetch cart"
        }), 500


    finally:

        close_db(
            connection,
            cursor
        )


# =========================================
# UPDATE CART QUANTITY
# =========================================

@app.route(
    "/api/cart/<int:cart_identifier>",
    methods=["PUT"]
)
def update_cart_quantity(cart_identifier):

    auth_header = request.headers.get(
        "Authorization"
    )

    if not auth_header:
        return jsonify({
            "message":
                "Authorization token is required"
        }), 401

    if not auth_header.startswith("Bearer "):
        return jsonify({
            "message":
                "Invalid authorization format"
        }), 401

    token = auth_header.split(" ", 1)[1]

    connection = None
    cursor = None

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = payload["user_id"]

        data = request.get_json() or {}

        quantity = int(
            data.get(
                "quantity",
                1
            )
        )

        if quantity < 1:
            return jsonify({
                "message":
                    "Quantity must be at least 1"
            }), 400

        connection = get_db_connection()

        if not connection:
            return jsonify({
                "message":
                    "Database connection failed"
            }), 500

        cursor = connection.cursor(
            dictionary=True
        )

        # First treat the URL value as cart item id.
        cursor.execute(
            """
            SELECT
                cart_items.id AS cart_id,
                cart_items.product_id,
                products.stock
            FROM cart_items
            INNER JOIN products
                ON cart_items.product_id = products.id
            WHERE cart_items.id = %s
            AND cart_items.user_id = %s
            """,
            (cart_identifier, user_id)
        )

        cart_item = cursor.fetchone()

        # If not found, also support product id.
        if not cart_item:
            cursor.execute(
                """
                SELECT
                    cart_items.id AS cart_id,
                    cart_items.product_id,
                    products.stock
                FROM cart_items
                INNER JOIN products
                    ON cart_items.product_id = products.id
                WHERE cart_items.product_id = %s
                AND cart_items.user_id = %s
                """,
                (cart_identifier, user_id)
            )

            cart_item = cursor.fetchone()

        if not cart_item:
            return jsonify({
                "message":
                    "Cart item not found"
            }), 404

        stock = cart_item["stock"]

        if stock <= 0:
            return jsonify({
                "message":
                    "Product is out of stock"
            }), 400

        if quantity > stock:
            return jsonify({
                "message":
                    f"Only {stock} item(s) available"
            }), 400

        cursor.execute(
            """
            UPDATE cart_items
            SET quantity = %s
            WHERE id = %s
            AND user_id = %s
            """,
            (
                quantity,
                cart_item["cart_id"],
                user_id
            )
        )

        connection.commit()

        return jsonify({
            "message":
                "Cart quantity updated successfully"
        }), 200

    except jwt.ExpiredSignatureError:
        return jsonify({
            "message":
                "Token has expired"
        }), 401

    except jwt.InvalidTokenError:
        return jsonify({
            "message":
                "Invalid token"
        }), 401

    except ValueError:
        return jsonify({
            "message":
                "Invalid quantity"
        }), 400

    except Exception as error:

        if connection:
            connection.rollback()

        print(
            "Update cart error:",
            error
        )

        return jsonify({
            "message":
                "Unable to update cart"
        }), 500

    finally:
        close_db(
            connection,
            cursor
        )


# =========================================
# REMOVE PRODUCT FROM CART
# =========================================

@app.route(
    "/api/cart/<int:product_id>",
    methods=["DELETE"]
)
def remove_from_cart(product_id):

    auth_header = request.headers.get(
        "Authorization"
    )


    if not auth_header:

        return jsonify({
            "message":
                "Authorization token is required"
        }), 401


    if not auth_header.startswith("Bearer "):

        return jsonify({
            "message":
                "Invalid authorization format"
        }), 401


    token = auth_header.split(" ", 1)[1]

    connection = None
    cursor = None


    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )


        user_id = payload["user_id"]


        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500


        cursor = connection.cursor()


        cursor.execute(
            """
            DELETE FROM cart_items
            WHERE user_id = %s
            AND product_id = %s
            """,
            (
                user_id,
                product_id
            )
        )


        connection.commit()


        affected_rows = cursor.rowcount


        if affected_rows == 0:

            return jsonify({
                "message":
                    "Cart item not found"
            }), 404


        return jsonify({
            "message":
                "Product removed from cart"
        }), 200


    except jwt.ExpiredSignatureError:

        return jsonify({
            "message":
                "Token has expired"
        }), 401


    except jwt.InvalidTokenError:

        return jsonify({
            "message":
                "Invalid token"
        }), 401


    except Exception as error:

        if connection:
            connection.rollback()

        print(
            "Remove cart error:",
            error
        )


        return jsonify({
            "message":
                "Unable to remove cart item"
        }), 500


    finally:

        close_db(
            connection,
            cursor
        )

# =========================================
# CASHFREE CREATE PAYMENT API
# =========================================

@app.route(
    "/api/payment/create",
    methods=["POST"]
)
def create_cashfree_payment():

    auth_header = request.headers.get(
        "Authorization"
    )

    if not auth_header:
        return jsonify({
            "message": "Authorization token is required"
        }), 401

    if not auth_header.startswith("Bearer "):
        return jsonify({
            "message": "Invalid authorization format"
        }), 401

    token = auth_header.split(" ", 1)[1]

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = payload["user_id"]

        data = request.get_json() or {}

        amount = float(
            data.get("amount", 0)
        )

        customer = data.get(
            "customer",
            {}
        )

        # Payment method selected on the Qaverin checkout page.
        # This is stored with the pending Cashfree checkout so
        # the same method (UPI or card) appears in My Orders.
        payment_method = str(
            data.get("payment_method", "card")
        ).strip().lower()

        if payment_method not in ["card", "upi"]:
            return jsonify({
                "message":
                    "Invalid payment method"
            }), 400

        customer_name = str(
            customer.get("name", "")
        ).strip()

        email = str(
            customer.get("email", "")
        ).strip()

        phone = str(
            customer.get("phone", "")
        ).strip()

        if amount <= 0:
            return jsonify({
                "message": "Invalid amount"
            }), 400

        if not customer_name:
            return jsonify({
                "message": "Customer name is required"
            }), 400

        if not email:
            return jsonify({
                "message": "Customer email is required"
            }), 400

        if not phone:
            return jsonify({
                "message": "Customer phone is required"
            }), 400

        order_id = (
            f"QAVERIN_{user_id}_"
            f"{int(datetime.now().timestamp())}"
        )

        headers = {
            "Content-Type": "application/json",
            "x-client-id": CASHFREE_APP_ID,
            "x-client-secret": CASHFREE_SECRET_KEY,
            "x-api-version": "2025-01-01"
        }

        cashfree_data = {

            "order_id": order_id,

            "order_amount": round(
                amount,
                2
            ),

            "order_currency": "INR",

            "customer_details": {

                "customer_id":
                    str(user_id),

                "customer_name":
                    customer_name,

                "customer_email":
                    email,

                "customer_phone":
                    phone
            },

            "order_meta": {

               "return_url":
                    "https://qaverin-perfume-ecommerce.vercel.app/payment-success?order_id={order_id}"
            }
        }

        response = requests.post(
            f"{CASHFREE_BASE_URL}/orders",
            headers=headers,
            json=cashfree_data,
            timeout=30
        )

        response_data = response.json()

        if response.status_code not in [200, 201]:

            print(
                "Cashfree error:",
                response_data
            )

            return jsonify({
                "message":
                    "Unable to create Cashfree payment",
                "error":
                    response_data
            }), 500

        # =================================
        # SAVE PENDING CHECKOUT INFORMATION
        # =================================
        #
        # Cashfree redirects the customer away from
        # Qaverin. Save the checkout information in
        # MySQL so it is available when the customer
        # returns after payment.
        #
        pending_connection = None
        pending_cursor = None

        try:

            pending_connection = get_db_connection()

            if not pending_connection:
                return jsonify({
                    "message":
                        "Payment was created, but pending checkout information could not be saved."
                }), 500

            pending_cursor = pending_connection.cursor()

            pending_cursor.execute(
                """
                INSERT INTO cashfree_pending_orders
                (
                    user_id,
                    cashfree_order_id,
                    total_amount,
                    customer_name,
                    email,
                    phone,
                    address,
                    city,
                    state,
                    pincode,
                    payment_method
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    user_id,
                    response_data.get("order_id"),
                    round(amount, 2),
                    customer_name,
                    email,
                    phone,
                    str(customer.get("address", "")).strip(),
                    str(customer.get("city", "")).strip(),
                    str(customer.get("state", "")).strip(),
                    str(customer.get("pincode", "")).strip(),
                    payment_method
                )
            )

            pending_connection.commit()

        except Exception as pending_error:

            if pending_connection:
                pending_connection.rollback()

            print(
                "Pending Cashfree order save error:",
                pending_error
            )

            return jsonify({
                "message":
                    "Payment was created, but checkout information could not be saved."
            }), 500

        finally:

            close_db(
                pending_connection,
                pending_cursor
            )

        return jsonify({

            "message":
                "Cashfree payment created",

            "order_id":
                response_data.get(
                    "order_id"
                ),

            "payment_session_id":
                response_data.get(
                    "payment_session_id"
                )

        }), 200

    except jwt.ExpiredSignatureError:

        return jsonify({
            "message": "Token has expired"
        }), 401

    except jwt.InvalidTokenError:

        return jsonify({
            "message": "Invalid token"
        }), 401

    except Exception as error:

        print(
            "Cashfree payment error:",
            error
        )

        return jsonify({
            "message":
                "Unable to create payment"
        }), 500
        
# =========================================
# VERIFY CASHFREE PAYMENT
# =========================================

@app.route(
    "/api/payment/verify",
    methods=["POST"]
)
def verify_cashfree_payment():

    auth_header = request.headers.get(
        "Authorization"
    )

    if not auth_header:

        return jsonify({
            "message":
                "Authorization token is required"
        }), 401


    if not auth_header.startswith("Bearer "):

        return jsonify({
            "message":
                "Invalid authorization format"
        }), 401


    token = auth_header.split(
        " ",
        1
    )[1]


    try:

        # =================================
        # VERIFY JWT
        # =================================

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = payload["user_id"]


        # =================================
        # GET CASHFREE ORDER ID
        # =================================

        data = request.get_json() or {}

        order_id = str(
            data.get(
                "order_id",
                ""
            )
        ).strip()


        if not order_id:

            return jsonify({
                "message":
                    "Cashfree order ID is required"
            }), 400


        # =================================
        # CASHFREE API
        # =================================

        url = (
            f"{CASHFREE_BASE_URL}"
            f"/orders/{order_id}/payments"
        )


        headers = {

            "x-client-id":
                CASHFREE_APP_ID,

            "x-client-secret":
                CASHFREE_SECRET_KEY,

            "x-api-version":
                "2025-01-01",

            "Content-Type":
                "application/json",

        }


        response = requests.get(
            url,
            headers=headers,
            timeout=30
        )


        # =================================
        # CASHFREE RESPONSE
        # =================================

        if response.status_code != 200:

            print(
                "Cashfree verification error:",
                response.text
            )

            return jsonify({
                "message":
                    "Unable to verify payment with Cashfree"
            }), 502


        payments = response.json()


        # =================================
        # FIND SUCCESSFUL PAYMENT
        # =================================

        successful_payment = None


        if isinstance(
            payments,
            list
        ):

            for payment in payments:

                if (
                    payment.get(
                        "payment_status"
                    ) == "SUCCESS"
                ):

                    successful_payment = payment

                    break


        # =================================
        # PAYMENT SUCCESS
        # =================================

        if successful_payment:

            # =================================
            # GET SAVED CHECKOUT INFORMATION
            # =================================
            #
            # The order_id is linked to the logged-in
            # user. This prevents one user from using
            # another user's pending checkout details.
            #
            pending_connection = None
            pending_cursor = None
            pending_order = None

            try:

                pending_connection = get_db_connection()

                if not pending_connection:
                    return jsonify({
                        "message":
                            "Payment was successful, but checkout information could not be loaded."
                    }), 500

                pending_cursor = pending_connection.cursor(
                    dictionary=True
                )

                pending_cursor.execute(
                    """
                    SELECT
                        id,
                        user_id,
                        cashfree_order_id,
                        total_amount,
                        customer_name,
                        email,
                        phone,
                        address,
                        city,
                        state,
                        pincode,
                        payment_method
                    FROM cashfree_pending_orders
                    WHERE cashfree_order_id = %s
                    AND user_id = %s
                    LIMIT 1
                    """,
                    (
                        order_id,
                        user_id
                    )
                )

                pending_order = pending_cursor.fetchone()

            except Exception as pending_error:

                print(
                    "Pending Cashfree order fetch error:",
                    pending_error
                )

                return jsonify({
                    "message":
                        "Payment was successful, but checkout information could not be loaded."
                }), 500

            finally:

                close_db(
                    pending_connection,
                    pending_cursor
                )

            if not pending_order:

                return jsonify({
                    "message":
                        "Payment was successful, but checkout information was not found."
                }), 404

            customer = {
                "name":
                    pending_order["customer_name"],

                "email":
                    pending_order["email"],

                "phone":
                    pending_order["phone"],

                "address":
                    pending_order["address"],

                "city":
                    pending_order["city"],

                "state":
                    pending_order["state"],

                "pincode":
                    pending_order["pincode"]
            }

            return jsonify({

                "success":
                    True,

                "payment_status":
                    "SUCCESS",

                "order_id":
                    order_id,

                "payment":
                    successful_payment,

                "customer":
                    customer,

                "payment_method":
                    pending_order["payment_method"],

                "total_amount":
                    float(pending_order["total_amount"])

            }), 200


        # =================================
        # PAYMENT NOT SUCCESSFUL
        # =================================

        return jsonify({

            "success":
                False,

            "payment_status":
                "PENDING",

            "order_id":
                order_id,

            "message":
                "Payment is not successful yet."

        }), 200


    except jwt.ExpiredSignatureError:

        return jsonify({
            "message":
                "Token has expired"
        }), 401


    except jwt.InvalidTokenError:

        return jsonify({
            "message":
                "Invalid token"
        }), 401


    except Exception as error:

        print(
            "Cashfree verification error:",
            error
        )

        return jsonify({
            "message":
                "Unable to verify payment"
        }), 500

# =========================================
# CREATE ORDER API
# =========================================

@app.route(
    "/api/orders",
    methods=["POST"]
)
def create_order():

    auth_header = request.headers.get(
        "Authorization"
    )


    if not auth_header:

        return jsonify({
            "message":
                "Authorization token is required"
        }), 401


    if not auth_header.startswith("Bearer "):

        return jsonify({
            "message":
                "Invalid authorization format"
        }), 401


    token = auth_header.split(" ", 1)[1]

    connection = None
    cursor = None


    try:

        # =================================
        # VERIFY JWT
        # =================================

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )


        user_id = payload["user_id"]


        # =================================
        # DATABASE CONNECTION
        # =================================

        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500


        # =================================
        # CHECKOUT DATA
        # =================================

        data = request.get_json() or {}


        customer = data.get(
            "customer",
            {}
        )


        payment_method = (
            data.get("payment_method")
            or data.get("payment")
            or "cod"
        )
        
        cashfree_order_id = str(
    data.get(
        "cashfree_order_id",
        ""
    )
).strip()


        # =================================
        # ORDER STATUS
        # =================================

        if cashfree_order_id:
            order_status = "Confirmed"
        else:
            order_status = "Pending"


        # =================================
        # CUSTOMER INFORMATION
        # =================================

        customer_name = str(
            customer.get(
                "name",
                ""
            )
        ).strip()


        email = str(
            customer.get(
                "email",
                ""
            )
        ).strip()


        phone = str(
            customer.get(
                "phone",
                ""
            )
        ).strip()


        address = str(
            customer.get(
                "address",
                ""
            )
        ).strip()


        city = str(
            customer.get(
                "city",
                ""
            )
        ).strip()


        state = str(
            customer.get(
                "state",
                ""
            )
        ).strip()


        pincode = str(
            customer.get(
                "pincode",
                ""
            )
        ).strip()


        # =================================
        # VALIDATION
        # =================================

        required_fields = {

            "name":
                customer_name,

            "email":
                email,

            "phone":
                phone,

            "address":
                address,

            "city":
                city,

            "state":
                state,

            "pincode":
                pincode

        }


        for field, value in required_fields.items():

            if not value:

                return jsonify({
                    "message":
                        f"{field.capitalize()} is required"
                }), 400


        # =================================
        # CURSOR
        # =================================

        cursor = connection.cursor(
            dictionary=True
        )


        # =================================
        # GET USER CART
        # =================================

        cursor.execute(
            """
            SELECT

                c.product_id,

                c.quantity,

                p.name,

                p.price,

                p.description,

                p.image,

                p.category,

                p.brand,

                p.stock

            FROM cart_items c

            JOIN products p
                ON c.product_id = p.id

            WHERE c.user_id = %s

            ORDER BY c.id ASC
            """,
            (user_id,)
        )


        cart_items = cursor.fetchall()


        # =================================
        # EMPTY CART
        # =================================

        if not cart_items:

            return jsonify({
                "message":
                    "Your cart is empty"
            }), 400


        # =================================
        # VERIFY STOCK BEFORE ORDER
        # =================================

        for item in cart_items:

            stock = int(item["stock"] or 0)
            quantity = int(item["quantity"])

            if stock <= 0:
                return jsonify({
                    "message":
                        f"{item['name']} is currently out of stock."
                }), 400

            if quantity > stock:
                return jsonify({
                    "message":
                        f"Only {stock} item{'s' if stock != 1 else ''} available for {item['name']}."
                }), 400


        # =================================
        # CALCULATE TOTAL
        # =================================

        total_amount = 0


        for item in cart_items:

            total_amount += (
                float(item["price"])
                *
                int(item["quantity"])
            )


        # =================================
        # CREATE ORDER
        # =================================

        cursor.execute(
            """
           INSERT INTO orders
(
    user_id,
    total_amount,
    status,
    customer_name,
    email,
    phone,
    address,
    city,
    state,
    pincode,
    payment_method,
    cashfree_order_id
)
         VALUES
(
    %s,
    %s,
    %s,
    %s,
    %s,
    %s,
    %s,
    %s,
    %s,
    %s,
    %s,
    %s
)
            """,
            (
                user_id,
                total_amount,
                order_status,
                customer_name,
                email,
                phone,
                address,
                city,
                state,
                pincode,
                payment_method,
                cashfree_order_id
            )
        )


        order_id = cursor.lastrowid


        # =================================
        # CREATE ORDER ITEMS
        # =================================

        for item in cart_items:

            cursor.execute(
                """
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    quantity,
                    price
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    order_id,
                    item["product_id"],
                    item["quantity"],
                    item["price"]
                )
            )


        # =================================
        # REDUCE PRODUCT STOCK
        # =================================

        for item in cart_items:

            cursor.execute(
                """
                UPDATE products
                SET stock = stock - %s
                WHERE id = %s
                AND stock >= %s
                """,
                (
                    int(item["quantity"]),
                    item["product_id"],
                    int(item["quantity"])
                )
            )

            if cursor.rowcount == 0:
                connection.rollback()

                return jsonify({
                    "message":
                        f"Unable to update stock for {item['name']}."
                }), 400


        # =================================
        # CLEAR CART
        # =================================

        cursor.execute(
            """
            DELETE FROM cart_items
            WHERE user_id = %s
            """,
            (user_id,)
        )


        # =================================
        # COMMIT
        # =================================

        connection.commit()


        # =================================
        # RESPONSE
        # =================================

        return jsonify({

            "message":
                "Order created successfully",

            "order": {

                "id":
                    order_id,

                "user_id":
                    user_id,

                "total_amount":
                    total_amount,

                "status":
                    order_status,

                "customer_name":
                    customer_name,

                "email":
                    email,

                "phone":
                    phone,

                "address":
                    address,

                "city":
                    city,

                "state":
                    state,

                "pincode":
                    pincode,

                "payment_method":
                    payment_method,

                "items":
                    cart_items

            }

        }), 201


    except jwt.ExpiredSignatureError:

        return jsonify({
            "message":
                "Token has expired"
        }), 401


    except jwt.InvalidTokenError:

        return jsonify({
            "message":
                "Invalid token"
        }), 401


    except Exception as error:

        if connection:
            connection.rollback()

        print(
            "Create order error:",
            error
        )


        return jsonify({
            "message":
                "Unable to create order",
            "error":
                str(error)
        }), 500


    finally:

        close_db(
            connection,
            cursor
        )


# =========================================
# GET USER ORDERS API
# =========================================

@app.route(
    "/api/orders",
    methods=["GET"]
)
def get_orders():

    auth_header = request.headers.get(
        "Authorization"
    )


    if not auth_header:

        return jsonify({
            "message":
                "Authorization token is required"
        }), 401


    if not auth_header.startswith("Bearer "):

        return jsonify({
            "message":
                "Invalid authorization format"
        }), 401


    token = auth_header.split(" ", 1)[1]

    connection = None
    cursor = None


    try:

        # =================================
        # VERIFY JWT
        # =================================

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )


        user_id = payload["user_id"]


        # =================================
        # NEW MYSQL CONNECTION
        # =================================

        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500


        cursor = connection.cursor(
            dictionary=True
        )


        # =================================
        # GET ORDERS
        # =================================

        cursor.execute(
            """
            SELECT

                id,

                user_id,

                total_amount,

                status,

                created_at,

                customer_name,

                email,

                phone,

                address,

                city,

                state,

                pincode,

                payment_method

            FROM orders

            WHERE user_id = %s

            ORDER BY created_at DESC
            """,
            (user_id,)
        )


        orders = cursor.fetchall()
        
        


        # =================================
        # GET ORDER ITEMS
        # =================================

        for order in orders:

            cursor.execute(
                """
                SELECT

                    oi.id,

                    oi.product_id,

                    oi.quantity,

                    oi.price,

                    p.name,

                    p.brand,

                    p.description,

                    p.image,

                    p.category

                FROM order_items oi

                JOIN products p
                    ON oi.product_id = p.id

                WHERE oi.order_id = %s

                ORDER BY oi.id ASC
                """,
                (order["id"],)
            )


            order["items"] = cursor.fetchall()


        return jsonify({

            "message":
                "Orders fetched successfully",

            "orders":
                orders

        }), 200


    except jwt.ExpiredSignatureError:

        return jsonify({
            "message":
                "Token has expired"
        }), 401


    except jwt.InvalidTokenError:

        return jsonify({
            "message":
                "Invalid token"
        }), 401


    except mysql.connector.Error as error:

        print(
            "Get orders MySQL error:",
            error
        )


        return jsonify({
            "message":
                "Unable to fetch orders",
            "error":
                str(error)
        }), 500


    except Exception as error:

        print(
            "Get orders error:",
            error
        )


        return jsonify({
            "message":
                "Unable to fetch orders"
        }), 500


    finally:

        close_db(
            connection,
            cursor
        )



# =========================================
# CUSTOMER CANCEL ORDER API
# =========================================

@app.route(
    "/api/orders/<int:order_id>/cancel",
    methods=["PUT"]
)
def cancel_customer_order(order_id):

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return jsonify({"message": "Authorization token is required"}), 401

    if not auth_header.startswith("Bearer "):
        return jsonify({"message": "Invalid authorization format"}), 401

    token = auth_header.split(" ", 1)[1]
    connection = None
    cursor = None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload["user_id"]

        connection = get_db_connection()
        if not connection:
            return jsonify({"message": "Database connection failed"}), 500

        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, user_id, status
            FROM orders
            WHERE id = %s AND user_id = %s
        """, (order_id, user_id))

        order = cursor.fetchone()

        if not order:
            return jsonify({"message": "Order not found"}), 404

        current_status = str(order["status"] or "").strip()

        if current_status not in ["Pending", "Confirmed"]:
            return jsonify({
                "message": "This order cannot be cancelled",
                "status": current_status
            }), 400

        cursor.execute("""
            SELECT product_id, quantity
            FROM order_items
            WHERE order_id = %s
        """, (order_id,))

        order_items = cursor.fetchall()

        if not order_items:
            return jsonify({"message": "Order items not found"}), 400

        for item in order_items:
            cursor.execute("""
                UPDATE products
                SET stock = stock + %s
                WHERE id = %s
            """, (int(item["quantity"]), item["product_id"]))

            if cursor.rowcount == 0:
                connection.rollback()
                return jsonify({"message": "Unable to restore product stock"}), 400

        cursor.execute("""
            UPDATE orders
            SET status = 'Cancelled'
            WHERE id = %s AND user_id = %s
        """, (order_id, user_id))

        connection.commit()

        return jsonify({
            "message": "Order cancelled successfully",
            "order": {"id": order_id, "status": "Cancelled"}
        }), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 401

    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

    except mysql.connector.Error as error:
        if connection:
            connection.rollback()
        print("Cancel order MySQL error:", error)
        return jsonify({"message": "Unable to cancel order"}), 500

    except Exception as error:
        if connection:
            connection.rollback()
        print("Cancel order error:", error)
        return jsonify({"message": "Unable to cancel order"}), 500

    finally:
        close_db(connection, cursor)


# =========================================
# GET ALL ORDERS - ADMIN API
# =========================================

@app.route(
    "/api/admin/orders",
    methods=["GET"]
)
def get_admin_orders():

    auth_header = request.headers.get(
        "Authorization"
    )

    # =====================================
    # CHECK AUTHORIZATION HEADER
    # =====================================

    if not auth_header:

        return jsonify({
            "message":
                "Authorization token is required"
        }), 401


    if not auth_header.startswith("Bearer "):

        return jsonify({
            "message":
                "Invalid authorization format"
        }), 401


    token = auth_header.split(
        " ",
        1
    )[1]

    connection = None
    cursor = None


    try:

        # =================================
        # VERIFY JWT
        # =================================

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = payload["user_id"]


        # =================================
        # DATABASE CONNECTION
        # =================================

        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500


        cursor = connection.cursor(
            dictionary=True
        )


        # =================================
        # CHECK ADMIN ROLE
        # =================================

        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )

        current_user = cursor.fetchone()


        if not current_user:

            return jsonify({
                "message":
                    "User not found"
            }), 404


        if current_user["role"] != "admin":

            return jsonify({
                "message":
                    "Admin access required"
            }), 403


        # =================================
        # GET ALL ORDERS
        # =================================

        cursor.execute(
            """
            SELECT
                id,
                user_id,
                total_amount,
                status,
                created_at,
                customer_name,
                email,
                phone,
                address,
                city,
                state,
                pincode,
                payment_method
            FROM orders
            ORDER BY created_at DESC
            """
        )

        orders = cursor.fetchall()


        # =================================
        # GET ORDER ITEMS
        # =================================

        for order in orders:

            cursor.execute(
                """
                SELECT
                    oi.id,
                    oi.product_id,
                    oi.quantity,
                    oi.price,
                    p.name,
                    p.brand,
                    p.description,
                    p.image,
                    p.category
                FROM order_items oi
                JOIN products p
                    ON oi.product_id = p.id
                WHERE oi.order_id = %s
                ORDER BY oi.id ASC
                """,
                (order["id"],)
            )

            order["items"] = cursor.fetchall()


        # =================================
        # RESPONSE
        # =================================

        return jsonify({

            "message":
                "Admin orders fetched successfully",

            "orders":
                orders

        }), 200


    except jwt.ExpiredSignatureError:

        return jsonify({
            "message":
                "Token has expired"
        }), 401


    except jwt.InvalidTokenError:

        return jsonify({
            "message":
                "Invalid token"
        }), 401


    except mysql.connector.Error as error:

        print(
            "Get admin orders MySQL error:",
            error
        )

        return jsonify({

            "message":
                "Unable to fetch admin orders",

            "error":
                str(error)

        }), 500


    except Exception as error:

        print(
            "Get admin orders error:",
            error
        )

        return jsonify({

            "message":
                "Unable to fetch admin orders"

        }), 500


    finally:

        close_db(
            connection,
            cursor
        )


# =========================================
# GET SINGLE ORDER API
# =========================================

@app.route(
    "/api/orders/<int:order_id>",
    methods=["GET"]
)
def get_single_order(order_id):

    auth_header = request.headers.get(
        "Authorization"
    )


    if not auth_header:

        return jsonify({
            "message":
                "Authorization token is required"
        }), 401


    if not auth_header.startswith("Bearer "):

        return jsonify({
            "message":
                "Invalid authorization format"
        }), 401


    token = auth_header.split(" ", 1)[1]

    connection = None
    cursor = None


    try:

        # =================================
        # VERIFY JWT
        # =================================

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )


        user_id = payload["user_id"]


        # =================================
        # NEW MYSQL CONNECTION
        # =================================

        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500


        cursor = connection.cursor(
            dictionary=True
        )


        # =================================
        # GET ORDER
        # =================================

        cursor.execute(
            """
            SELECT

                id,

                user_id,

                total_amount,

                status,

                created_at,

                customer_name,

                email,

                phone,

                address,

                city,

                state,

                pincode,

                payment_method

            FROM orders

            WHERE id = %s

            AND user_id = %s
            """,
            (
                order_id,
                user_id
            )
        )


        order = cursor.fetchone()


        # =================================
        # ORDER NOT FOUND
        # =================================

        if not order:

            return jsonify({
                "message":
                    "Order not found"
            }), 404


        # =================================
        # GET ORDER ITEMS
        # =================================

        cursor.execute(
            """
            SELECT

                oi.id,

                oi.product_id,

                oi.quantity,

                oi.price,

                p.name,

                p.brand,

                p.description,

                p.image,

                p.category

            FROM order_items oi

            JOIN products p
                ON oi.product_id = p.id

            WHERE oi.order_id = %s

            ORDER BY oi.id ASC
            """,
            (order_id,)
        )


        order["items"] = cursor.fetchall()


        return jsonify({

            "message":
                "Order fetched successfully",

            "order":
                order

        }), 200


    except jwt.ExpiredSignatureError:

        return jsonify({
            "message":
                "Token has expired"
        }), 401


    except jwt.InvalidTokenError:

        return jsonify({
            "message":
                "Invalid token"
        }), 401


    except mysql.connector.Error as error:

        print(
            "Get single order MySQL error:",
            error
        )


        return jsonify({
            "message":
                "Unable to fetch order",
            "error":
                str(error)
        }), 500


    except Exception as error:

        print(
            "Get single order error:",
            error
        )


        return jsonify({
            "message":
                "Unable to fetch order"
        }), 500


    finally:

        close_db(
            connection,
            cursor
        )


# =========================================
# UPDATE ORDER STATUS API
# =========================================

@app.route(
    "/api/orders/<int:order_id>/status",
    methods=["PUT"]
)
def update_order_status(order_id):
    
    
    
    

    # =====================================
    # GET AUTHORIZATION HEADER
    # =====================================

    auth_header = request.headers.get(
        "Authorization"
    )


    if not auth_header:

        return jsonify({
            "message":
                "Authorization token is required"
        }), 401


    if not auth_header.startswith("Bearer "):

        return jsonify({
            "message":
                "Invalid authorization format"
        }), 401


    token = auth_header.split(" ", 1)[1]

    connection = None
    cursor = None


    try:

        # =================================
        # VERIFY JWT
        # =================================

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )


        user_id = payload["user_id"]


        # =================================
        # DATABASE CONNECTION
        # =================================

        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500


        cursor = connection.cursor(
            dictionary=True
        )


        # =================================
        # CHECK CURRENT USER
        # =================================

        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )


        current_user = cursor.fetchone()


        if not current_user:

            return jsonify({
                "message":
                    "User not found"
            }), 404


        # =================================
        # CHECK ADMIN ROLE
        # =================================

        if current_user["role"] != "admin":

            return jsonify({
                "message":
                    "Admin access required"
            }), 403


        # =================================
        # GET REQUEST DATA
        # =================================

        data = request.get_json() or {}


        new_status = str(
            data.get("status", "")
        ).strip()


        # =================================
        # ALLOWED STATUSES
        # =================================

        allowed_statuses = [

            "Pending",

            "Confirmed",

            "Shipped",

            "Out for Delivery",

            "Delivered",

            "Cancelled"

        ]


        if new_status not in allowed_statuses:

            return jsonify({

                "message":
                    "Invalid order status",

                "allowed_statuses":
                    allowed_statuses

            }), 400


        # =================================
        # CHECK ORDER
        # =================================

        # Lock the order row while checking/updating its status.
        # This prevents an already-cancelled order from being changed
        # by the admin, even if requests happen very close together.
        cursor.execute(
            """
            SELECT
                id,
                user_id,
                status
            FROM orders
            WHERE id = %s
            FOR UPDATE
            """,
            (order_id,)
        )


        order = cursor.fetchone()


        if not order:

            return jsonify({
                "message":
                    "Order not found"
            }), 404


        # =================================
        # PREVENT CHANGES AFTER CUSTOMER CANCELS
        # =================================

        if order["status"] == "Cancelled":

            connection.rollback()

            return jsonify({
                "message":
                    "This order has been cancelled by the customer and cannot be changed."
            }), 409


        # =================================
        # UPDATE ORDER STATUS
        # =================================

        cursor.execute(
            """
            UPDATE orders
            SET status = %s
            WHERE id = %s
            """,
            (
                new_status,
                order_id
            )
        )


        connection.commit()


        # =================================
        # RESPONSE
        # =================================

        return jsonify({

            "message":
                "Order status updated successfully",

            "order": {

                "id":
                    order_id,

                "status":
                    new_status

            }

        }), 200


    # =====================================
    # TOKEN EXPIRED
    # =====================================

    except jwt.ExpiredSignatureError:

        return jsonify({
            "message":
                "Token has expired"
        }), 401


    # =====================================
    # INVALID TOKEN
    # =====================================

    except jwt.InvalidTokenError:

        return jsonify({
            "message":
                "Invalid token"
        }), 401


    # =====================================
    # MYSQL ERROR
    # =====================================

    except mysql.connector.Error as error:

        if connection:

            connection.rollback()


        print(
            "Update order status MySQL error:",
            error
        )


        return jsonify({

            "message":
                "Unable to update order status",

            "error":
                str(error)

        }), 500


    # =====================================
    # OTHER ERROR
    # =====================================

    except Exception as error:

        if connection:

            connection.rollback()


        print(
            "Update order status error:",
            error
        )


        return jsonify({

            "message":
                "Unable to update order status"

        }), 500


    # =====================================
    # CLOSE DATABASE
    # =====================================

    finally:

        close_db(
            connection,
            cursor
        )
# =========================================
# ADMIN - CREATE PRODUCT API
# =========================================

@app.route(
    "/api/admin/products",
    methods=["POST"]
)
def admin_create_product():

    auth_header = request.headers.get(
        "Authorization"
    )

    if not auth_header:

        return jsonify({
            "message":
                "Authorization token is required"
        }), 401

    if not auth_header.startswith("Bearer "):

        return jsonify({
            "message":
                "Invalid authorization format"
        }), 401

    token = auth_header.split(
        " ",
        1
    )[1]

    connection = None
    cursor = None

    try:

        # =================================
        # VERIFY JWT
        # =================================

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = payload["user_id"]


        # =================================
        # DATABASE
        # =================================

        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500


        cursor = connection.cursor(
            dictionary=True
        )


        # =================================
        # CHECK ADMIN
        # =================================

        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )

        user = cursor.fetchone()


        if not user:

            return jsonify({
                "message":
                    "User not found"
            }), 404


        if user["role"] != "admin":

            return jsonify({
                "message":
                    "Admin access required"
            }), 403


        # =================================
        # GET PRODUCT DATA
        # =================================

        data = request.get_json() or {}


        name = str(
            data.get("name", "")
        ).strip()


        brand = str(
            data.get("brand", "")
        ).strip()


        price = data.get("price")


        description = str(
            data.get(
                "description",
                ""
            )
        ).strip()


        image = str(
            data.get(
                "image",
                ""
            )
        ).strip()


        category = str(
            data.get(
                "category",
                ""
            )
        ).strip()

        stock = data.get("stock")


        # =================================
        # VALIDATION
        # =================================

        if not name:

            return jsonify({
                "message":
                    "Product name is required"
            }), 400


        if not brand:

            return jsonify({
                "message":
                    "Brand is required"
            }), 400


        if price is None or price == "":

            return jsonify({
                "message":
                    "Price is required"
            }), 400


        try:

            price = float(price)

        except (TypeError, ValueError):

            return jsonify({
                "message":
                    "Price must be a valid number"
            }), 400


        if price < 0:

            return jsonify({
                "message":
                    "Price cannot be negative"
            }), 400


        if not category:

            return jsonify({
                "message":
                    "Category is required"
            }), 400


        if stock is None or stock == "":
            return jsonify({
                "message":
                    "Stock quantity is required"
            }), 400

        try:
            stock = int(stock)
        except (TypeError, ValueError):
            return jsonify({
                "message":
                    "Stock quantity must be a valid number"
            }), 400

        if stock < 0:
            return jsonify({
                "message":
                    "Stock quantity cannot be negative"
            }), 400

        # =================================
        # INSERT PRODUCT
        # =================================

        cursor.execute(
            """
            INSERT INTO products
            (
                name,
                brand,
                price,
                description,
                image,
                category,
                stock
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
            """,
            (
                name,
                brand,
                price,
                description,
                image,
                category,
                stock
            )
        )


        product_id = cursor.lastrowid


        connection.commit()


        # =================================
        # RESPONSE
        # =================================

        return jsonify({

            "message":
                "Product created successfully",

            "product": {

                "id":
                    product_id,

                "name":
                    name,

                "brand":
                    brand,

                "price":
                    price,

                "description":
                    description,

                "image":
                    image,

                "category":
                    category,

                "stock":
                    stock

            }

        }), 201


    except jwt.ExpiredSignatureError:

        return jsonify({
            "message":
                "Token has expired"
        }), 401


    except jwt.InvalidTokenError:

        return jsonify({
            "message":
                "Invalid token"
        }), 401


    except mysql.connector.Error as error:

        if connection:

            connection.rollback()


        print(
            "Admin create product MySQL error:",
            error
        )


        return jsonify({

            "message":
                "Unable to create product",

            "error":
                str(error)

        }), 500


    except Exception as error:

        if connection:

            connection.rollback()


        print(
            "Admin create product error:",
            error
        )


        return jsonify({

            "message":
                "Unable to create product",

            "error":
                str(error)

        }), 500


    finally:

        close_db(
            connection,
            cursor
        )
        
        # =========================================
# UPDATE PRODUCT - ADMIN
# =========================================

@app.route(
    "/api/admin/products/<int:product_id>",
    methods=["PUT"]
)
def update_product(product_id):

    auth_header = request.headers.get("Authorization")

    # =====================================
    # CHECK AUTHORIZATION HEADER
    # =====================================

    if not auth_header:
        return jsonify({
            "message": "Authorization token is required"
        }), 401

    if not auth_header.startswith("Bearer "):
        return jsonify({
            "message": "Invalid authorization format"
        }), 401

    token = auth_header.split(" ", 1)[1]

    connection = None
    cursor = None

    try:

        # =================================
        # VERIFY JWT
        # =================================

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = payload["user_id"]

        # =================================
        # DATABASE CONNECTION
        # =================================

        connection = get_db_connection()

        if not connection:
            return jsonify({
                "message": "Database connection failed"
            }), 500

        cursor = connection.cursor(
            dictionary=True
        )

        # =================================
        # CHECK CURRENT USER
        # =================================

        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )

        current_user = cursor.fetchone()

        if not current_user:
            return jsonify({
                "message": "User not found"
            }), 404

        # =================================
        # CHECK ADMIN ROLE
        # =================================

        if current_user["role"] != "admin":
            return jsonify({
                "message": "Admin access required"
            }), 403

        # =================================
        # GET REQUEST DATA
        # =================================

        data = request.get_json() or {}

        name = str(
            data.get("name", "")
        ).strip()

        brand = str(
            data.get("brand", "")
        ).strip()

        description = str(
            data.get("description", "")
        ).strip()

        image = str(
            data.get("image", "")
        ).strip()

        category = str(
            data.get("category", "")
        ).strip()

        price = data.get("price")
        stock = data.get("stock")

        # =================================
        # VALIDATION
        # =================================

        if not name:
            return jsonify({
                "message": "Product name is required"
            }), 400

        if not brand:
            return jsonify({
                "message": "Product brand is required"
            }), 400

        if price is None:
            return jsonify({
                "message": "Product price is required"
            }), 400

        try:
            price = float(price)
        except (ValueError, TypeError):
            return jsonify({
                "message": "Invalid product price"
            }), 400
        
        if stock is None or stock == "":
            return jsonify({
                "message": "Stock quantity is required"
            }), 400

        try:
            stock = int(stock)
        except (ValueError, TypeError):
            return jsonify({
                "message": "Stock quantity must be a valid number"
            }), 400

        if stock < 0:
            return jsonify({
                "message": "Stock quantity cannot be negative"
            }), 400


        # =================================
        # CHECK PRODUCT
        # =================================

        cursor.execute(
            """
            SELECT id
            FROM products
            WHERE id = %s
            """,
            (product_id,)
        )

        product = cursor.fetchone()

        if not product:
            return jsonify({
                "message": "Product not found"
            }), 404

        # =================================
        # UPDATE PRODUCT
        # =================================

        cursor.execute(
            """
            UPDATE products
            SET
                name = %s,
                brand = %s,
                price = %s,
                description = %s,
                image = %s,
                category = %s,
                stock = %s
            WHERE id = %s
            """,
            (
                name,
                brand,
                price,
                description,
                image,
                category,
                stock,
                product_id
            )
        )

        connection.commit()

        # =================================
        # RESPONSE
        # =================================

        return jsonify({
            "message": "Product updated successfully",
            "product": {
                "id": product_id,
                "name": name,
                "brand": brand,
                "price": price,
                "description": description,
                "image": image,
                "category": category,
                "stock": stock
            }
        }), 200

    # =====================================
    # TOKEN EXPIRED
    # =====================================

    except jwt.ExpiredSignatureError:

        return jsonify({
            "message": "Token has expired"
        }), 401

    # =====================================
    # INVALID TOKEN
    # =====================================

    except jwt.InvalidTokenError:

        return jsonify({
            "message": "Invalid token"
        }), 401

    # =====================================
    # MYSQL ERROR
    # =====================================

    except mysql.connector.Error as error:

        if connection:
            connection.rollback()

        print(
            "Update product MySQL error:",
            error
        )

        return jsonify({
            "message": "Unable to update product",
            "error": str(error)
        }), 500

    # =====================================
    # OTHER ERROR
    # =====================================

    except Exception as error:

        if connection:
            connection.rollback()

        print(
            "Update product error:",
            error
        )

        return jsonify({
            "message": "Unable to update product"
        }), 500

    # =====================================
    # CLOSE DATABASE
    # =====================================

    finally:

        close_db(
            connection,
            cursor
        )
# =========================================
# DELETE PRODUCT - ADMIN
# =========================================

@app.route(
    "/api/admin/products/<int:product_id>",
    methods=["DELETE"]
)
def delete_product(product_id):

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return jsonify({
            "message": "Authorization token is required"
        }), 401

    if not auth_header.startswith("Bearer "):
        return jsonify({
            "message": "Invalid authorization format"
        }), 401

    token = auth_header.split(" ", 1)[1]

    connection = None
    cursor = None

    try:

        # VERIFY TOKEN
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = payload["user_id"]

        # DATABASE
        connection = get_db_connection()

        if not connection:
            return jsonify({
                "message": "Database connection failed"
            }), 500

        cursor = connection.cursor(
            dictionary=True
        )

        # CHECK ADMIN
        cursor.execute(
            """
            SELECT role
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "message": "User not found"
            }), 404

        if user["role"] != "admin":
            return jsonify({
                "message": "Admin access required"
            }), 403

        # CHECK PRODUCT
        cursor.execute(
            """
            SELECT id, name
            FROM products
            WHERE id = %s
            """,
            (product_id,)
        )

        product = cursor.fetchone()

        if not product:
            return jsonify({
                "message": "Product not found"
            }), 404

        # DELETE PRODUCT
        cursor.execute(
            """
            DELETE FROM products
            WHERE id = %s
            """,
            (product_id,)
        )

        connection.commit()

        return jsonify({
            "message": "Product deleted successfully",
            "product_id": product_id
        }), 200

    except jwt.ExpiredSignatureError:

        return jsonify({
            "message": "Token has expired"
        }), 401

    except jwt.InvalidTokenError:

        return jsonify({
            "message": "Invalid token"
        }), 401

    except mysql.connector.Error as error:

        if connection:
            connection.rollback()

        print(
            "Delete product MySQL error:",
            error
        )

        return jsonify({
            "message": "Unable to delete product",
            "error": str(error)
        }), 500

    except Exception as error:

        if connection:
            connection.rollback()

        print(
            "Delete product error:",
            error
        )

        return jsonify({
            "message": "Unable to delete product"
        }), 500

    finally:

        close_db(
            connection,
            cursor
        )
# =========================================
# ADMIN DASHBOARD STATISTICS API
# =========================================

@app.route(
    "/api/admin/dashboard-stats",
    methods=["GET"]
)
def admin_dashboard_stats():

    auth_header = request.headers.get(
        "Authorization"
    )

    # =====================================
    # CHECK AUTHORIZATION
    # =====================================

    if not auth_header:

        return jsonify({
            "message":
                "Authorization token is required"
        }), 401

    if not auth_header.startswith("Bearer "):

        return jsonify({
            "message":
                "Invalid authorization format"
        }), 401

    token = auth_header.split(
        " ",
        1
    )[1]

    connection = None
    cursor = None

    try:

        # =================================
        # VERIFY JWT
        # =================================

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = payload["user_id"]

        # =================================
        # DATABASE CONNECTION
        # =================================

        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500

        cursor = connection.cursor(
            dictionary=True
        )

        # =================================
        # CHECK ADMIN ROLE
        # =================================

        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )

        current_user = cursor.fetchone()

        if not current_user:

            return jsonify({
                "message":
                    "User not found"
            }), 404

        if current_user["role"] != "admin":

            return jsonify({
                "message":
                    "Admin access required"
            }), 403

        # =================================
        # TOTAL PRODUCTS
        # =================================

        cursor.execute(
            """
            SELECT COUNT(*) AS total_products
            FROM products
            """
        )

        products_result = cursor.fetchone()

        total_products = (
            products_result["total_products"]
        )

        # =================================
        # TOTAL CUSTOMERS
        # =================================

        cursor.execute(
            """
            SELECT COUNT(*) AS total_customers
            FROM users
            WHERE role = 'customer'
            """
        )

        customers_result = cursor.fetchone()

        total_customers = (
            customers_result["total_customers"]
        )

        # =================================
        # TOTAL ADMINS
        # =================================

        cursor.execute(
            """
            SELECT COUNT(*) AS total_admins
            FROM users
            WHERE role = 'admin'
            """
        )

        admins_result = cursor.fetchone()

        total_admins = (
            admins_result["total_admins"]
        )

        # =================================
        # TOTAL ORDERS
        # =================================

        cursor.execute(
            """
            SELECT COUNT(*) AS total_orders
            FROM orders
            """
        )

        orders_result = cursor.fetchone()

        total_orders = (
            orders_result["total_orders"]
        )

        # =================================
        # TOTAL REVENUE
        # Exclude cancelled orders
        # =================================

        cursor.execute(
            """
            SELECT
                COALESCE(
                    SUM(total_amount),
                    0
                ) AS total_revenue
            FROM orders
            WHERE status != 'Cancelled'
            """
        )

        revenue_result = cursor.fetchone()

        total_revenue = float(
            revenue_result["total_revenue"]
            or 0
        )

        # =================================
        # RESPONSE
        # =================================

        return jsonify({

            "message":
                "Dashboard statistics fetched successfully",

            "stats": {

                "products":
                    total_products,

                "customers":
                    total_customers,

                "admins":
                    total_admins,

                "orders":
                    total_orders,

                "revenue":
                    total_revenue

            }

        }), 200

    # =====================================
    # TOKEN EXPIRED
    # =====================================

    except jwt.ExpiredSignatureError:

        return jsonify({
            "message":
                "Token has expired"
        }), 401

    # =====================================
    # INVALID TOKEN
    # =====================================

    except jwt.InvalidTokenError:

        return jsonify({
            "message":
                "Invalid token"
        }), 401

    # =====================================
    # MYSQL ERROR
    # =====================================

    except mysql.connector.Error as error:

        print(
            "Admin dashboard MySQL error:",
            error
        )

        return jsonify({

            "message":
                "Unable to fetch dashboard statistics",

            "error":
                str(error)

        }), 500

    # =====================================
    # OTHER ERROR
    # =====================================

    except Exception as error:

        print(
            "Admin dashboard error:",
            error
        )

        return jsonify({

            "message":
                "Unable to fetch dashboard statistics"

        }), 500

    # =====================================
    # CLOSE DATABASE
    # =====================================

    finally:

        close_db(
            connection,
            cursor
        )
# =========================================
# ADMIN - GET ALL CUSTOMERS API
# =========================================

@app.route(
    "/api/admin/customers",
    methods=["GET"]
)
def get_admin_customers():

    auth_header = request.headers.get(
        "Authorization"
    )

    # =====================================
    # CHECK AUTHORIZATION
    # =====================================

    if not auth_header:

        return jsonify({
            "message":
                "Authorization token is required"
        }), 401

    if not auth_header.startswith("Bearer "):

        return jsonify({
            "message":
                "Invalid authorization format"
        }), 401

    token = auth_header.split(
        " ",
        1
    )[1]

    connection = None
    cursor = None

    try:

        # =================================
        # VERIFY JWT
        # =================================

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = payload["user_id"]

        # =================================
        # DATABASE
        # =================================

        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500

        cursor = connection.cursor(
            dictionary=True
        )

        # =================================
        # CHECK ADMIN
        # =================================

        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )

        current_user = cursor.fetchone()

        if not current_user:

            return jsonify({
                "message":
                    "User not found"
            }), 404

        if current_user["role"] != "admin":

            return jsonify({
                "message":
                    "Admin access required"
            }), 403

        # =================================
        # GET ALL CUSTOMERS
        # =================================

        cursor.execute(
            """
            SELECT
                u.id,
                u.name,
                u.email,
                u.role,
                COUNT(o.id) AS total_orders
            FROM users u
            LEFT JOIN orders o
                ON u.id = o.user_id
            WHERE u.role = 'customer'
            GROUP BY
                u.id,
                u.name,
                u.email,
                u.role
            ORDER BY u.id DESC
            """
        )

        customers = cursor.fetchall()

        # =================================
        # RESPONSE
        # =================================

        return jsonify({

            "message":
                "Customers fetched successfully",

            "customers":
                customers

        }), 200

    except jwt.ExpiredSignatureError:

        return jsonify({
            "message":
                "Token has expired"
        }), 401

    except jwt.InvalidTokenError:

        return jsonify({
            "message":
                "Invalid token"
        }), 401

    except mysql.connector.Error as error:

        print(
            "Admin customers MySQL error:",
            error
        )

        return jsonify({

            "message":
                "Unable to fetch customers",

            "error":
                str(error)

        }), 500

    except Exception as error:

        print(
            "Admin customers error:",
            error
        )

        return jsonify({

            "message":
                "Unable to fetch customers"

        }), 500

    finally:

        close_db(
            connection,
            cursor
        )
        # =========================================
# ADMIN - DELETE CUSTOMER API
# =========================================

@app.route(
    "/api/admin/customers/<int:customer_id>",
    methods=["DELETE"]
)
def delete_admin_customer(customer_id):

    auth_header = request.headers.get(
        "Authorization"
    )

    # =====================================
    # CHECK AUTHORIZATION
    # =====================================

    if not auth_header:

        return jsonify({
            "message":
                "Authorization token is required"
        }), 401

    if not auth_header.startswith("Bearer "):

        return jsonify({
            "message":
                "Invalid authorization format"
        }), 401

    token = auth_header.split(
        " ",
        1
    )[1]

    connection = None
    cursor = None

    try:

        # =================================
        # VERIFY JWT
        # =================================

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        admin_id = payload["user_id"]

        # =================================
        # DATABASE
        # =================================

        connection = get_db_connection()

        if not connection:

            return jsonify({
                "message":
                    "Database connection failed"
            }), 500

        cursor = connection.cursor(
            dictionary=True
        )

        # =================================
        # CHECK ADMIN
        # =================================

        cursor.execute(
            """
            SELECT id, role
            FROM users
            WHERE id = %s
            """,
            (admin_id,)
        )

        current_user = cursor.fetchone()

        if not current_user:

            return jsonify({
                "message":
                    "User not found"
            }), 404

        if current_user["role"] != "admin":

            return jsonify({
                "message":
                    "Admin access required"
            }), 403

        # =================================
        # CHECK CUSTOMER
        # =================================

        cursor.execute(
            """
            SELECT id, name, email, role
            FROM users
            WHERE id = %s
            """,
            (customer_id,)
        )

        customer = cursor.fetchone()

        if not customer:

            return jsonify({
                "message":
                    "Customer not found"
            }), 404

        if customer["role"] != "customer":

            return jsonify({
                "message":
                    "Only customer accounts can be deleted"
            }), 400

        # =================================
        # DELETE CUSTOMER
        # =================================

        cursor.execute(
            """
            DELETE FROM users
            WHERE id = %s
            AND role = 'customer'
            """,
            (customer_id,)
        )

        if cursor.rowcount == 0:

            return jsonify({
                "message":
                    "Customer not found"
            }), 404

        connection.commit()

        return jsonify({
            "message":
                "Customer deleted successfully"
        }), 200

    except jwt.ExpiredSignatureError:

        return jsonify({
            "message":
                "Token has expired"
        }), 401

    except jwt.InvalidTokenError:

        return jsonify({
            "message":
                "Invalid token"
        }), 401

    except mysql.connector.Error as error:

        if connection:
            connection.rollback()

        print(
            "Delete customer MySQL error:",
            error
        )

        return jsonify({
            "message":
                "Unable to delete customer"
        }), 500

    except Exception as error:

        if connection:
            connection.rollback()

        print(
            "Delete customer error:",
            error
        )

        return jsonify({
            "message":
                "Unable to delete customer"
        }), 500

    finally:

        close_db(
            connection,
            cursor
        )
# =========================================  
# START SERVER
# =========================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )