import sys
import os
import shutil

# Add root directory to sys.path so backend modules can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Handle SQLite DB path on read-only Vercel serverless filesystem
db_path = "/tmp/pharma_qms.db"
orig_db = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "pharma_qms.db")
if not os.path.exists(db_path) and os.path.exists(orig_db):
    try:
        shutil.copy2(orig_db, db_path)
    except Exception as e:
        print(f"Failed to copy database to /tmp: {e}")

os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

from backend.main import app
