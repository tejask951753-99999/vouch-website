from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path

app = FastAPI()

# ====================================================
# JSON STORAGE FILE
# ====================================================
DATA_FILE = "vouches.json"

# Create file if missing
if not Path(DATA_FILE).exists():
    with open(DATA_FILE, "w") as f:
        json.dump([], f)

def load_vouches():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_vouches(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

# ====================================================
# ALLOW WEBSITE TO READ API
# ====================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================================================
# RECEIVE VOUCH FROM DISCORD BOT
# ====================================================
@app.post("/vouch")
async def save_vouch(vouch: dict):

    # vouch dict is EXACTLY what your bot sends
    data = load_vouches()
    data.insert(0, vouch)  # save newest first
    save_vouches(data)

    return {"status": "ok", "saved": True, "total": len(data)}

# ====================================================
# RETURN ALL VOUCHES FOR JAVASCRIPT WEBSITE
# ====================================================
@app.get("/vouches")
async def get_vouches():
    return load_vouches()

# ====================================================
# TEST ROUTE
# ====================================================
@app.get("/")
async def home():
    return {"message": "Vouch API running", "routes": ["/vouch", "/vouches"]}
