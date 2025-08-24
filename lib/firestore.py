import firebase_admin
from firebase_admin import credentials, firestore

def InitializeDB(account_key_path):
    if account_key_path and os.path.exists(account_key_path):
        cred = credentials.Certificate(account_key_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firebase initialized using service account key.")
        return db
    # Attempt to initialize with default credentials (for Cloud Run default service account)
    try:
        firebase_admin.initialize_app()
        db = firestore.client()
        print("Firebase initialized using default credentials.")
    except Exception as e:
        print(f"Warning: Could not initialize Firebase with default credentials: {e}")
        print("Running without Firestore. Subscription feature will not work.")
        db = None # Set db to None if initialization fails
    return db